// ============================================
// CTA BUTTON HANDLERS
// ============================================

// Helper function for multiple reds (MOVE THIS OUTSIDE)
function showPDFDownloadOptions(reds) {
    const container = document.createElement('div');
    container.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 1000; max-width: 500px;';
    
    let html = '<h3 style="margin-top: 0;">Choose Your Guide</h3><p>You have multiple red areas. Which guide would you like to download?</p><div style="display: flex; flex-direction: column; gap: 10px;">';
    
    reds.forEach(red => {
        const redName = red.charAt(0).toUpperCase() + red.slice(1);
        html += `<a href="guides/${red}-red-guide.pdf" target="_blank" class="btn btn-primary" style="text-decoration: none; display: block; padding: 15px; text-align: center;">${redName} Red Guide</a>`;
    });
    
    html += '</div><button onclick="this.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Close</button>';
    
    container.innerHTML = html;
    document.body.appendChild(container);
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999;';
    backdrop.onclick = () => {
        backdrop.remove();
        container.remove();
    };
    document.body.appendChild(backdrop);
}

function setupCTAHandlers(userId) {
    // Download PDF
    const pdfButtons = document.querySelectorAll('[data-action="download-pdf"]');
    pdfButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Get the scores to determine which PDFs to show
            const scores = getScoresFromURL();
            const reds = determineReds(scores);
            
            if (reds.length === 0) {
                // No reds - could offer a general guide or just message
                alert('Your scores are all in good range! Check your email for next steps.');
            } else if (reds.length === 1) {
                // Single red - download that specific guide
                const redType = reds[0];
                window.open(`guides/${redType}-red-guide.pdf`, '_blank');
            } else {
                // Multiple reds - show them options
                showPDFDownloadOptions(reds);
            }
        });
    });
    
    // Book free call
    const freeCallButtons = document.querySelectorAll('[data-action="book-free-call"]');
    // ... rest of your code ...
