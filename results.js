// ============================================
// RESULTS PAGE - COMPLETE VERSION
// Navigate Transition Assessment
// ============================================

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const motivation = parseFloat(urlParams.get('m')) || 0;
const learning = parseFloat(urlParams.get('l')) || 0;
const identity = parseFloat(urlParams.get('i')) || 0;
const userId = urlParams.get('uid') || 'anonymous';

// Calculate capacity score
const capacityScore = Math.round(motivation * learning * identity);

// Create scores object
const scores = {
    motivation: motivation,
    learning: learning,
    identity: identity,
    capacityScore: capacityScore,
    userId: userId
};

// Determine which dimensions are red (below 5.0)
const reds = [];
if (motivation < 5.0) reds.push('motivation');
if (learning < 5.0) reds.push('learning');
if (identity < 5.0) reds.push('identity');

// ============================================
// MAIN INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    displayResults(scores, reds);
    setupCTAHandlers(userId);
});

// ============================================
// DISPLAY RESULTS FUNCTION
// ============================================

function displayResults(scores, reds) {
    const container = document.getElementById('results-content');
    const loading = document.getElementById('loading');
    
    if (!container) {
        console.error('Results container not found!');
        return;
    }
    
    let content = '';
    
    // Generate appropriate content based on reds
    if (reds.length === 0) {
        content = generateAllGreenContent(scores);
    } else if (reds.length === 1) {
        content = generateSingleRedContent(reds[0], scores);
    } else {
        content = generateMultipleRedsContent(reds, scores);
    }
    
    container.innerHTML = content;
    
    if (loading) {
        loading.style.display = 'none';
    }
    container.style.display = 'block';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getScoreColor(score) {
    if (score >= 7.0) return 'green';
    if (score >= 5.0) return 'amber';
    return 'red';
}

function getBadgeEmoji(color) {
    if (color === 'green') return '✅';
    if (color === 'amber') return '⚠️';
    return '🚨';
}

// ============================================
// WORKBOOK RECOMMENDATION SYSTEM
// ============================================

function getWorkbookRecommendation(scores, reds) {
    // All red - recommend call first
    if (reds.length === 3) {
        return {
            type: 'crisis',
            primary: null,
            secondary: null,
            message: 'With all three dimensions in red, we strongly recommend booking a results review call before purchasing workbooks. We will work together to create an appropriate support plan.'
        };
    }
    
    // Dual red - recommend both relevant workbooks
    if (reds.length === 2) {
        const workbooks = reds.map(r => r + '-red');
        const firstRed = reds[0].charAt(0).toUpperCase() + reds[0].slice(1);
        const secondRed = reds[1].charAt(0).toUpperCase() + reds[1].slice(1);
        const msg = `You have two constraints: ${firstRed} and ${secondRed}. We recommend starting with the ${firstRed} Red Workbook, then moving to ${secondRed}. We will help you prioritize in your results review call.`;
        return {
            type: 'dual',
            primary: workbooks[0],
            secondary: workbooks[1],
            message: msg
        };
    }
    
    // Single red - recommend that specific workbook
    if (reds.length === 1) {
        const constraint = reds[0];
        let message = '';
        
        if (constraint === 'motivation') {
            message = 'Your constraint is Motivation. The Motivation Red Workbook provides specific exercises to rebuild your "why" and move from stuck to in motion.';
        } else if (constraint === 'learning') {
            message = 'Your constraint is Learning. The Learning Red Workbook provides structured pathways to break down overwhelming transitions into manageable steps.';
        } else if (constraint === 'identity') {
            message = 'Your constraint is Identity. The Identity Red Workbook helps you understand who you are beyond your role and rebuild your sense of self.';
        }
        
        return {
            type: 'single-red',
            primary: constraint + '-red',
            secondary: null,
            message: message
        };
    }
    
    // All green/amber (no reds) - recommend coaching for direction
    return {
        type: 'all-green',
        primary: null,
        secondary: null,
        message: 'You have strong capacity across all three dimensions. Your challenge is not building capacity - it is deploying what you already have effectively. You need direction and strategic guidance, not workbooks.'
    };
}

function generateWorkbookCardHTML(recommendation) {
    if (!recommendation) return '';
    
    // Crisis - recommend call instead of workbook
    if (recommendation.type === 'crisis') {
        return `
            <div class="cta-card highlight" style="border: 3px solid #e74c3c;">
                <h3>⚠️ Important Recommendation</h3>
                <p>${recommendation.message}</p>
                <button class="btn btn-primary" data-action="book-free-call">Schedule Free Results Review Call</button>
            </div>
        `;
    }
    
    // Dual red - show both workbooks
    if (recommendation.type === 'dual') {
        return `
            <div class="cta-card highlight" style="border: 3px solid #667eea;">
                <h3>📚 Your Recommended Resources</h3>
                <p>${recommendation.message}</p>
                <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-secondary" data-action="view-workbook" data-workbook="${recommendation.primary}">View ${recommendation.primary.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Workbook</button>
                    <button class="btn btn-secondary" data-action="view-workbook" data-workbook="${recommendation.secondary}">View ${recommendation.secondary.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Workbook</button>
                </div>
                <p style="font-size: 0.9em; margin-top: 10px; color: #666;">We will help you decide which to start with in your results review call.</p>
            </div>
        `;
    }
    
    // Single red - show that workbook
    if (recommendation.type === 'single-red') {
        const workbookTitle = recommendation.primary.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Workbook';
        return `
            <div class="cta-card highlight" style="border: 3px solid #667eea;">
                <h3>📚 Your Recommended Resource</h3>
                <p><strong>${workbookTitle}</strong></p>
                <p>${recommendation.message}</p>
                <button class="btn btn-primary" data-action="view-workbook" data-workbook="${recommendation.primary}">Learn More About ${workbookTitle}</button>
            </div>
        `;
    }
    
    // Momentum workbook
    if (recommendation.type === 'momentum') {
        return `
            <div class="cta-card highlight" style="border: 3px solid #27ae60;">
                <h3>📚 Your Recommended Resource</h3>
                <p><strong>Momentum Workbook</strong></p>
                <p>${recommendation.message}</p>
                <button class="btn btn-primary" data-action="view-workbook" data-workbook="momentum">Learn More About Momentum Workbook</button>
            </div>
        `;
    }
    
    // All green - recommend coaching instead of workbook
    if (recommendation.type === 'all-green') {
        return `
            <div class="cta-card highlight" style="border: 3px solid #27ae60;">
                <h3>🎯 Your Recommended Next Step</h3>
                <p><strong>Strategic Coaching Call</strong></p>
                <p>${recommendation.message}</p>
                <button class="btn btn-primary" data-action="book-free-call">Book Your Free Results Review Call</button>
            </div>
        `;
    }
    
    return '';
}

// ============================================
// SINGLE RED ROUTER FUNCTION
// ============================================

function generateSingleRedContent(red, scores) {
    if (red === 'motivation') {
        return generateMotivationRedContent(scores);
    } else if (red === 'learning') {
        return generateLearningRedContent(scores);
    } else if (red === 'identity') {
        return generateIdentityRedContent(scores);
    }
}

// ============================================
// NEXT STEPS WITH WORKBOOKS
// ============================================

function generateNextStepsHTML_WithWorkbooks(scores, reds) {
    const recommendation = getWorkbookRecommendation(scores, reds);
    
    return `
        <section class="next-steps">
            <h2>Your Next Steps</h2>
            <p>You have several options from here:</p>
            
            <div class="cta-grid">
                ${generateWorkbookCardHTML(recommendation)}
                
                <div class="cta-card">
                    <h3>📥 Download Your Results</h3>
                    <p>Get a detailed PDF of your results including all your scores and what your constraint means.</p>
                    <button class="btn btn-primary" data-action="download-pdf">Download PDF Report</button>
                </div>
                
                <div class="cta-card highlight">
                    <h3>📞 Book a Free Results Review</h3>
                    <p>Let's discuss your results together. Understand your constraint, explore what's blocking you, identify your path forward.</p>
                    <p><strong>No pressure, no commitment - just clarity.</strong></p>
                    <p class="spots">I have 6 spots available each week for these conversations.</p>
                    <button class="btn btn-primary" data-action="book-free-call">Schedule Your Free 30-Minute Call</button>
                </div>
                
                <div class="cta-card">
                    <h3>🎯 Free Pilot Mentoring Session</h3>
                    <p>One 90-minute focused session as part of our pilot programme. Deep dive into your constraint and create your personal action plan.</p>
                    <p style="color: #27ae60; font-weight: 600; font-size: 1.1em; margin: 10px 0;">Free for Pilot Participants</p>
                    <button class="btn btn-secondary" data-action="book-mentoring">Book Free Pilot Session</button>
                </div>
                
                <div class="cta-card">
                    <h3>🎯 Full Coaching Programme</h3>
                    <p>Resolve your constraint completely. 5-10 sessions over 2-5 months with workbooks and exercises.</p>
                    <p class="price">From £997</p>
                    <button class="btn btn-secondary" data-action="view-packages">Learn About Coaching Packages</button>
                </div>
                
                <div class="cta-card">
                    <h3>📧 Stay Connected</h3>
                    <p>Not ready to book anything yet? That's completely fine. I'll send you an email in the next hour with your results PDF and more resources.</p>
                    <p class="reassurance">Take your time. This is your journey.</p>
                </div>
            </div>
        </section>
    `;
}

// ============================================
// MULTIPLE REDS CONTENT
// ============================================

function generateMultipleRedsContent(reds, scores) {
    const redsText = reds.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');
    
    return `
        <div class="results-header">
            <h1>Your Results: Multiple Constraints</h1>
            ${generateScoresHTML(scores)}
            <p class="constraint-label">Your Primary Constraints: <strong>${redsText}</strong></p>
        </div>
        
        <div class="results-content">
            <section class="what-this-means">
                <h2>What This Means</h2>
                <p>You have multiple constraints blocking your transition. This is actually more common than you might think, especially for people experiencing imposed change (like redundancy or restructuring).</p>
                
                <p><strong>Here's the truth: You're not more broken than others. You're just experiencing the full impact of a major transition.</strong></p>
                
                <p>Having multiple reds means the change wasn't your choice, you can't figure out the practical steps, and your identity feels threatened. This makes complete sense for someone in your situation.</p>
            </section>
            
            <section class="not-alone">
                <h2>You're Not Alone</h2>
                <p>This is <strong>not uncommon</strong> for people experiencing significant imposed change, especially for those facing sudden redundancy or restructuring.</p>
                <p>This is most common for senior professionals facing sudden redundancy, those in forced career changes, and anyone experiencing significant imposed change.</p>
                <p class="good-news"><strong>The good news:</strong> We address one constraint at a time, and fixing one often improves the others.</p>
            </section>
            
            <section class="why-matters">
                <h2>Why This Matters</h2>
                <p>Multiple constraints create a compounding effect. Each one makes the others worse. But here's what's powerful: <strong>resolving one constraint often creates momentum that helps with the others.</strong></p>
                
                <p>For example:</p>
                <ul>
                    <li>Fix Motivation → suddenly Learning feels possible</li>
                    <li>Fix Identity → Motivation often returns naturally</li>
                    <li>Fix Learning → confidence improves (helps Identity)</li>
                </ul>
                
                <p><strong>You don't have to fix everything at once. You just need to start with one.</strong></p>
            </section>
            
            <section class="micro-action">
                <h2>What To Do Right Now</h2>
                <p><strong>Here's one small action you can take today</strong> (takes 10 minutes):</p>
                
                <div class="exercise-box">
                    <h3>The Constraint Priority Exercise</h3>
                    <p>Think about these three questions:</p>
                    <ol>
                        <li><strong>"What's costing me the most right now?"</strong> (M, L, or I)</li>
                        <li><strong>"Which one, if resolved, would help the most?"</strong> (M, L, or I)</li>
                        <li><strong>"Which one feels most accessible to work on first?"</strong> (M, L, or I)</li>
                    </ol>
                    
                    <p>Write down your answers. The constraint that appears most is probably your starting point.</p>
                    <p><strong>You don't need to fix everything today. Just identify which one to tackle first.</strong></p>
                    <p><strong>That's it. Just do that today.</strong></p>
                </div>
            </section>
            
            ${generateNextStepsHTML_WithWorkbooks(scores, reds)}
            ${generateQuestionsHTML()}
        </div>
    `;
}

// ============================================
// SCORES HTML GENERATOR
// ============================================

function generateScoresHTML(scores) {
    const mColor = getScoreColor(scores.motivation);
    const lColor = getScoreColor(scores.learning);
    const iColor = getScoreColor(scores.identity);
    
    return `
        <div class="scores">
            <div class="score ${mColor}">
                <label>Motivation</label>
                <span>${scores.motivation.toFixed(1)}/10</span>
                <span class="badge ${mColor}">${getBadgeEmoji(mColor)} ${mColor.charAt(0).toUpperCase() + mColor.slice(1)}</span>
            </div>
            <div class="score ${lColor}">
                <label>Learning</label>
                <span>${scores.learning.toFixed(1)}/10</span>
                <span class="badge ${lColor}">${getBadgeEmoji(lColor)} ${lColor.charAt(0).toUpperCase() + lColor.slice(1)}</span>
            </div>
            <div class="score ${iColor}">
                <label>Identity</label>
                <span>${scores.identity.toFixed(1)}/10</span>
                <span class="badge ${iColor}">${getBadgeEmoji(iColor)} ${iColor.charAt(0).toUpperCase() + iColor.slice(1)}</span>
            </div>
        </div>
        
        <div class="capacity-score-box" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
            <h3 style="margin: 0 0 15px 0; font-size: 1.2em; font-weight: 600;">Your Capacity Score</h3>
            <div style="font-size: 4em; font-weight: bold; margin: 20px 0; line-height: 1;">${scores.capacityScore}</div>
            <p style="margin: 10px 0 0 0; font-size: 1.1em; opacity: 0.95;">M × L × I = ${scores.motivation.toFixed(1)} × ${scores.learning.toFixed(1)} × ${scores.identity.toFixed(1)} = ${scores.capacityScore}</p>
        </div>
    `;
}

// ============================================
// MOTIVATION RED CONTENT
// ============================================

function generateMotivationRedContent(scores) {
    return `
        <div class="results-header">
            <h1>Your Results: Motivation Constraint</h1>
            ${generateScoresHTML(scores)}
            <p class="constraint-label">Your Primary Constraint: <strong>Motivation</strong></p>
        </div>
        
        <div class="results-content">
            <section class="what-this-means">
                <h2>What This Means</h2>
                <p>You're stuck not because you lack capability or don't know who you are. <strong>You're stuck because you can't get started.</strong> The "why" isn't clear enough yet.</p>
                
                <p>This is one of the most common constraints for people in transition, especially when change feels imposed rather than chosen.</p>
            </section>
            
            <section class="micro-action">
                <h2>What To Do Right Now</h2>
                <p><strong>Here's one small action you can take today</strong> (takes 5 minutes):</p>
                
                <div class="exercise-box">
                    <h3>The Evidence Exercise</h3>
                    <p>Write down three pieces of evidence that prove you CAN do hard things:</p>
                    <ol>
                        <li>A difficult transition you've navigated before</li>
                        <li>A skill you developed from scratch</li>
                        <li>A challenge you overcame when you didn't think you could</li>
                    </ol>
                    <p><strong>That's it. Just do that today.</strong> Keep the list somewhere you can see it.</p>
                </div>
            </section>
            
            ${generateNextStepsHTML_WithWorkbooks(scores, ['motivation'])}
            ${generateQuestionsHTML()}
        </div>
    `;
}

// ============================================
// LEARNING RED CONTENT
// ============================================

function generateLearningRedContent(scores) {
    return `
        <div class="results-header">
            <h1>Your Results: Learning Constraint</h1>
            ${generateScoresHTML(scores)}
            <p class="constraint-label">Your Primary Constraint: <strong>Learning</strong></p>
        </div>
        
        <div class="results-content">
            <section class="what-this-means">
                <h2>What This Means</h2>
                <p>You're stuck not because you lack motivation or don't know who you are. <strong>You're stuck because you can't see the path forward.</strong> The steps aren't clear yet.</p>
                
                <p>This is common for people facing significant transitions, especially when the change feels overwhelming or when the new territory is unfamiliar.</p>
            </section>
            
            <section class="micro-action">
                <h2>What To Do Right Now</h2>
                <p><strong>Here's one small action you can take today</strong> (takes 5 minutes):</p>
                
                <div class="exercise-box">
                    <h3>The One Next Step Exercise</h3>
                    <p>Don't try to figure out the whole path. Just identify ONE small next step:</p>
                    <ol>
                        <li>What's the smallest possible action you could take?</li>
                        <li>When will you do it? (Pick a specific time)</li>
                        <li>What will success look like?</li>
                    </ol>
                    <p><strong>That's it. Just identify one step today.</strong> You don't have to take it yet - just identify it.</p>
                </div>
            </section>
            
            ${generateNextStepsHTML_WithWorkbooks(scores, ['learning'])}
            ${generateQuestionsHTML()}
        </div>
    `;
}

// ============================================
// IDENTITY RED CONTENT
// ============================================

function generateIdentityRedContent(scores) {
    return `
        <div class="results-header">
            <h1>Your Results: Identity Constraint</h1>
            ${generateScoresHTML(scores)}
            <p class="constraint-label">Your Primary Constraint: <strong>Identity</strong></p>
        </div>
        
        <div class="results-content">
            <section class="what-this-means">
                <h2>What This Means</h2>
                <p>You're stuck not because you lack motivation or can't see the steps. <strong>You're stuck because you don't know who you are without your role.</strong> Your sense of self needs rebuilding.</p>
                
                <p>This is especially common for people who've had long careers in one field, or whose professional identity was central to their sense of self.</p>
            </section>
            
            <section class="micro-action">
                <h2>What To Do Right Now</h2>
                <p><strong>Here's one small action you can take today</strong> (takes 5 minutes):</p>
                
                <div class="exercise-box">
                    <h3>The "I Am" Exercise</h3>
                    <p>Complete these three sentences WITHOUT using your job title or profession:</p>
                    <ol>
                        <li>"I am someone who..."</li>
                        <li>"I am good at..."</li>
                        <li>"I am..."</li>
                    </ol>
                    <p><strong>That's it. Just write three sentences today.</strong> They don't have to be profound - just true.</p>
                </div>
            </section>
            
            ${generateNextStepsHTML_WithWorkbooks(scores, ['identity'])}
            ${generateQuestionsHTML()}
        </div>
    `;
}

// ============================================
// ALL GREEN CONTENT
// ============================================

function generateAllGreenContent(scores) {
    return `
        <div class="results-header">
            <h1>Your Results: Strong Across All Dimensions</h1>
            ${generateScoresHTML(scores)}
            <p class="constraint-label">Status: <strong>Ready for Action</strong></p>
        </div>
        
        <div class="results-content">
            <section class="what-this-means">
                <h2>What This Means</h2>
                <p>You have strong capacity across all three dimensions. <strong>You're not stuck - you need direction.</strong></p>
                
                <p>Your challenge isn't building capacity. It's deploying what you already have effectively.</p>
            </section>
            
            <section class="micro-action">
                <h2>What To Do Right Now</h2>
                <p><strong>Here's one small action you can take today</strong> (takes 10 minutes):</p>
                
                <div class="exercise-box">
                    <h3>The Direction Exercise</h3>
                    <p>Answer these three questions:</p>
                    <ol>
                        <li>If you could design your next chapter without constraints, what would it look like?</li>
                        <li>What's one step toward that vision you could take this week?</li>
                        <li>What support would help you take that step?</li>
                    </ol>
                    <p><strong>That's it. Just answer those three questions today.</strong></p>
                </div>
            </section>
            
            ${generateNextStepsHTML_WithWorkbooks(scores, [])}
            ${generateQuestionsHTML()}
        </div>
    `;
}

// ============================================
// QUESTIONS HTML
// ============================================

function generateQuestionsHTML() {
    return `
        <section class="faq">
            <h2>Common Questions</h2>
            
            <div class="faq-item">
                <h3>Why am I stuck when others seem fine?</h3>
                <p>You're not more broken than others. Different transitions affect people differently based on their specific situation, background, and context. Your constraint is simply where the system is blocked right now.</p>
            </div>
            
            <div class="faq-item">
                <h3>How long will this take to fix?</h3>
                <p>That depends on your specific situation. Some people see significant improvement in 2-3 sessions. Others need more sustained support over 2-3 months. The key is starting with the right constraint.</p>
            </div>
            
            <div class="faq-item">
                <h3>What if I don't have time for this?</h3>
                <p>That's exactly the point of identifying your constraint. We focus on the one thing that will unlock progress, not trying to fix everything at once. Small, focused actions beat overwhelming comprehensive plans.</p>
            </div>
            
            <div class="faq-item">
                <h3>Do I need coaching or can I use the workbooks alone?</h3>
                <p>Either works! The workbooks are designed to be self-guided. Coaching accelerates the process and provides accountability, but the workbooks alone can be very effective if you're self-directed.</p>
            </div>
        </section>
    `;
}

// ============================================
// CTA BUTTON HANDLERS
// ============================================

function setupCTAHandlers(userId) {
    // Download PDF button
    const pdfButtons = document.querySelectorAll('[data-action="download-pdf"]');
    pdfButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('PDF download coming soon! Check your email for your results.');
        });
    });
    
    // Book free call button
    const callButtons = document.querySelectorAll('[data-action="book-free-call"]');
    callButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.open('https://calendly.com/your-link', '_blank');
        });
    });
    
    // Book mentoring button
    const mentoringButtons = document.querySelectorAll('[data-action="book-mentoring"]');
    mentoringButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.open('https://calendly.com/your-mentoring-link', '_blank');
        });
    });
    
    // View packages button
    const packageButtons = document.querySelectorAll('[data-action="view-packages"]');
    packageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Coaching packages information coming soon! Check your email for details.');
        });
    });
    
    // Workbook buttons
    const workbookButtons = document.querySelectorAll('[data-action="view-workbook"]');
    workbookButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const workbookType = this.getAttribute('data-workbook');
            
            if (workbookType === 'momentum') {
                alert('Momentum Workbook information coming soon! Check your email for details.');
            } else if (workbookType === 'motivation-red') {
                alert('Motivation Red Workbook - Coming soon! This workbook provides exercises to rebuild your "why" and move from stuck to in motion. Check your email for more information.');
            } else if (workbookType === 'learning-red') {
                alert('Learning Red Workbook - Coming soon! This workbook provides structured pathways to make your transition manageable. Check your email for more information.');
            } else if (workbookType === 'identity-red') {
                alert('Identity Red Workbook - Coming soon! This workbook helps you understand who you are beyond your role. Check your email for more information.');
            }
        });
    });
}
