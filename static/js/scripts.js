document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const fileInfo = document.getElementById('fileInfo');
    const menuToggle = document.getElementById('menuToggle');
    const sidePanel = document.querySelector('.side-panel');
    const uploadForm = document.getElementById('uploadForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultsContainer = document.getElementById('resultsContainer');
    const btnOriginal = document.getElementById('btnOriginal');
    const btnHeatmap = document.getElementById('btnHeatmap');
    const resultImage = document.getElementById('resultImage');
    const btnDownload = document.getElementById('btnDownload');
    const btnNewScan = document.getElementById('btnNewScan');
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidePanel.classList.toggle('open');
        });
    }
    
    // File upload handling
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length) {
                const file = fileInput.files[0];
                // Display file info
                fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
                fileInfo.style.display = 'block';
                uploadZone.classList.add('has-file');
            } else {
                fileInfo.style.display = 'none';
                uploadZone.classList.remove('has-file');
            }
        });
    }
    
    // Drag and drop functionality
    if (uploadZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.add('dragover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => {
                uploadZone.classList.remove('dragover');
            });
        });
        
        uploadZone.addEventListener('drop', function(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length) {
                fileInput.files = files;
                const file = files[0];
                fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
                fileInfo.style.display = 'block';
                uploadZone.classList.add('has-file');
            }
        });
    }
    
    // Form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', function() {
            // Show loading overlay during form submission
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }
        });
    }
    
    // Toggle between original and heatmap views
    if (btnOriginal && btnHeatmap && resultImage) {
        btnOriginal.addEventListener('click', function() {
            const originalSrc = resultImage.getAttribute('src');
            if (originalSrc && originalSrc !== '#') {
                btnOriginal.classList.add('active');
                btnHeatmap.classList.remove('active');
                
                // If we have a stored original image, use that
                if (resultImage.hasAttribute('data-original')) {
                    resultImage.src = resultImage.getAttribute('data-original');
                }
            }
        });
        
        btnHeatmap.addEventListener('click', function() {
            const heatmapSrc = resultImage.getAttribute('data-heatmap');
            if (heatmapSrc) {
                btnHeatmap.classList.add('active');
                btnOriginal.classList.remove('active');
                
                // Store original image if not already stored
                if (!resultImage.hasAttribute('data-original')) {
                    resultImage.setAttribute('data-original', resultImage.src);
                }
                
                resultImage.src = heatmapSrc;
            }
        });
    }
    
    // Download result image
    if (btnDownload && resultImage) {
        btnDownload.addEventListener('click', function() {
            if (resultImage.src && resultImage.src !== '#' && resultImage.src !== window.location.href) {
                const link = document.createElement('a');
                link.href = resultImage.src;
                link.download = 'fruit-scan-result.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }
    
    // New scan button
    if (btnNewScan) {
        btnNewScan.addEventListener('click', function() {
            // Reset the form
            if (uploadForm) {
                uploadForm.reset();
            }
            
            // Hide results
            if (resultsContainer) {
                resultsContainer.style.display = 'none';
            }
            
            // Reset file upload zone
            if (uploadZone && fileInfo) {
                uploadZone.classList.remove('has-file');
                fileInfo.style.display = 'none';
            }
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});