#!/usr/bin/env python3
"""
Database cleanup script to fix confidence data type issues
"""

import sqlite3
import os
import sys

def clean_database():
    """Clean up the database and fix data type issues"""
    
    db_path = "predictions.db"
    
    if not os.path.exists(db_path):
        print("Database does not exist yet.")
        return
    
    print("Cleaning database...")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check the current schema
        cursor.execute("PRAGMA table_info(predictions)")
        columns = cursor.fetchall()
        print("Current table schema:")
        for col in columns:
            print(f"  {col}")
        
        # Get all predictions with their confidence values
        cursor.execute("SELECT id, confidence FROM predictions")
        predictions = cursor.fetchall()
        
        print(f"Found {len(predictions)} predictions to check...")
        
        fixed_count = 0
        for pred_id, confidence in predictions:
            # Check if confidence is not a proper number
            if confidence is None:
                cursor.execute("UPDATE predictions SET confidence = ? WHERE id = ?", (0.0, pred_id))
                fixed_count += 1
            else:
                try:
                    # Try to convert to float
                    float_confidence = float(confidence)
                    # Update with proper float value
                    cursor.execute("UPDATE predictions SET confidence = ? WHERE id = ?", (float_confidence, pred_id))
                except (ValueError, TypeError) as e:
                    print(f"Fixing prediction {pred_id} with invalid confidence: {confidence}")
                    cursor.execute("UPDATE predictions SET confidence = ? WHERE id = ?", (0.0, pred_id))
                    fixed_count += 1
        
        conn.commit()
        print(f"Fixed {fixed_count} confidence values")
        
        # Verify the fix
        cursor.execute("SELECT COUNT(*) FROM predictions WHERE confidence IS NULL OR confidence = ''")
        null_count = cursor.fetchone()[0]
        
        if null_count == 0:
            print("✅ All confidence values are now properly formatted")
        else:
            print(f"⚠️  Still have {null_count} null/empty confidence values")
        
        conn.close()
        
    except Exception as e:
        print(f"Error cleaning database: {e}")
        return False
    
    return True

if __name__ == "__main__":
    if clean_database():
        print("Database cleanup completed successfully!")
    else:
        print("Database cleanup failed!")
        sys.exit(1)
