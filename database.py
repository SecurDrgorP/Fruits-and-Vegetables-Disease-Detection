import sqlite3
import json
from datetime import datetime
from typing import List, Optional, Dict
import os

class PredictionDatabase:
    def __init__(self, db_path: str = "predictions.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create predictions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME NOT NULL,
                model_name TEXT NOT NULL,
                predicted_class TEXT NOT NULL,
                confidence REAL NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                file_type TEXT NOT NULL,
                image_data TEXT,
                heatmap_data TEXT
            )
        ''')
        
        # Create disease_info table for the disease guide
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS disease_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                disease_name TEXT NOT NULL UNIQUE,
                description TEXT NOT NULL,
                symptoms TEXT NOT NULL,
                causes TEXT NOT NULL,
                treatment TEXT NOT NULL,
                prevention TEXT NOT NULL,
                severity_level TEXT NOT NULL,
                affected_plants TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
        
        # Populate disease info if empty
        self.populate_disease_info()
        
        # Fix any existing data issues
        self.fix_existing_data()
    
    def save_prediction(self, model_name: str, predicted_class: str, confidence: float,
                       file_name: str, file_size: int, file_type: str,
                       image_data: Optional[str] = None, heatmap_data: Optional[str] = None) -> int:
        """Save a prediction to the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Ensure confidence is a float
        try:
            confidence = float(confidence)
        except (ValueError, TypeError):
            confidence = 0.0
        
        cursor.execute('''
            INSERT INTO predictions 
            (timestamp, model_name, predicted_class, confidence, file_name, file_size, file_type, image_data, heatmap_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (datetime.now(), model_name, predicted_class, confidence, file_name, file_size, file_type, image_data, heatmap_data))
        
        prediction_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return prediction_id
    
    def get_prediction_history(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get prediction history with pagination"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, timestamp, model_name, predicted_class, confidence, file_name, file_size, file_type
            FROM predictions
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        results = []
        for row in cursor.fetchall():
            row_dict = dict(row)
            # Ensure confidence is a float
            if isinstance(row_dict['confidence'], (bytes, str)):
                try:
                    row_dict['confidence'] = float(row_dict['confidence'])
                except (ValueError, TypeError):
                    row_dict['confidence'] = 0.0
            elif row_dict['confidence'] is None:
                row_dict['confidence'] = 0.0
            results.append(row_dict)
        
        conn.close()
        return results
    
    def get_prediction_by_id(self, prediction_id: int) -> Optional[Dict]:
        """Get a specific prediction by ID"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM predictions WHERE id = ?
        ''', (prediction_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            row_dict = dict(result)
            # Ensure confidence is a float
            if isinstance(row_dict['confidence'], (bytes, str)):
                try:
                    row_dict['confidence'] = float(row_dict['confidence'])
                except (ValueError, TypeError):
                    row_dict['confidence'] = 0.0
            elif row_dict['confidence'] is None:
                row_dict['confidence'] = 0.0
            return row_dict
        return None
    
    def get_prediction_statistics(self) -> Dict:
        """Get statistics about predictions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total predictions
        cursor.execute('SELECT COUNT(*) FROM predictions')
        total_predictions = cursor.fetchone()[0]
        
        # Most common diseases
        cursor.execute('''
            SELECT predicted_class, COUNT(*) as count
            FROM predictions
            GROUP BY predicted_class
            ORDER BY count DESC
            LIMIT 5
        ''')
        common_diseases = cursor.fetchall()
        
        # Average confidence
        cursor.execute('SELECT AVG(CAST(confidence AS REAL)) FROM predictions')
        avg_confidence = cursor.fetchone()[0] or 0
        
        # Predictions by model
        cursor.execute('''
            SELECT model_name, COUNT(*) as count
            FROM predictions
            GROUP BY model_name
        ''')
        predictions_by_model = cursor.fetchall()
        
        # Recent predictions (last 7 days)
        cursor.execute('''
            SELECT COUNT(*) FROM predictions
            WHERE timestamp >= datetime('now', '-7 days')
        ''')
        recent_predictions = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_predictions': total_predictions,
            'common_diseases': common_diseases,
            'avg_confidence': round(float(avg_confidence), 2),
            'predictions_by_model': predictions_by_model,
            'recent_predictions': recent_predictions
        }
    
    def get_disease_info(self, disease_name: Optional[str] = None) -> List[Dict]:
        """Get disease information"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if disease_name:
            cursor.execute('SELECT * FROM disease_info WHERE disease_name LIKE ?', (f'%{disease_name}%',))
        else:
            cursor.execute('SELECT * FROM disease_info ORDER BY disease_name')
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return results
    
    def populate_disease_info(self):
        """Populate the disease info table with initial data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if already populated
        cursor.execute('SELECT COUNT(*) FROM disease_info')
        if cursor.fetchone()[0] > 0:
            conn.close()
            return
        
        disease_data = [
            ("Apple - Rotten", "Rot in apples caused by various fungal and bacterial pathogens", 
             "Brown spots, soft texture, unpleasant odor", "Fungal/bacterial infection, improper storage",
             "Remove affected parts, improve storage conditions", "Proper harvesting, good storage practices",
             "Medium", "Apple"),
            ("Apple - Blotch", "Sooty blotch and flyspeck disease complex",
             "Dark, sooty patches on fruit surface", "Fungal pathogens in humid conditions",
             "Fungicide application, improve air circulation", "Pruning for airflow, preventive spraying",
             "Low", "Apple"),
            ("Apple - Scab", "Common fungal disease affecting leaves and fruit",
             "Olive-green to black spots on leaves and fruit", "Fungal infection (Venturia inaequalis)",
             "Fungicide treatment, resistant varieties", "Good sanitation, resistant cultivars",
             "High", "Apple"),
            ("Citrus - Black-Spot", "Fungal disease causing dark spots",
             "Black or dark brown spots on fruit and leaves", "Fungal infection in warm, humid conditions",
             "Copper-based fungicides, improve drainage", "Proper spacing, avoid overhead irrigation",
             "Medium", "Citrus"),
            ("Citrus - Canker", "Bacterial disease causing lesions",
             "Raised, corky lesions on fruit, leaves, and twigs", "Bacterial infection (Xanthomonas citri)",
             "Copper sprays, remove infected plant parts", "Windbreaks, avoid overhead watering",
             "High", "Citrus"),
            ("Tomato - Rotten", "Various rot diseases in tomatoes",
             "Soft, watery spots, foul odor", "Bacterial or fungal infection",
             "Remove affected fruits, improve ventilation", "Proper watering, good air circulation",
             "Medium", "Tomato"),
            ("Olive - Anthracnose", "Fungal disease affecting olives",
             "Dark, sunken spots on fruit", "Fungal infection in wet conditions",
             "Fungicide application, prune for airflow", "Resistant varieties, proper pruning",
             "Medium", "Olive")
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO disease_info 
            (disease_name, description, symptoms, causes, treatment, prevention, severity_level, affected_plants)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', disease_data)
        
        conn.commit()
        conn.close()

    def fix_existing_data(self):
        """Fix any existing data with incorrect data types"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get all predictions
        cursor.execute('SELECT id, confidence FROM predictions')
        predictions = cursor.fetchall()
        
        # Fix confidence values
        for pred_id, confidence in predictions:
            if isinstance(confidence, (bytes, str)):
                try:
                    fixed_confidence = float(confidence)
                except (ValueError, TypeError):
                    fixed_confidence = 0.0
                
                cursor.execute('UPDATE predictions SET confidence = ? WHERE id = ?', 
                             (fixed_confidence, pred_id))
        
        conn.commit()
        conn.close()

# Global database instance
db = PredictionDatabase()
