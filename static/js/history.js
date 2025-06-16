// History page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize history page
    initializeHistory();
});

function initializeHistory() {
    // Load statistics periodically
    loadStatistics();
    setInterval(loadStatistics, 30000); // Update every 30 seconds
}

async function loadStatistics() {
    try {
        const response = await fetch('/api/statistics');
        const stats = await response.json();
        updateStatisticsDisplay(stats);
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function updateStatisticsDisplay(stats) {
    // Update statistics cards if elements exist
    const elements = {
        totalPredictions: document.querySelector('.stat-card:nth-child(1) h3'),
        avgConfidence: document.querySelector('.stat-card:nth-child(2) h3'),
        recentPredictions: document.querySelector('.stat-card:nth-child(3) h3'),
        mostCommon: document.querySelector('.stat-card:nth-child(4) h3')
    };
    
    if (elements.totalPredictions) {
        elements.totalPredictions.textContent = stats.total_predictions;
    }
    if (elements.avgConfidence) {
        elements.avgConfidence.textContent = `${stats.avg_confidence}%`;
    }
    if (elements.recentPredictions) {
        elements.recentPredictions.textContent = stats.recent_predictions;
    }
    if (elements.mostCommon && stats.common_diseases.length > 0) {
        elements.mostCommon.textContent = stats.common_diseases[0][1];
    }
}

async function viewPrediction(predictionId) {
    try {
        const response = await fetch(`/history/${predictionId}`);
        const prediction = await response.json();
        
        if (prediction.error) {
            alert('Prediction not found');
            return;
        }
        
        showPredictionModal(prediction);
    } catch (error) {
        console.error('Error loading prediction:', error);
        alert('Error loading prediction details');
    }
}

function showPredictionModal(prediction) {
    const modal = document.getElementById('predictionModal');
    const modalBody = document.getElementById('modalBody');
    
    const modalContent = `
        <div class="prediction-detail">
            <div class="detail-images">
                ${prediction.image_data ? `
                    <div class="image-section">
                        <h4>Original Image</h4>
                        <img src="${prediction.image_data}" alt="Original image" class="detail-image">
                    </div>
                ` : ''}
                ${prediction.heatmap_data ? `
                    <div class="image-section">
                        <h4>Heatmap Analysis</h4>
                        <img src="${prediction.heatmap_data}" alt="Heatmap analysis" class="detail-image">
                    </div>
                ` : ''}
            </div>
            
            <div class="detail-info">
                <div class="info-row">
                    <span class="label">Date:</span>
                    <span class="value">${new Date(prediction.timestamp).toLocaleString()}</span>
                </div>
                <div class="info-row">
                    <span class="label">Model:</span>
                    <span class="value">${prediction.model_name}</span>
                </div>
                <div class="info-row">
                    <span class="label">Prediction:</span>
                    <span class="value">${prediction.predicted_class}</span>
                </div>
                <div class="info-row">
                    <span class="label">Confidence:</span>
                    <span class="value">${prediction.confidence.toFixed(2)}%</span>
                </div>
                <div class="info-row">
                    <span class="label">File Name:</span>
                    <span class="value">${prediction.file_name}</span>
                </div>
                <div class="info-row">
                    <span class="label">File Size:</span>
                    <span class="value">${formatFileSize(prediction.file_size)}</span>
                </div>
                <div class="info-row">
                    <span class="label">File Type:</span>
                    <span class="value">${prediction.file_type}</span>
                </div>
            </div>
            
            <div class="detail-actions">
                <button class="btn-download" onclick="downloadPredictionImages(${prediction.id})">
                    Download Images
                </button>
                <button class="btn-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = modalContent;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('predictionModal');
    modal.style.display = 'none';
}

function downloadPredictionImages(predictionId) {
    // Implementation for downloading prediction images
    window.open(`/api/prediction/${predictionId}/download`, '_blank');
}

async function deletePrediction(predictionId) {
    if (!confirm('Are you sure you want to delete this prediction?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/prediction/${predictionId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove row from table
            const row = document.querySelector(`[data-id="${predictionId}"]`);
            if (row) {
                row.remove();
            }
            
            // Reload statistics
            loadStatistics();
        } else {
            alert('Error deleting prediction');
        }
    } catch (error) {
        console.error('Error deleting prediction:', error);
        alert('Error deleting prediction');
    }
}

async function clearHistory() {
    if (!confirm('Are you sure you want to clear all prediction history? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/history/clear', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Reload the page
            window.location.reload();
        } else {
            alert('Error clearing history');
        }
    } catch (error) {
        console.error('Error clearing history:', error);
        alert('Error clearing history');
    }
}

function exportHistory() {
    // Implementation for exporting history
    window.open('/api/history/export', '_blank');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('predictionModal');
    if (event.target === modal) {
        closeModal();
    }
});
