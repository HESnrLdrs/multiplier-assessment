// ============================================
// RESULTS PAGE JAVASCRIPT - CLEAN VERSION
// ============================================

// Get scores from URL parameters
function getScoresFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
        motivation: parseFloat(urlParams.get('m')),
        learning: parseFloat(urlParams.get('l')),
        identity: parseFloat(urlParams.get('i')),
        userId: urlParams.get('uid')
    };
}

// Determine which dimensions are red (below 4.0)
function determineReds(scores) {
    const reds = [];
    
    if (scores.motivation < 4.0) reds.push('motivation');
    if (scores.learning < 4.0) reds.push('learning');
    if (scores.identity < 4.0) reds.push('identity');
    
    return reds;
}

// Get color for score
function getScoreColor(score) {
    if (score < 4.0) return 'red';
    if (score < 7.0) return 'amber';
    return 'green';
}

// Get badge emoji
function getBadgeEmoji(color) {
    if (color === 'red') return '🔴';
    if (color === 'amber') return '🟡';
    return '🟢';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const scores = getScoresFromURL();
    
    // Validate scores
    if (isNaN(scores.motivation) || isNaN(scores.learning) || isNaN(scores.identity)) {
        showError();
        return;
    }
    
    // Determine reds
    const reds = determineReds(scores);
    
    // Generate and display content
    displayResults(scores, reds);
    
    // Hide loading, show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results-content').style.display = 'block';
    
    // Trigger email
    triggerResultsEmail(scores, reds);
});

function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
}

function displayResults(scores, reds) {
    const container = document.getElementById('results-content');
    
    let content = '';
    
    if (reds.length === 0) {
        content = generateAllGreenContent(scores);
    } else if (reds.length === 1) {
        // Route to individual red content
        const red = reds[0];
        if (red === 'motivation') content = generateMotivationRedContent(scores);
        else if (red === 'learning') content = generateLearningRedContent(scores);
        else if (red === 'identity') content = generateIdentityRedContent(scores);
    } else {
        content = generateMultipleRedsContent(reds, scores);
    }
    
    container.innerHTML = content;
    
    // Setup CTA button handlers
    setupCTAHandlers(scores.userId);
}

// ============================================
// CONTENT GENERATION FUNCTIONS
// ============================================

function generateScoresHTML(scores) {
    const mColor = getScoreColor(scores.motivation);
    const lColor = getScoreColor(scores.learning);
    const iColor = getScoreColor(scores.identity);
    
    // Calculate capacity score (M × L × I)
    const capacityScore = Math.round(scores.motivation * scores.learning * scores.identity);
    
    return `
        <div class="capacity-score-display" style="text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
            <div style="font-size: 0.9em; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; opacity: 0.9; margin-bottom: 8px;">Transition Capacity Score</div>
            <div style="font-size: 3.5em; font-weight: 700; line-height: 1; margin: 10px 0;">${capacityScore}</div>
            <div style="font-size: 0.85em; opacity: 0.95; max-width: 600px; margin: 10px auto 0;">This multiplicative score (M × L × I) shows how your three dimensions work together. Higher scores indicate greater overall capacity for transition.</div>
        </div>
        
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
    `;
}

// ============================================
// WORKBOOK RECOMMENDATION SYSTEM
// ============================================

function getWorkbookRecommendation(scores, reds) {
    const mColor = getScoreColor(scores.motivation);
    const lColor = getScoreColor(scores.learning);
    const iColor = getScoreColor(scores.identity);
    
    if (reds.length === 3) {
        return { type: 'crisis', primary: null, secondary: null, message: 'With all three dimensions in red, we strongly recommend booking a results review call before purchasing workbooks. We\'ll work together to create an appropriate support plan.' };
    }
    
    if (reds.length === 2) {
        const workbooks = reds.map(r => r + '-red');
        const firstRed = reds[0].charAt(0).toUpperCase() + reds[0].slice(1);
        const secondRed = reds[1].charAt(0).toUpperCase() + reds[1].slice(1);
        const msg = `You have two constraints: ${firstRed} and ${secondRed}. We recommend starting with the ${firstRed} Red Workbook, then moving to ${secondRed}. We will help you prioritize in your results review call.`;
        return { type: 'dual', primary: workbooks[0], secondary: workbooks[1], message: msg };
    }
    
    if (reds.length === 1) {
        const constraint = reds[0];
        let message = '';
        if (constraint === 'motivation') message = 'Your constraint is Motivation. The Motivation Red Workbook provides specific exercises to rebuild your "why" and move from stuck to in motion.';
        else if (constraint === 'learning') message = 'Your constraint is Learning. The Learning Red Workbook provides structured pathways to break down overwhelming transitions into manageable steps.';
        else if (constraint === 'identity') message = 'Your constraint is Identity. The Identity Red Workbook helps you understand who you are beyond your role and translate your identity to new contexts.';
        return { type: 'single-red', primary: constraint + '-red', secondary: null, message: message };
    }
    
    const allGreen = mColor === 'green' && lColor === 'green' && iColor === 'green';
    if (allGreen) {
        return { type: 'no-workbook', primary: null, secondary: null, message: 'You have high capacity across all three dimensions. You don\'t need capacity-building - you need direction and momentum. A results review call will help you create your action plan.' };
    }
    
    const allAmber = mColor === 'amber' && lColor === 'amber' && iColor === 'amber';
    let message = '';
    if (allAmber) {
        message = 'You have workable capacity that could be stronger. The Momentum Workbook will help you develop all three dimensions while creating direction.';
    } else {
        const ambers = [];
        if (mColor === 'amber') ambers.push('Motivation');
        if (lColor === 'amber') ambers.push('Learning');
        if (iColor === 'amber') ambers.push('Identity');
        const greens = [];
        if (mColor === 'green') greens.push('Motivation');
        if (lColor === 'green') greens.push('Learning');
        if (iColor === 'green') greens.push('Identity');
        if (ambers.length === 1) {
            message = `Your ${greens.join(' and ')} are strong. The Momentum Workbook will help you strengthen ${ambers[0]} while building on your existing capacity.`;
        } else {
            message = `Your ${greens.join(', ')} ${greens.length > 1 ? 'are' : 'is'} strong. The Momentum Workbook will help you strengthen ${ambers.join(' and ')} while building on your existing capacity.`;
        }
    }
    return { type: 'momentum', primary: 'momentum', secondary: null, message: message };
}

function generateWorkbookCardHTML(recommendation) {
    if (recommendation.type === 'crisis') {
        return `<div class="cta-card highlight" style="border: 3px solid #e74c3c;"><h3>⚠️ Important: Support Needed</h3><p>${recommendation.message}</p><button class="btn btn-primary" data-action="book-free-call">Book Results Review Call</button></div>`;
    }
    if (recommendation.type === 'no-workbook') {
        return `<div class="cta-card highlight" style="border: 3px solid #27ae60;"><h3>✅ You Have the Capacity</h3><p>${recommendation.message}</p><button class="btn btn-primary" data-action="book-free-call">Book Your Free Results Review</button></div>`;
    }
    if (recommendation.type === 'dual') {
        const primaryName = recommendation.primary.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const secondaryName = recommendation.secondary.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return `<div class="cta-card highlight" style="border: 3px solid #667eea;"><h3>📚 Your Recommended Resources</h3><p><strong>You have two constraints that need addressing.</strong></p><p>${recommendation.message}</p><p class="price" style="color: #667eea; font-weight: 700; font-size: 1.1em; margin: 15px 0;">£35 each</p><div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;"><button class="btn btn-secondary" data-action="view-workbook" data-workbook="${recommendation.primary}">View ${primaryName} Workbook</button><button class="btn btn-secondary" data-action="view-workbook" data-workbook="${recommendation.secondary}">View ${secondaryName} Workbook</button></div></div>`;
    }
    if (recommendation.type === 'single-red') {
        const workbookName = recommendation.primary.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return `<div class="cta-card highlight" style="border: 3px solid #667eea;"><h3>📚 Your Recommended Workbook</h3><p>${recommendation.message}</p><p class="price" style="color: #667eea; font-weight: 700; font-size: 1.2em; margin: 15px 0;">£35</p><button class="btn btn-secondary" data-action="view-workbook" data-workbook="${recommendation.primary}">View ${workbookName} Workbook</button></div>`;
    }
    if (recommendation.type === 'momentum') {
        return `<div class="cta-card highlight" style="border: 3px solid #667eea;"><h3>📚 Your Recommended Workbook</h3><p>${recommendation.message}</p><p class="price" style="color: #667eea; font-weight: 700; font-size: 1.2em; margin: 15px 0;">£35</p><button class="btn btn-secondary" data-action="view-workbook" data-workbook="momentum">View Momentum Workbook</button></div>`;
    }
    return '';
}

// ============================================
// NEXT STEPS WITH WORKBOOKS (FOR SINGLE REDS)
// ============================================

function generateNextStepsHTML_WithWorkbooks(scores, reds) {
    const recommendation = getWorkbookRecommendation(scores, reds);
    
    return `
        <section class="next-steps">
            <h2>Your Next Steps</h2>
            <p>You have several options from here:</p>
            
            <div class="cta-grid">
                <div class="cta-card highlight">
                    <h3>📞 Book a Free Results Review</h3>
                    <p>Let's discuss your results together. Understand your constraint, explore what's blocking you, identify your path forward.</p>
                    <p><strong>No pressure, no commitment - just clarity.</strong></p>
                    <p class="spots">I have 6 spots available each week for these conversations.</p>
                    <button class="btn btn-primary" data-action="book-free-call">Schedule Your Free 30-Minute Call</button>
                </div>
                
                <div class="cta-card">
                    <h3>📥 Download Your Results</h3>
                    <p>Get a detailed PDF of your results including all your scores and what your constraint means.</p>
                    <button class="btn btn-primary" data-action="download-pdf">Download PDF Report</button>
                </div>
                
                ${generateWorkbookCardHTML(recommendation)}
                
                <div class="cta-card">
                    <h3>🎯 Free Pilot Mentoring Session</h3>
                    <p>One 90-minute focused session as part of our pilot programme. Deep dive into your constraint and create your personal action plan.</p>
                    <p style="color: #27ae60; font-weight: 600; font-size: 1.1em; margin: 10px 0;">Free for Pilot Participants</p>
                    <button class="btn btn-secondary" data-action="book-mentoring">Book Free Pilot Session</button>
                </div>
                
                <div class="cta-card">
                    <h3>🎯 Full Coaching Programme</h3>
                    <p>Resolve your constraint completely. 5-10 sessions over 2-5 months with workbooks and exercises.</p>
                    <p class="price" style="color: #667eea; font-weight: 700; font-size: 1.2em; margin: 10px 0;">From £997</p>
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
// INDIVIDUAL RED CONTENT FUNCTIONS
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
                <p>You're stuck not because you lack capability or don't know who you are. <strong>You're stuck because you can't get started.</strong> The "why" isn't clear enough yet. The motivation to move isn't there.</p>
                
                <p>This is one of the most common constraints for people in transition, especially when change feels imposed rather than chosen.</p>
                
                <div class="feelings-check">
                    <p><strong>If you're feeling:</strong></p>
                    <ul>
                        <li>Heavy, like everything requires enormous effort</li>
                        <li>Unable to start even though you know you should</li>
                        <li>Unclear about WHY you're making this change</li>
                        <li>Like you're running away from something rather than toward something</li>
                        <li>Guilty or ashamed about your lack of motivation</li>
                    </ul>
                    <p><strong>That makes complete sense. This is what low motivation looks like.</strong></p>
                </div>
            </section>
            
            <section class="not-alone">
                <h2>You're Not Alone</h2>
                <p>This is <strong>one of the most common constraints</strong> for people in transition, especially when change feels imposed.</p>
                <p>This is particularly common for senior professionals facing redundancy, those in forced career changes, and anyone where the transition wasn't their choice.</p>
                <p class="good-news"><strong>The good news?</strong> Motivation can be rebuilt. It's not a fixed trait. It's a muscle you can strengthen.</p>
            </section>
            
            <section class="why-matters">
                <h2>Why This Matters</h2>
                <p>When Motivation is low, it doesn't matter how capable you are or how clear your identity is. You simply can't move forward.</p>
                
                <div class="two-columns">
                    <div class="column bad">
                        <h3>What happens if you don't address this:</h3>
                        <ul>
                            <li>Procrastination becomes chronic</li>
                            <li>Opportunities pass you by</li>
                            <li>Self-judgment increases</li>
                            <li>Time passes without progress</li>
                            <li>The transition becomes even harder</li>
                        </ul>
                    </div>
                    <div class="column good">
                        <h3>What changes when you fix this:</h3>
                        <ul>
                            <li>Direction becomes clear</li>
                            <li>Energy returns</li>
                            <li>Starting feels possible again</li>
                            <li>You move from "stuck" to "in motion"</li>
                            <li>Your other scores often improve naturally</li>
                        </ul>
                    </div>
                </div>
            </section>
            
            <section class="micro-action">
                <h2>What To Do Right Now</h2>
                <p><strong>Here's the most important thing:</strong> Book a conversation.</p>
                
                <p>Motivation work is personal and requires skilled support. The free results review call is specifically designed to help you understand what's happening with your motivation and create a pathway forward that makes sense for you.</p>
                
                <p><strong>That's it. Just book the call.</strong></p>
            </section>
            
            ${generateNextStepsHTML_WithWorkbooks(scores, ['motivation'])}
            
            ${generateResourceLinksHTML()}
            
            ${generateQuestionsHTML()}
        </div>
    `;
}

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
                <p>You're stuck not because you lack motivation or don't know who you are. <strong>You're stuck because you can't figure out HOW to execute your transition.</strong> You might know what you want, but the practical steps feel overwhelming or impossible.</p>
                
                <p>This is incredibly common for senior professionals who are brilliant in their field but transitioning to something new.</p>
                
                <div class="feelings-check">
                    <p><strong>If you're experiencing:</strong></p>
                    <ul>
                        <li>Overwhelm at all the things you need to learn</li>
                        <li>Paralysis about where to start</li>
                        <li>Uncertainty about what skills you actually need</li>
                        <li>Fear that you're "too old" to learn new things</li>
                        <li>Research paralysis (endless reading, no action)</li>
                    </ul>
                    <p><strong>That makes complete sense. This is what a Learning constraint looks like.</strong></p>
                </div>
            </section>
            
            <section class="not-alone">
                <h2>You're Not Alone</h2>
                <p>This is <strong>very common</strong> for senior professionals changing industries or moving into new sectors.</p>
                <p>It's particularly common for those who've been experts in one domain for decades and are now facing significant skill gaps in their new direction.</p>
                <p class="good-news"><strong>The good news?</strong> Learning capability doesn't diminish with age. You just need the right approach and to break things down into manageable steps.</p>
            </section>
            
            <section class="why-matters">
                <h2>Why This Matters</h2>
                <p>When Learning is your constraint, you know where you want to go but you can't see the path to get there.</p>
                
                <div class="two-columns">
                    <div class="column bad">
                        <h3>What happens if you don't address this:</h3>
                        <ul>
                            <li>Paralysis continues (knowing but not doing)</li>
                            <li>Imposter syndrome intensifies</li>
                            <li>You give up before starting</li>
                            <li>Opportunities require skills you haven't built</li>
                            <li>Confidence erodes further</li>
                        </ul>
                    </div>
                    <div class="column good">
                        <h3>What changes when you fix this:</h3>
                        <ul>
                            <li>The path becomes visible</li>
                            <li>You know what to learn and in what order</li>
                            <li>Action becomes possible</li>
                            <li>Confidence builds with each small step</li>
                            <li>The transition moves from theoretical to practical</li>
                        </ul>
                    </div>
                </div>
            </section>
            
            <section class="micro-action">
                <h2>What To Do Right Now</h2>
                <p><strong>Here's the most important thing:</strong> Book a conversation.</p>
                
                <p>Learning work requires skilled support to break down the overwhelm and create a clear pathway. The free results review call is specifically designed to help you understand what's blocking your learning and create realistic next steps.</p>
                
                <p><strong>That's it. Just book the call.</strong></p>
            </section>
            
            ${generateNextStepsHTML_WithWorkbooks(scores, ['learning'])}
            
            ${generateResourceLinksHTML()}
            
            ${generateQuestionsHTML()}
        </div>
    `;
}

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
                <p>You're stuck not because you lack motivation or capability. <strong>You're stuck because you can't see yourself in your future role.</strong> Your professional identity feels threatened by this change. You might be grieving who you've been, or you can't imagine who you'll become.</p>
                
                <p>This runs deeper than skills or motivation. This is about WHO YOU ARE.</p>
                
                <p>This is the most common constraint for senior professionals who've spent decades building an identity around their role.</p>
                
                <div class="feelings-check">
                    <p><strong>If you're experiencing:</strong></p>
                    <ul>
                        <li>"I don't know who I am without this role"</li>
                        <li>Feeling like you're betraying your past self</li>
                        <li>Imposter syndrome in your new direction</li>
                        <li>Grief about losing your professional identity</li>
                        <li>Fear that you've "wasted" your career</li>
                        <li>Confusion about how to introduce yourself now</li>
                    </ul>
                    <p><strong>That makes complete sense. This is what an Identity constraint looks like.</strong></p>
                </div>
            </section>
            
            <section class="not-alone">
                <h2>You're Not Alone</h2>
                <p>This is <strong>the most common constraint</strong> for senior professionals who've spent decades building an identity around their role.</p>
                <p>It's particularly common for senior leaders stepping out of institutional positions and professionals whose identity was fused with their title or organisation.</p>
                <p class="good-news"><strong>The crucial truth:</strong> You're not losing yourself. You're expanding your expression. Your core self—your values, your capabilities, your way of thinking—all of that travels with you. Only the institutional container is changing.</p>
            </section>
            
            <section class="why-matters">
                <h2>Why This Matters</h2>
                <p>When Identity is your constraint, you might have the skills and motivation to change, but you can't take action because it feels like betraying who you are.</p>
                
                <div class="two-columns">
                    <div class="column bad">
                        <h3>What happens if you don't address this:</h3>
                        <ul>
                            <li>Paralysis despite capability</li>
                            <li>Clinging to old roles that no longer serve you</li>
                            <li>Imposter syndrome intensifies</li>
                            <li>You hide your transition or downplay your experience</li>
                            <li>Opportunities pass because you can't show up as your new self</li>
                        </ul>
                    </div>
                    <div class="column good">
                        <h3>What changes when you fix this:</h3>
                        <ul>
                            <li>You understand who you ACTUALLY are (beyond role)</li>
                            <li>You can translate your identity to new contexts</li>
                            <li>Confidence returns</li>
                            <li>You show up authentically in your new direction</li>
                            <li>The transition feels like evolution, not abandonment</li>
                        </ul>
                    </div>
                </div>
            </section>
            
            <section class="micro-action">
                <h2>What To Do Right Now</h2>
                <p><strong>Here's the most important thing:</strong> Book a conversation.</p>
                
                <p>Identity work is deep, personal, and requires skilled support. This isn't something to figure out alone through exercises.</p>
                
                <p>The free results review call is specifically designed to help you understand what's happening with your identity and create a pathway forward that makes sense for you.</p>
                
                <p><strong>That's it. Just book the call.</strong></p>
            </section>
            
            ${generateNextStepsHTML_WithWorkbooks(scores, ['identity'])}
            
            ${generateResourceLinksHTML()}
            
            ${generateQuestionsHTML()}
        </div>
    `;
}

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
                <p><strong>Here's the most important thing:</strong> Book a conversation.</p>
                
                <p>With multiple constraints, trying to figure this out alone will only add to your overwhelm. The free results review call is specifically designed to help you prioritize, understand what's happening, and create a realistic pathway forward.</p>
                
                <p>We'll work through your constraints together and figure out which one to address first.</p>
                
                <p><strong>That's it. Just book the call.</strong></p>
            </section>
            
            <section class="next-steps">
                <h2>Your Next Steps</h2>
                <p>Having multiple reds means you need support. This is too much to figure out alone.</p>
                
                <div class="cta-grid">
                    <div class="cta-card highlight">
                        <h3>📞 Book a Free Results Review (Recommended)</h3>
                        <p>With multiple constraints, a conversation is really valuable. We'll discuss all your reds, prioritize which to address first, and create a realistic pathway forward.</p>
                        <p class="spots">I have 6 spots available each week. This one is especially important for you.</p>
                        <button class="btn btn-primary" data-action="book-free-call">Schedule Your Free 30-Minute Call</button>
                    </div>
                    
                    ${generateWorkbookCardHTML(getWorkbookRecommendation(scores, reds))}
                    
                    <div class="cta-card">
                        <h3>📥 Download Your Results</h3>
                        <p>Get a detailed PDF of your results including all your scores and what each constraint means.</p>
                        <button class="btn btn-primary" data-action="download-pdf">Download PDF Report</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>🎯 Free Pilot Mentoring Session</h3>
                        <p>One 90-minute focused session as part of our pilot programme. Prioritize your constraints and create a phased action plan.</p>
                        <p style="color: #27ae60; font-weight: 600; font-size: 1.1em; margin: 10px 0;">Free for Pilot Participants</p>
                        <button class="btn btn-secondary" data-action="book-mentoring">Book Free Pilot Session</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>🎯 Full Coaching Programme (Recommended)</h3>
                        <p>Address all your constraints systematically. 7-10 sessions over 3-5 months with workbooks for each constraint.</p>
                        <p class="price" style="color: #667eea; font-weight: 700; font-size: 1.2em; margin: 10px 0;">£1,497-£2,497</p>
                        <button class="btn btn-secondary" data-action="view-packages">Learn About Coaching Packages</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>📧 Stay Connected</h3>
                        <p>I'll send you an email in the next hour with your results PDF and information about working with multiple constraints.</p>
                        <p class="reassurance">Take your time to process your results.</p>
                    </div>
                </div>
            </section>
            
            ${generateResourceLinksHTML()}
            
            ${generateQuestionsHTML()}
        </div>
    `;
}

function generateAllGreenContent(scores) {
    const mColor = getScoreColor(scores.motivation);
    const lColor = getScoreColor(scores.learning);
    const iColor = getScoreColor(scores.identity);
    
    // Identify amber scores
    const ambers = [];
    if (mColor === 'amber') ambers.push({ name: 'Motivation', score: scores.motivation });
    if (lColor === 'amber') ambers.push({ name: 'Learning', score: scores.learning });
    if (iColor === 'amber') ambers.push({ name: 'Identity', score: scores.identity });
    
    // Check if all green
    const allGreen = mColor === 'green' && lColor === 'green' && iColor === 'green';
    
    // Generate appropriate heading and description
    let heading, constraintLabel, whatThisMeansContent;
    
    if (allGreen) {
        heading = 'Your Results: High Capacity';
        constraintLabel = '<p style="color: #27ae60; font-size: 1.1em; font-weight: 600; margin: 20px 0; text-align: center;">Excellent: <strong>High Capacity Across All Dimensions</strong></p>';
        whatThisMeansContent = `
            <p>You have high capacity across all three dimensions (Motivation, Learning, and Identity). This is excellent - you have a strong foundation.</p>
            
            <p class="good-news"><strong>You're ready to move forward.</strong> You have the motivation, the learning capability, and the clarity of identity.</p>
            
            <p>Your transition capacity score of ${Math.round(scores.motivation * scores.learning * scores.identity)} shows you have real strength to work with. The question isn't whether you can make a successful transition - it's about choosing your direction and taking action.</p>
        `;
    } else if (ambers.length === 1) {
        const amber = ambers[0];
        heading = `Your Results: One Amber Area - ${amber.name}`;
        constraintLabel = `<p class="constraint-label" style="color: #f39c12;">Your ${amber.name} is workable but could be stronger</p>`;
        whatThisMeansContent = `
            <p>Your ${amber.name} dimension is in the amber zone (${amber.score.toFixed(1)}/10). This means you have some capacity here, but it could be stronger.</p>
            
            <p>Your other dimensions are in good shape (green), so focusing on strengthening your ${amber.name} capacity will give you the best return.</p>
            
            <p class="good-news"><strong>This is very workable.</strong> You're not blocked - you just have one area that could benefit from targeted development.</p>
        `;
    } else {
        // Multiple ambers
        const amberNames = ambers.map(a => a.name).join(' and ');
        heading = 'Your Results: Multiple Amber Areas';
        constraintLabel = `<p class="constraint-label" style="color: #f39c12;">Your ${amberNames} could be stronger</p>`;
        whatThisMeansContent = `
            <p>You have ${ambers.length} dimensions in the amber zone: ${ambers.map(a => `${a.name} (${a.score.toFixed(1)}/10)`).join(', ')}.</p>
            
            <p>This means you have workable capacity that could be strengthened. You're not blocked, but developing these areas will make your transition significantly easier.</p>
            
            <p class="good-news"><strong>The good news:</strong> You don't have any major constraints (reds). You have a solid foundation to build from.</p>
        `;
    }
    
    return `
        <div class="results-header">
            <h1>${heading}</h1>
            ${generateScoresHTML(scores)}
            ${constraintLabel}
        </div>
        
        <div class="results-content">
            <section class="what-this-means">
                <h2>What This Means</h2>
                ${whatThisMeansContent}
            </section>
            
            <section class="next-steps">
                <h2>Your Next Steps</h2>
                <p>You have several options from here:</p>
                
                <div class="cta-grid">
                    <div class="cta-card highlight">
                        <h3>📞 Book a Free Results Review</h3>
                        <p>Let's discuss your results together. ${allGreen ? 'Explore your direction and create your action plan.' : 'Understand your amber areas and identify your path forward.'}</p>
                        <p><strong>No pressure, no commitment - just clarity.</strong></p>
                        <p class="spots">I have 6 spots available each week for these conversations.</p>
                        <button class="btn btn-primary" data-action="book-free-call">Schedule Your Free 30-Minute Call</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>📥 Download Your Results</h3>
                        <p>Get a detailed PDF of your results including strategies and resources for next steps.</p>
                        <button class="btn btn-primary" data-action="download-pdf">Download PDF Report</button>
                    </div>
                    
                    ${allGreen ? '' : generateWorkbookCardHTML(getWorkbookRecommendation(scores, []))}
                    
                    <div class="cta-card">
                        <h3>🎯 Free Pilot Mentoring Session</h3>
                        <p>One 90-minute focused session as part of our pilot programme. ${allGreen ? 'Create your transition action plan.' : 'Strengthen your amber areas and create momentum.'}</p>
                        <p style="color: #27ae60; font-weight: 600; font-size: 1.1em; margin: 10px 0;">Free for Pilot Participants</p>
                        <button class="btn btn-secondary" data-action="book-mentoring">Book Free Pilot Session</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>🎯 Full Coaching Programme</h3>
                        <p>${allGreen ? 'Create and execute your transition strategy.' : 'Strengthen your capacity and navigate your transition.'} 5-10 sessions over 2-5 months with workbooks and exercises.</p>
                        <p class="price" style="color: #667eea; font-weight: 700; font-size: 1.2em; margin: 10px 0;">From £997</p>
                        <button class="btn btn-secondary" data-action="view-packages">Learn About Coaching Packages</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>📧 Stay Connected</h3>
                        <p>Not ready to book anything yet? That's completely fine. I'll send you an email in the next hour with your results PDF and more resources.</p>
                        <p class="reassurance">Take your time. This is your journey.</p>
                    </div>
                </div>
            </section>
            
            ${generateResourceLinksHTML()}
            
            ${generateQuestionsHTML()}
        </div>
    `;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateResourceLinksHTML() {
    return `
        <section class="resource-links-section" style="margin: 40px 0; padding: 30px; background: #f8f9fa; border-radius: 10px; border-top: 3px solid #667eea;">
            <h2 style="text-align: center; color: #333; margin-bottom: 10px;">Learn More About Your Results</h2>
            <p style="text-align: center; color: #666; margin-bottom: 25px;">Explore these resources to understand your assessment better:</p>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <a href="faq.html" target="_blank" style="display: flex; flex-direction: column; align-items: center; padding: 20px 30px; background: white; border: 2px solid #3498db; border-radius: 10px; text-decoration: none; color: #3498db; transition: all 0.3s ease; min-width: 150px; text-align: center;">
                    <span style="font-size: 2em; margin-bottom: 10px;">❓</span>
                    <span style="font-weight: 600;">FAQ</span>
                </a>
                <a href="visual-guide.html" target="_blank" style="display: flex; flex-direction: column; align-items: center; padding: 20px 30px; background: white; border: 2px solid #3498db; border-radius: 10px; text-decoration: none; color: #3498db; transition: all 0.3s ease; min-width: 150px; text-align: center;">
                    <span style="font-size: 2em; margin-bottom: 10px;">📊</span>
                    <span style="font-weight: 600;">Visual Guide</span>
                </a>
                <a href="how-scoring-works.html" target="_blank" style="display: flex; flex-direction: column; align-items: center; padding: 20px 30px; background: white; border: 2px solid #3498db; border-radius: 10px; text-decoration: none; color: #3498db; transition: all 0.3s ease; min-width: 150px; text-align: center;">
                    <span style="font-size: 2em; margin-bottom: 10px;">🔢</span>
                    <span style="font-weight: 600;">How Scoring Works</span>
                </a>
            </div>
        </section>
    `;
}

function generateQuestionsHTML() {
    return `
        <section class="questions">
            <p><strong>Questions?</strong></p>
            <p>Email me directly: <a href="mailto:paul@paulthomascoaching.co.uk">paul@paulthomascoaching.co.uk</a></p>
            <p>Phone: <a href="tel:+447368621415">+44 7368 621415</a></p>
            <p>I read and respond to every message personally.</p>
            
            <div style="margin-top: 30px; text-align: center;">
                <button class="btn btn-primary" onclick="window.location.href='assessment.html'" style="max-width: 300px; margin: 0 auto;">
                    ← Back to Dashboard
                </button>
            </div>
        </section>
    `;
}

// ============================================
// PDF DOWNLOAD HELPER FUNCTION
// ============================================

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

// ============================================
// CTA BUTTON HANDLERS
// ============================================

function setupCTAHandlers(userId) {
    // Download PDF
    const pdfButtons = document.querySelectorAll('[data-action="download-pdf"]');
    pdfButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const scores = getScoresFromURL();
            const reds = determineReds(scores);
            
            if (reds.length === 0) {
                alert('Your scores are all in good range! Check your email for next steps.');
            } else if (reds.length === 1) {
                const redType = reds[0];
                window.open(`guides/${redType}-red-guide.pdf`, '_blank');
            } else {
                showPDFDownloadOptions(reds);
            }
        });
    });
    
    // Book free call
    const freeCallButtons = document.querySelectorAll('[data-action="book-free-call"]');
    freeCallButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.open('https://calendar.app.google/Nc3urDDTvUYpXubeA', '_blank');
        });
    });
    
    // Book mentoring
    const mentoringButtons = document.querySelectorAll('[data-action="book-mentoring"]');
    mentoringButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.open('https://calendar.app.google/Nc3urDDTvUYpXubeA', '_blank');
        });
    });
    
    // View packages
    const packagesButtons = document.querySelectorAll('[data-action="view-packages"]');
    packagesButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Coaching packages page coming soon!');
        });
    });
    
    // FAQ button
    const faqButtons = document.querySelectorAll('[data-action="faq"]');
    faqButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = 'faq.html';
        });
    });
    
    // Visual Guide button
    const visualGuideButtons = document.querySelectorAll('[data-action="visual-guide"]');
    visualGuideButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = 'visual-guide.html';
        });
    });
    
    // How Scoring Works button
    const scoringButtons = document.querySelectorAll('[data-action="how-scoring-works"]');
    scoringButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            window.location.href = 'how-scoring-works.html';
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
                alert('Motivation Red Workbook information coming soon! Check your email for details.');
            } else if (workbookType === 'learning-red') {
                alert('Learning Red Workbook information coming soon! Check your email for details.');
            } else if (workbookType === 'identity-red') {
                alert('Identity Red Workbook information coming soon! Check your email for details.');
            }
        });
    });
}

// ============================================
// EMAIL TRIGGER
// ============================================

function triggerResultsEmail(scores, reds) {
    console.log('Email triggered for:', {
        scores: scores,
        reds: reds
    });
}
