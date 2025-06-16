// Settings page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
});

function initializeSettings() {
    // Load saved settings
    loadSettings();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize slider updates
    initializeSliders();
}

function initializeEventListeners() {
    // Save settings on change
    const settingInputs = document.querySelectorAll('select, input[type="checkbox"], input[type="range"]');
    settingInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.id !== 'importFile') {
                saveSettingsToStorage();
            }
        });
    });
    
    // Theme change handler
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            const newTheme = this.value;
            applyTheme(newTheme);
            saveSettingsToStorage(); // Save immediately when theme changes
        });
    }
    
    // Language change handler
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            // Implementation for language change
            showToast('Language setting saved. Restart the application to apply changes.');
        });
    }
}

function initializeSliders() {
    const confidenceSlider = document.getElementById('confidenceThreshold');
    const sliderValue = document.querySelector('.slider-value');
    
    if (confidenceSlider && sliderValue) {
        confidenceSlider.addEventListener('input', function() {
            sliderValue.textContent = this.value + '%';
        });
    }
}

function loadSettings() {
    const savedSettings = getStoredSettings();
    
    // Apply saved settings to form elements
    Object.keys(savedSettings).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = savedSettings[key];
            } else if (element.type === 'range') {
                element.value = savedSettings[key];
                // Update slider display
                const sliderValue = element.parentNode.querySelector('.slider-value');
                if (sliderValue) {
                    sliderValue.textContent = savedSettings[key] + '%';
                }
            } else {
                element.value = savedSettings[key];
            }
        }
    });
    
    // Apply theme
    if (savedSettings.theme) {
        applyTheme(savedSettings.theme);
    }
}

function saveSettings() {
    saveSettingsToStorage();
    showToast('Settings saved successfully!');
}

function saveSettingsToStorage() {
    const settings = {
        defaultModel: getValue('defaultModel'),
        confidenceThreshold: getValue('confidenceThreshold'),
        autoSave: getChecked('autoSave'),
        showHeatmap: getChecked('showHeatmap'),
        theme: getValue('theme'),
        language: getValue('language'),
        animationSpeed: getValue('animationSpeed'),
        dataRetention: getValue('dataRetention'),
        analytics: getChecked('analytics')
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Apply theme immediately
    applyTheme(settings.theme);
    
    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'appSettings',
        newValue: JSON.stringify(settings)
    }));
}

function getStoredSettings() {
    const defaultSettings = {
        defaultModel: 'FAVDD',
        confidenceThreshold: '50',
        autoSave: true,
        showHeatmap: false,
        theme: 'light',
        language: 'en',
        animationSpeed: 'normal',
        dataRetention: '30',
        analytics: true
    };
    
    const stored = localStorage.getItem('appSettings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function getChecked(id) {
    const element = document.getElementById(id);
    return element ? element.checked : false;
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        localStorage.removeItem('appSettings');
        loadSettings();
        showToast('Settings reset to defaults');
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // If auto theme, detect system preference
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

async function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data? This will remove:\n- Prediction history\n- Cached images\n- User preferences\n\nThis action cannot be undone.')) {
        return;
    }
    
    try {
        // Clear server-side data
        const response = await fetch('/api/data/clear-all', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Clear client-side data
            localStorage.clear();
            sessionStorage.clear();
            
            showToast('All data cleared successfully');
            
            // Reload page after a delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        showToast('Error clearing data. Please try again.');
    }
}

function exportSettings() {
    const settings = getStoredSettings();
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `fruit-scanner-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Settings exported successfully');
}

function importSettings(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedSettings = JSON.parse(e.target.result);
            
            // Validate settings structure
            if (typeof importedSettings === 'object' && importedSettings !== null) {
                localStorage.setItem('appSettings', JSON.stringify(importedSettings));
                loadSettings();
                showToast('Settings imported successfully');
            } else {
                throw new Error('Invalid settings format');
            }
        } catch (error) {
            console.error('Error importing settings:', error);
            showToast('Error importing settings. Please check the file format.');
        }
    };
    
    reader.readAsText(file);
    
    // Clear the input
    input.value = '';
}

function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Model management functions
function updateModelInfo() {
    // Implementation for updating model information
    fetch('/api/models/info')
        .then(response => response.json())
        .then(data => {
            updateModelCards(data);
        })
        .catch(error => {
            console.error('Error updating model info:', error);
        });
}

function updateModelCards(modelData) {
    const modelCards = document.querySelectorAll('.model-card');
    modelCards.forEach(card => {
        const modelName = card.querySelector('h4').textContent;
        if (modelData[modelName]) {
            const info = modelData[modelName];
            card.querySelector('.stat-value:nth-child(2)').textContent = info.version;
            card.querySelector('.stat-value:nth-child(4)').textContent = info.accuracy + '%';
            card.querySelector('.stat-value:nth-child(6)').textContent = info.lastUpdated;
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme immediately
    const savedSettings = getStoredSettings();
    if (savedSettings.theme) {
        applyTheme(savedSettings.theme);
    }
});
