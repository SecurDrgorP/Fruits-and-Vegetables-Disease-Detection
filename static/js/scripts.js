// Apply theme immediately when script loads (before DOM is ready)
(function() {
    function applyThemeImmediate() {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            const theme = savedSettings.theme || 'light';
            
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
            }
        } catch (e) {
            // Fallback to light theme if there's an error
            document.documentElement.setAttribute('data-theme', 'light');
        }
    }
    
    // Apply theme immediately
    applyThemeImmediate();
    
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', function(e) {
        if (e.key === 'appSettings') {
            applyThemeImmediate();
        }
    });
})();

document.addEventListener('DOMContentLoaded', function() {
    // Apply theme FIRST before anything else
    applyStoredTheme();
    
    // DOM Elements - Declare these FIRST
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



    // Initialize enhanced UI features AFTER DOM elements are declared
    initializeEnhancedUI();

    // Enhanced UI initialization
    function initializeEnhancedUI() {
        // Add smooth scroll behavior
        addSmoothScrolling();
        
        // Add card hover effects
        addCardHoverEffects();
        
        // Add button ripple effects
        addRippleEffects();
        
        // Add progress indicators
        addProgressIndicators();
        
        // Add parallax effects
        addParallaxEffects();
        
        // Add loading animations
        addLoadingAnimations();
    }
    
    // Smooth scrolling for anchor links
    function addSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Enhanced card hover effects
    function addCardHoverEffects() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Ripple effect for buttons
    function addRippleEffects() {
        const buttons = document.querySelectorAll('button, .btn-download, .btn-new-scan, .analyze-button');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    // Progress indicators for file upload
    function addProgressIndicators() {
        if (uploadForm) {
            uploadForm.addEventListener('submit', function() {
                createProgressIndicator();
            });
        }
    }
    
    function createProgressIndicator() {
        const progressBar = document.createElement('div');
        progressBar.className = 'upload-progress';
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">Analyzing image...</div>
        `;
        
        document.body.appendChild(progressBar);
        
        // Animate progress
        setTimeout(() => {
            const fill = progressBar.querySelector('.progress-fill');
            fill.style.width = '100%';
        }, 100);
    }
    
    // Subtle parallax effects
    function addParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.panel-header');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }
    
    // Enhanced loading animations
    function addLoadingAnimations() {
        // Stagger animation for navigation items
        const navItems = document.querySelectorAll('.nav-section');
        navItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('fade-in-up');
        });
        
        // Floating animation for upload icon
        const uploadIcon = document.querySelector('.upload-icon');
        if (uploadIcon) {
            uploadIcon.classList.add('floating');
        }
        
        // Initialize particle system
        createParticleSystem();
    }
    
    // Particle system for enhanced visual appeal
    function createParticleSystem() {
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                createParticle();
            }, i * 200);
        }
        
        // Create new particles periodically
        setInterval(() => {
            if (Math.random() < 0.3) {
                createParticle();
            }
        }, 2000);
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
        
        // Random size and opacity
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 12000);
    }
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidePanel.classList.toggle('open');
            
            // Add animation to menu toggle
            this.classList.toggle('active');
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

    btnHeatmap.addEventListener('click', function() {
        console.log('Switching to heatmap view');
    });


    if (btnOriginal && btnHeatmap && resultImage) {
        btnOriginal.addEventListener('click', function() {
            console.log('Switching to original image view');
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
    
    // Enhanced mouse tracking for card effects
    function addMouseTracking() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');
            });
        });
    }
    
    // Call mouse tracking initialization
    addMouseTracking();
    
    // Enhanced notification system
    window.showNotification = function(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }[type] || 'ℹ️';
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.parentNode.removeChild(notification);
            }, 300);
        }, duration);
    };
    
    // Enhanced image preview
    function createImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="preview-image">
                <div class="preview-overlay">
                    <button class="preview-remove" onclick="removeImagePreview()">×</button>
                </div>
            `;
            
            // Add preview to upload zone
            const uploadContent = document.querySelector('.upload-content');
            if (uploadContent) {
                uploadContent.appendChild(preview);
            }
        };
        reader.readAsDataURL(file);
    }
    
    window.removeImagePreview = function() {
        const preview = document.querySelector('.image-preview');
        if (preview) {
            preview.remove();
        }
        
        // Reset file input
        if (fileInput) {
            fileInput.value = '';
            uploadZone.classList.remove('has-file');
            fileInfo.style.display = 'none';
        }
    };
    
    // Enhanced loading states
    function showAnalysisLoading() {
        const analyzeButton = document.querySelector('.analyze-button');
        if (analyzeButton) {
            analyzeButton.innerHTML = `
                <div class="loading-spinner"></div>
                <span>Analyzing...</span>
            `;
            analyzeButton.disabled = true;
        }
    }
    
    function hideAnalysisLoading() {
        const analyzeButton = document.querySelector('.analyze-button');
        if (analyzeButton) {
            analyzeButton.innerHTML = `
                <span>Analyze Image</span>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            `;
            analyzeButton.disabled = false;
        }
    }
    
    // Toast notification for file upload
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length) {
                const file = fileInput.files[0];
                
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showNotification('Please select a valid image file.', 'error');
                    return;
                }
                
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    showNotification('File size too large. Please select an image smaller than 10MB.', 'error');
                    return;
                }
                
                // Show success notification
                showNotification(`Image "${file.name}" selected successfully!`, 'success', 3000);
                
                // Create image preview
                createImagePreview(file);
                
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
    
    // Enhanced nature-themed interactions
    function addNatureThemedInteractions() {
        // Add organic hover effects to cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(248, 250, 248, 0.95)';
                this.style.borderColor = 'var(--primary)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.background = 'var(--glass-bg)';
                this.style.borderColor = 'var(--glass-border)';
            });
        });
        
        // Add organic pulsing to active elements
        const activeElements = document.querySelectorAll('.nav-section.active, .analyze-button');
        activeElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                this.style.animation = 'pulse-organic 1s ease-in-out';
            });
            
            element.addEventListener('mouseleave', function() {
                this.style.animation = '';
            });
        });
        
        // Add scroll progress indicator
        addScrollProgress();
        
        // Add organic loading states
        addOrganicLoadingStates();
    }
    
    // Scroll progress indicator
    function addScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-indicator';
        progressBar.innerHTML = '<div class="scroll-progress"></div>';
        document.body.appendChild(progressBar);
        
        const progress = progressBar.querySelector('.scroll-progress');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = (scrollTop / documentHeight) * 100;
            progress.style.width = scrollPercentage + '%';
        });
    }
    
    // Organic loading states
    function addOrganicLoadingStates() {
        const analyzeButton = document.querySelector('.analyze-button');
        if (analyzeButton) {
            const originalSubmit = uploadForm.onsubmit;
            uploadForm.onsubmit = function(e) {
                analyzeButton.classList.add('loading');
                analyzeButton.innerHTML = `
                    <div class="loading-spinner"></div>
                    <span>Analyzing with AI...</span>
                `;
                
                // Add nature-themed loading messages
                const messages = [
                    'Examining leaf patterns...',
                    'Detecting plant health...',
                    'Processing natural features...',
                    'Analyzing organic structures...',
                    'AI vision in progress...'
                ];
                
                let messageIndex = 0;
                const messageInterval = setInterval(() => {
                    const span = analyzeButton.querySelector('span');
                    if (span) {
                        span.textContent = messages[messageIndex % messages.length];
                        messageIndex++;
                    }
                }, 2000);
                
                // Store interval for cleanup
                analyzeButton.dataset.messageInterval = messageInterval;
                
                if (originalSubmit) {
                    return originalSubmit.call(this, e);
                }
            };
        }
    }
    
    // Enhanced theme switching with nature transitions
    function enhanceThemeTransitions() {
        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme');
                    
                    // Add nature-themed transition effect
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: ${newTheme === 'dark' ? 'var(--sage-900)' : 'var(--sage-50)'};
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        z-index: 9999;
                        pointer-events: none;
                    `;
                    
                    document.body.appendChild(overlay);
                    
                    // Animate transition
                    requestAnimationFrame(() => {
                        overlay.style.opacity = '0.8';
                    });
                    
                    setTimeout(() => {
                        overlay.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(overlay);
                        }, 300);
                    }, 150);
                }
            });
        });
        
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    // Add nature-themed particles effect
    function enhanceParticleSystem() {
        const particleColors = [
            'rgba(45, 125, 50, 0.4)',    // Forest green
            'rgba(0, 172, 193, 0.3)',    // Cyan blue
            'rgba(255, 143, 0, 0.25)',   // Warm orange
            'rgba(106, 76, 147, 0.2)'    // Purple
        ];
        
        // Override the original particle creation
        window.createParticle = function() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random color from nature palette
            const color = particleColors[Math.floor(Math.random() * particleColors.length)];
            particle.style.background = color;
            
            // Random positioning and animation
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
            
            // Random size
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Add glow effect occasionally
            if (Math.random() < 0.3) {
                particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
            }
            
            document.body.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 12000);
        };
    }
    
    // Initialize all nature-themed enhancements
    addNatureThemedInteractions();
    enhanceThemeTransitions();
    enhanceParticleSystem();

    // ...existing code...
});