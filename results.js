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
                <h3>📚 Your Recommended Workbooks</h3>
                <p>${recommendation.message}</p>
                <p class="price" style="font-size: 1.2em; color: #667eea; font-weight: bold; margin: 15px 0;">£35 each</p>
                <div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-secondary" data-action="purchase-workbook" data-workbook="${recommendation.primary}">Purchase ${recommendation.primary.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Workbook (£35)</button>
                    <button class="btn btn-secondary" data-action="purchase-workbook" data-workbook="${recommendation.secondary}">Purchase ${recommendation.secondary.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Workbook (£35)</button>
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
                <h3>📚 Your Recommended Workbook</h3>
                <p><strong>${workbookTitle}</strong></p>
                <p>${recommendation.message}</p>
                <p class="price" style="font-size: 1.4em; color: #667eea; font-weight: bold; margin: 15px 0;">£35</p>
                <button class="btn btn-primary" data-action="purchase-workbook" data-workbook="${recommendation.primary}">Purchase ${workbookTitle}</button>
            </div>
        `;
    }
    
    // Momentum workbook
    if (recommendation.type === 'momentum') {
        return `
            <div class="cta-card highlight" style="border: 3px solid #27ae60;">
                <h3>📚 Your Recommended Workbook</h3>
                <p><strong>Momentum Workbook</strong></p>
                <p>${recommendation.message}</p>
                <p class="price" style="font-size: 1.4em; color: #27ae60; font-weight: bold; margin: 15px 0;">£35</p>
                <button class="btn btn-primary" data-action="purchase-workbook" data-workbook="momentum">Purchase Momentum Workbook</button>
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
                    <h3>📥 Download Your Comprehensive Report</h3>
                    <p>Get your professional 2-page assessment report with detailed analysis and personalized action plan (Word document).</p>
                    <button class="btn btn-primary" data-action="download-pdf">Download Report</button>
                </div>
                
                <div class="cta-card">
                    <h3>📞 Book a Free Results Review</h3>
                    <p>Let's discuss your results together. Understand your constraint, explore what's blocking you, identify your path forward.</p>
                    <p><strong>No pressure, no commitment - just clarity.</strong></p>
                    <p class="spots">I have 6 spots available each week for these conversations.</p>
                    <button class="btn btn-primary" data-action="book-free-call">Schedule Your Free 30-Minute Call</button>
                </div>
                
                <div class="cta-card">
                    <h3>🎯 Starter Package</h3>
                    <p>Your recommended workbook plus 2 x 60-minute coaching sessions to work through it together.</p>
                    <p class="price">£350</p>
                    <button class="btn btn-secondary" data-action="view-packages">Learn More</button>
                </div>
                
                <div class="cta-card">
                    <h3>🎯 Core Programme</h3>
                    <p>All workbooks you need plus 5 x 60-minute coaching sessions. Resolve your constraint completely.</p>
                    <p class="price">£500</p>
                    <button class="btn btn-secondary" data-action="view-packages">Learn More</button>
                </div>
                
                <div class="cta-card">
                    <h3>🎯 Premium Programme</h3>
                    <p>1 year of support with 8 x 60-minute sessions. All workbooks included. Navigate your complete transition.</p>
                    <p class="price">£997</p>
                    <button class="btn btn-secondary" data-action="view-packages">Learn More</button>
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
        <section class="resources" style="margin: 60px 0; padding: 40px; background: #f8f9fa; border-radius: 12px;">
            <h2 style="text-align: center; margin-bottom: 30px;">Learn More About Your Results</h2>
            <p style="text-align: center; margin-bottom: 40px; color: #666;">Explore these resources to understand the M×L×I framework and your assessment better:</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <a href="faq.html" target="_blank" style="display: block; padding: 30px; background: white; border-radius: 10px; text-decoration: none; color: #2c3e50; border: 2px solid #e0e0e0; transition: all 0.3s ease; text-align: center;">
                    <div style="font-size: 3em; margin-bottom: 15px;">❓</div>
                    <h3 style="margin: 0 0 10px 0; color: #667eea;">Frequently Asked Questions</h3>
                    <p style="margin: 0; color: #666; font-size: 0.95em;">Common questions about the assessment and what your results mean</p>
                </a>
                
                <a href="visual-guide.html" target="_blank" style="display: block; padding: 30px; background: white; border-radius: 10px; text-decoration: none; color: #2c3e50; border: 2px solid #e0e0e0; transition: all 0.3s ease; text-align: center;">
                    <div style="font-size: 3em; margin-bottom: 15px;">📊</div>
                    <h3 style="margin: 0 0 10px 0; color: #667eea;">Visual Explanation</h3>
                    <p style="margin: 0; color: #666; font-size: 0.95em;">See how the M×L×I formula works with real examples and scenarios</p>
                </a>
                
                <a href="how-scoring-works.html" target="_blank" style="display: block; padding: 30px; background: white; border-radius: 10px; text-decoration: none; color: #2c3e50; border: 2px solid #e0e0e0; transition: all 0.3s ease; text-align: center;">
                    <div style="font-size: 3em; margin-bottom: 15px;">🔢</div>
                    <h3 style="margin: 0 0 10px 0; color: #667eea;">How Scoring Works</h3>
                    <p style="margin: 0; color: #666; font-size: 0.95em;">Understand the methodology and why multiplication reveals constraints</p>
                </a>
            </div>
        </section>
    `;
}

// ============================================
// ENHANCED 2-PAGE REPORT GENERATION
// ============================================

async function generateAndDownloadReport(scores, reds) {
    // Check if docx library is available
    if (typeof docx === 'undefined') {
        alert('Report library is loading... Please wait a moment and try again.');
        return;
    }

    const { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableCell, TableRow, WidthType, Packer } = docx;
    
    // Get user info
    const userName = urlParams.get('name') || 'Assessment Participant';
    const userEmail = urlParams.get('email') || '';
    const assessmentDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Determine constraint text
    let constraintText = '';
    if (reds.length === 0) {
        constraintText = 'No significant constraints - strong capacity across all dimensions';
    } else if (reds.length === 1) {
        constraintText = reds[0].charAt(0).toUpperCase() + reds[0].slice(1) + ' is your primary constraint';
    } else if (reds.length === 2) {
        constraintText = reds.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(' and ') + ' are your primary constraints';
    } else {
        constraintText = 'Multiple constraints - immediate support recommended';
    }
    
    const recommendation = getWorkbookRecommendation(scores, reds);
    
    // Enhanced traffic light with actual colors
    const getTrafficLightColor = (score) => {
        if (score >= 7.0) return '27ae60'; // Green
        if (score >= 5.0) return 'f39c12'; // Amber/Orange
        return 'e74c3c'; // Red
    };
    
    const getTrafficLightText = (score) => {
        if (score >= 7.0) return '● GREEN';
        if (score >= 5.0) return '● AMBER';
        return '● RED';
    };
    
    const getAssessment = (score) => {
        if (score >= 7.0) return 'STRONG';
        if (score >= 5.0) return 'WORKABLE';
        return 'CONSTRAINT';
    };
    
    const getAssessmentColor = (score) => {
        if (score >= 7.0) return '27ae60'; // Green
        if (score >= 5.0) return 'f39c12'; // Amber
        return 'e74c3c'; // Red
    };
    
    // Create document with enhanced formatting
    const doc = new Document({
        sections: [{
            children: [
                // === HEADER - More prominent ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 150 },
                    children: [new TextRun({ text: "NAVIGATING TRANSITION", bold: true, size: 56, color: "1F4788" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 },
                    children: [new TextRun({ text: "M×L×I Assessment Report", size: 40, color: "2E5C8A", italics: true })]
                }),
                
                // === PARTICIPANT INFO - Enhanced box effect ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                    children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 22, color: "95a5a6" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 150 },
                    children: [new TextRun({ text: userName, bold: true, size: 40, color: "1F4788" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [new TextRun({ text: userEmail, size: 24, color: "34495e" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [new TextRun({ text: `Assessment Date: ${assessmentDate}`, size: 22, italics: true, color: "7f8c8d" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 },
                    children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 22, color: "95a5a6" })]
                }),
                
                // === CAPACITY SCORE - MUCH bigger and more impactful ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 300 },
                    children: [new TextRun({ text: "YOUR CAPACITY SCORE", bold: true, size: 32, color: "2c3e50" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [new TextRun({ text: scores.capacityScore.toString(), bold: true, size: 96, color: "667eea" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 },
                    children: [new TextRun({ text: `M×L×I = ${scores.motivation.toFixed(1)} × ${scores.learning.toFixed(1)} × ${scores.identity.toFixed(1)}`, size: 28, color: "34495e" })]
                }),
                
                // === PRIMARY CONSTRAINT - Enhanced ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 300, after: 200 },
                    children: [new TextRun({ text: "Primary Constraint:", size: 26, color: "2c3e50" })]
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 800 },
                    children: [new TextRun({ text: constraintText, bold: true, size: 28, color: "e74c3c" })]
                }),
                
                // === PAGE BREAK ===
                new Paragraph({ pageBreakBefore: true }),
                
                // === DETAILED SCORES - Enhanced section ===
                new Paragraph({
                    spacing: { before: 400, after: 600 },
                    children: [new TextRun({ text: "DETAILED DIMENSIONAL SCORES", bold: true, size: 32, color: "2c3e50" })]
                }),
                
                // === MOTIVATION - Enhanced with color ===
                new Paragraph({
                    spacing: { before: 300, after: 150 },
                    children: [new TextRun({ text: "MOTIVATION", bold: true, size: 28, color: "1F4788" })]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({ text: "Score: ", size: 24, color: "34495e" }),
                        new TextRun({ text: `${scores.motivation.toFixed(1)}/10`, bold: true, size: 24, color: "1F4788" })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({ text: "Status: ", size: 24, color: "34495e" }),
                        new TextRun({ text: getTrafficLightText(scores.motivation), bold: true, size: 24, color: getTrafficLightColor(scores.motivation) })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 400 },
                    children: [
                        new TextRun({ text: "Assessment: ", size: 24, color: "34495e" }),
                        new TextRun({ text: getAssessment(scores.motivation), bold: true, size: 24, color: getAssessmentColor(scores.motivation) })
                    ]
                }),
                
                // === LEARNING - Enhanced with color ===
                new Paragraph({
                    spacing: { before: 300, after: 150 },
                    children: [new TextRun({ text: "LEARNING", bold: true, size: 28, color: "2E5C8A" })]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({ text: "Score: ", size: 24, color: "34495e" }),
                        new TextRun({ text: `${scores.learning.toFixed(1)}/10`, bold: true, size: 24, color: "2E5C8A" })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({ text: "Status: ", size: 24, color: "34495e" }),
                        new TextRun({ text: getTrafficLightText(scores.learning), bold: true, size: 24, color: getTrafficLightColor(scores.learning) })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 400 },
                    children: [
                        new TextRun({ text: "Assessment: ", size: 24, color: "34495e" }),
                        new TextRun({ text: getAssessment(scores.learning), bold: true, size: 24, color: getAssessmentColor(scores.learning) })
                    ]
                }),
                
                // === IDENTITY - Enhanced with color ===
                new Paragraph({
                    spacing: { before: 300, after: 150 },
                    children: [new TextRun({ text: "IDENTITY", bold: true, size: 28, color: "4A7BA7" })]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({ text: "Score: ", size: 24, color: "34495e" }),
                        new TextRun({ text: `${scores.identity.toFixed(1)}/10`, bold: true, size: 24, color: "4A7BA7" })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({ text: "Status: ", size: 24, color: "34495e" }),
                        new TextRun({ text: getTrafficLightText(scores.identity), bold: true, size: 24, color: getTrafficLightColor(scores.identity) })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 600 },
                    children: [
                        new TextRun({ text: "Assessment: ", size: 24, color: "34495e" }),
                        new TextRun({ text: getAssessment(scores.identity), bold: true, size: 24, color: getAssessmentColor(scores.identity) })
                    ]
                }),
                
                // === Separator line ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 600 },
                    children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 22, color: "95a5a6" })]
                }),
                
                // === FRAMEWORK - Enhanced ===
                new Paragraph({
                    spacing: { before: 400, after: 500 },
                    children: [new TextRun({ text: "UNDERSTANDING THE M×L×I FRAMEWORK", bold: true, size: 32, color: "2c3e50" })]
                }),
                new Paragraph({
                    spacing: { after: 500 },
                    children: [new TextRun({ text: "The M×L×I assessment measures three dimensions that determine your readiness for career transition. These dimensions work together multiplicatively - meaning that weakness in any one area constrains your overall capacity.", size: 24, color: "34495e" })]
                }),
                
                // === MOTIVATION dimension ===
                new Paragraph({
                    spacing: { before: 300, after: 150 },
                    children: [new TextRun({ text: "MOTIVATION (M)", bold: true, size: 26, color: "1F4788" })]
                }),
                new Paragraph({
                    spacing: { after: 400 },
                    children: [new TextRun({ text: "Your drive and commitment to making the transition happen", size: 24, color: "34495e" })]
                }),
                
                // === LEARNING dimension ===
                new Paragraph({
                    spacing: { before: 300, after: 150 },
                    children: [new TextRun({ text: "LEARNING (L)", bold: true, size: 26, color: "2E5C8A" })]
                }),
                new Paragraph({
                    spacing: { after: 400 },
                    children: [new TextRun({ text: "Your readiness and capability to acquire new skills and adapt to new roles", size: 24, color: "34495e" })]
                }),
                
                // === IDENTITY dimension ===
                new Paragraph({
                    spacing: { before: 300, after: 150 },
                    children: [new TextRun({ text: "IDENTITY (I)", bold: true, size: 26, color: "4A7BA7" })]
                }),
                new Paragraph({
                    spacing: { after: 600 },
                    children: [new TextRun({ text: "Your clarity about who you are professionally and who you're becoming", size: 24, color: "34495e" })]
                }),
                
                // === Separator line ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 600 },
                    children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 22, color: "95a5a6" })]
                }),
                
                // === NEXT STEPS - Enhanced ===
                new Paragraph({
                    spacing: { before: 400, after: 500 },
                    children: [new TextRun({ text: "YOUR RECOMMENDED NEXT STEPS", bold: true, size: 32, color: "2c3e50" })]
                }),
                new Paragraph({
                    spacing: { after: 500 },
                    children: [new TextRun({ text: recommendation.message, size: 26, color: "34495e" })]
                }),
                
                // === Action steps - Enhanced formatting ===
                new Paragraph({
                    spacing: { before: 300, after: 250 },
                    children: [
                        new TextRun({ text: "1. ", bold: true, size: 26, color: "667eea" }),
                        new TextRun({ 
                            text: reds.length === 3 ? "Book a results review call to create your support plan" : 
                                  reds.length >= 1 ? `Work through your recommended ${recommendation.primary ? recommendation.primary.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : ''} Workbook` :
                                  "Book a strategic coaching call to discuss direction and deployment of your capacity",
                            size: 26,
                            color: "34495e"
                        })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 250 },
                    children: [
                        new TextRun({ text: "2. ", bold: true, size: 26, color: "667eea" }),
                        new TextRun({ text: "Complete the micro-action from your results page", size: 26, color: "34495e" })
                    ]
                }),
                new Paragraph({
                    spacing: { after: 700 },
                    children: [
                        new TextRun({ text: "3. ", bold: true, size: 26, color: "667eea" }),
                        new TextRun({ text: "Book a free 30-minute results review call to discuss your path forward", size: 26, color: "34495e" })
                    ]
                }),
                
                // === Separator line ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 600 },
                    children: [new TextRun({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", size: 22, color: "95a5a6" })]
                }),
                
                // === CONTACT - Enhanced ===
                new Paragraph({
                    spacing: { before: 400, after: 400 },
                    children: [new TextRun({ text: "CONTACT INFORMATION", bold: true, size: 28, color: "2c3e50" })]
                }),
                new Paragraph({
                    spacing: { after: 150 },
                    children: [new TextRun({ text: "Paul Thomas Coaching Ltd", bold: true, size: 24, color: "1F4788" })]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [new TextRun({ text: "Email: paul@paulthomascoaching.co.uk", size: 24, color: "34495e" })]
                }),
                new Paragraph({
                    spacing: { after: 100 },
                    children: [new TextRun({ text: "Phone: +44 7368 621415", size: 24, color: "34495e" })]
                }),
                new Paragraph({
                    spacing: { after: 600 },
                    children: [new TextRun({ text: "Website: navigatetransition.co.uk", size: 24, color: "34495e" })]
                }),
                
                // === FOOTER ===
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 800 },
                    children: [new TextRun({ text: "© 2025 Paul Thomas Coaching Ltd. All rights reserved.", size: 22, color: "7f8c8d", italics: true })]
                })
            ]
        }]
    });
    
    // Generate and download
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${userName.replace(/\s+/g, '_')}_Navigating_Transition_Report.docx`;
    link.click();
    window.URL.revokeObjectURL(url);
}

// ============================================
// CTA BUTTON HANDLERS
// ============================================

function setupCTAHandlers(userId) {
    // Download Report button (2-page Word document)
    const pdfButtons = document.querySelectorAll('[data-action="download-pdf"]');
    pdfButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            generateAndDownloadReport(scores, reds);
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
            alert('NAVIGATING TRANSITION COACHING PACKAGES:\n\n' +
                  '🎯 STARTER PACKAGE - £350\n' +
                  'Your recommended workbook + 2 x 60-minute coaching sessions\n\n' +
                  '🎯 CORE PROGRAMME - £500\n' +
                  'All workbooks you need + 5 x 60-minute coaching sessions\n' +
                  'Resolve your constraint completely\n\n' +
                  '🎯 PREMIUM PROGRAMME - £997\n' +
                  '1 year of support with 8 x 60-minute sessions\n' +
                  'All workbooks included\n\n' +
                  'To discuss which package is right for you, email paul@paulthomascoaching.co.uk or call +44 7368 621415');
        });
    });
    
    // Workbook purchase buttons
    const workbookButtons = document.querySelectorAll('[data-action="purchase-workbook"]');
    workbookButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const workbookType = this.getAttribute('data-workbook');
            
            let workbookName = '';
            if (workbookType === 'momentum') {
                workbookName = 'Momentum Workbook';
            } else if (workbookType === 'motivation-red') {
                workbookName = 'Motivation Red Workbook';
            } else if (workbookType === 'learning-red') {
                workbookName = 'Learning Red Workbook';
            } else if (workbookType === 'identity-red') {
                workbookName = 'Identity Red Workbook';
            }
            
            // For now, show contact message - will be replaced with PayPal link
            alert(`To purchase the ${workbookName} (£35), please email paul@paulthomascoaching.co.uk or call +44 7368 621415.\n\nPayPal payment link coming soon!`);
            
            // Future: Replace with PayPal payment link
            // window.open('https://paypal.me/yourlink', '_blank');
        });
    });
}
