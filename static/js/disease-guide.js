// Disease Guide page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeDiseaseGuide();
});

function initializeDiseaseGuide() {
    // Initialize filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const diseaseCards = document.querySelectorAll('.disease-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter disease cards
            filterDiseases(filter, diseaseCards);
        });
    });
    
    // Initialize search functionality
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input[name="search"]');
        
        // Add live search functionality
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = this.value.toLowerCase();
                liveSearchDiseases(query, diseaseCards);
            }, 300);
        });
    }
    
    // Add expand/collapse functionality for disease cards
    diseaseCards.forEach(card => {
        const header = card.querySelector('.disease-header');
        if (header) {
            header.addEventListener('click', function() {
                card.classList.toggle('expanded');
            });
        }
    });
}

function filterDiseases(filter, diseaseCards) {
    diseaseCards.forEach(card => {
        const plantType = card.getAttribute('data-plant');
        
        if (filter === 'all' || plantType === filter) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        }
    });
    
    // Update results count
    const visibleCards = document.querySelectorAll('.disease-card[style*="block"]').length;
    updateResultsCount(visibleCards);
}

function liveSearchDiseases(query, diseaseCards) {
    let visibleCount = 0;
    
    diseaseCards.forEach(card => {
        const diseaseName = card.querySelector('.disease-title h3').textContent.toLowerCase();
        const description = card.querySelector('.disease-description').textContent.toLowerCase();
        const symptoms = card.querySelector('.detail-section:nth-child(1) p').textContent.toLowerCase();
        
        const matches = diseaseName.includes(query) || 
                       description.includes(query) || 
                       symptoms.includes(query);
        
        if (matches || query === '') {
            card.style.display = 'block';
            card.classList.add('fade-in');
            visibleCount++;
        } else {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        }
    });
    
    updateResultsCount(visibleCount);
}

function updateResultsCount(count) {
    let countElement = document.querySelector('.results-count');
    if (!countElement) {
        countElement = document.createElement('div');
        countElement.className = 'results-count';
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.appendChild(countElement);
        }
    }
    
    countElement.textContent = `${count} disease${count !== 1 ? 's' : ''} found`;
}

// Add bookmark functionality
function bookmarkDisease(diseaseId) {
    const bookmarks = getBookmarks();
    if (!bookmarks.includes(diseaseId)) {
        bookmarks.push(diseaseId);
        saveBookmarks(bookmarks);
        showToast('Disease bookmarked successfully');
    } else {
        showToast('Disease already bookmarked');
    }
}

function removeBookmark(diseaseId) {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(diseaseId);
    if (index > -1) {
        bookmarks.splice(index, 1);
        saveBookmarks(bookmarks);
        showToast('Bookmark removed');
    }
}

function getBookmarks() {
    return JSON.parse(localStorage.getItem('diseaseBookmarks') || '[]');
}

function saveBookmarks(bookmarks) {
    localStorage.setItem('diseaseBookmarks', JSON.stringify(bookmarks));
}

function showToast(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Print disease information
function printDiseaseInfo(diseaseId) {
    const diseaseCard = document.querySelector(`[data-disease-id="${diseaseId}"]`);
    if (diseaseCard) {
        const printWindow = window.open('', '_blank');
        const diseaseContent = diseaseCard.innerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Disease Information</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .disease-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
                    .disease-header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
                    .detail-section { margin-bottom: 15px; }
                    .detail-section h4 { color: #333; margin-bottom: 5px; }
                    .severity-badge { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="disease-card">${diseaseContent}</div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
}

// Share disease information
function shareDisease(diseaseId, diseaseName) {
    if (navigator.share) {
        navigator.share({
            title: `Disease Information: ${diseaseName}`,
            text: `Learn about ${diseaseName} symptoms, causes, and treatment.`,
            url: window.location.href + `#disease-${diseaseId}`
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        const shareUrl = window.location.href + `#disease-${diseaseId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Link copied to clipboard');
        }).catch(() => {
            showToast('Could not copy link');
        });
    }
}
