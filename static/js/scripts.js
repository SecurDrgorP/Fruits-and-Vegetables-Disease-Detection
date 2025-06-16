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
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize settings if on settings page
    if (window.location.pathname === '/settings') {
        loadUserSettings();
    }
    
    // Initialize theme
    applyStoredTheme();
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Navigation functionality
    function initializeNavigation() {
        // Update active navigation based on current page
        const currentPath = window.location.pathname;
        const navSections = document.querySelectorAll('.nav-section');
        
        navSections.forEach(section => {
            section.classList.remove('active');
            
            const link = section.getAttribute('href') || section.querySelector('a')?.getAttribute('href');
            if (link === currentPath || (currentPath === '/' && !link)) {
                section.classList.add('active');
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const sidePanel = document.querySelector('.side-panel');
            const menuToggle = document.getElementById('menuToggle');
            
            if (sidePanel && !sidePanel.contains(event.target) && !menuToggle.contains(event.target)) {
                sidePanel.classList.remove('open');
            }
        });
    }
    
    // Theme functionality
    function applyStoredTheme() {
        const savedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const theme = savedSettings.theme || 'light';
        
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }
    
    // Load user settings for consistent behavior
    function loadUserSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        
        // Apply auto-save setting
        if (savedSettings.autoSave === false) {
            // Disable auto-save functionality
            window.autoSaveEnabled = false;
        }
        
        // Apply show heatmap setting
        if (savedSettings.showHeatmap === true) {
            // Auto-show heatmap after analysis
            window.showHeatmapByDefault = true;
        }
        
        // Apply confidence threshold
        if (savedSettings.confidenceThreshold) {
            window.confidenceThreshold = parseInt(savedSettings.confidenceThreshold);
        }
    }
    
    // Enhanced prediction result handling
    function handlePredictionResult() {
        // Auto-show heatmap if setting is enabled
        if (window.showHeatmapByDefault && btnHeatmap && !btnHeatmap.classList.contains('active')) {
            btnHeatmap.click();
        }
        
        // Check confidence threshold
        const confidenceElement = document.querySelector('.meter-value');
        if (confidenceElement && window.confidenceThreshold) {
            const confidence = parseFloat(confidenceElement.textContent);
            if (confidence < window.confidenceThreshold) {
                showLowConfidenceWarning(confidence);
            }
        }
    }
    
    function showLowConfidenceWarning(confidence) {
        const warning = document.createElement('div');
        warning.className = 'confidence-warning';
        warning.innerHTML = `
            <div class="warning-icon">⚠️</div>
            <div class="warning-text">
                <strong>Low Confidence Warning</strong>
                <p>The AI model has ${confidence}% confidence in this prediction. Consider retaking the image with better lighting or angle.</p>
            </div>
        `;
        
        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.insertBefore(warning, resultsContainer.firstChild);
        }
    }
});