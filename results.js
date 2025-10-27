// ============================================
// RESULTS PAGE JAVASCRIPT
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

// Determine which dimensions are red (below 5.0)
function determineReds(scores) {
    const reds = [];
    
    if (scores.motivation < 5.0) reds.push('motivation');
    if (scores.learning < 5.0) reds.push('learning');
    if (scores.identity < 5.0) reds.push('identity');
    
    return reds;
}

// Get color for score
function getScoreColor(score) {
    if (score < 5.0) return 'red';
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
    
    // Trigger email (Priority 3)
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
        content = generateSingleRedContent(reds[0], scores);
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
    `;
}

function generateSingleRedContent(red, scores) {
    if (red === 'motivation') return generateMotivationRedContent(scores);
    if (red === 'learning') return generateLearningRedContent(scores);
    if (red === 'identity') return generateIdentityRedContent(scores);
}

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
                <p>This is particularly common for academics facing redundancy, senior professionals in forced career changes, and anyone where the transition wasn't their choice.</p>
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
                <p><strong>Here's one small action you can take today</strong> (takes 5 minutes):</p>
                
                <div class="exercise-box">
                    <h3>The Choice vs Chance Exercise</h3>
                    <p>Get a piece of paper. Draw a line down the middle.</p>
                    <p><strong>Left side:</strong> Write what was IMPOSED on you (what you didn't choose)</p>
                    <p><strong>Right side:</strong> Write what you CAN CHOOSE (your response, your next steps, who you become)</p>
                    
                    <p class="example">Example:</p>
                    <ul>
                        <li><strong>Imposed:</strong> Redundancy, restructure, job loss</li>
                        <li><strong>Can Choose:</strong> How I respond, where I go next, what I learn from this, who I ask for help</li>
                    </ul>
                    
                    <p>This simple exercise begins to shift you from victim to author of your story.</p>
                    <p><strong>That's it. Just do that today.</strong></p>
                </div>
            </section>
            
            ${generateNextStepsHTML()}
            
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
                
                <p>This is incredibly common for academics and senior professionals who are brilliant in their field but transitioning to something new.</p>
                
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
                <p>This is <strong>very common</strong> for academics moving outside traditional academia and senior professionals changing industries.</p>
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
                <p><strong>Here's one small action you can take today</strong> (takes 10 minutes):</p>
                
                <div class="exercise-box">
                    <h3>The Mountain Top Exercise</h3>
                    <p>Get a piece of paper.</p>
                    <p><strong>Step 1:</strong> Describe where you want to be in 12 months (your "mountain top")</p>
                    <p><strong>Step 2:</strong> Ask: "What's the step RIGHT BEFORE that?" Write it down.</p>
                    <p><strong>Step 3:</strong> Ask: "What's the step before THAT?" Write it down.</p>
                    <p><strong>Step 4:</strong> Keep working backward until you reach where you are TODAY.</p>
                    
                    <p><strong>You just created a path up the mountain.</strong></p>
                    <p>The overwhelming transition just became a series of steps. You don't need to do them all today. Just identify step 1.</p>
                    <p><strong>That's it. Just do that today.</strong></p>
                </div>
            </section>
            
            ${generateNextStepsHTML()}
            
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
                
                <p>This is the most common constraint for senior academics and professionals who've spent decades building an identity around their role.</p>
                
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
                <p>This is <strong>the most common constraint</strong> for senior academics and professionals who've spent decades building an identity around their role.</p>
                <p>It's particularly common for academics leaving traditional academic roles, senior leaders stepping out of institutional positions, and professionals whose identity was fused with their title.</p>
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
                <p><strong>Here's one small action you can take today</strong> (takes 10 minutes):</p>
                
                <div class="exercise-box">
                    <h3>The Four-Layer Identity Exercise</h3>
                    <p>Get a piece of paper. Draw four boxes.</p>
                    <p><strong>Layer 1 - Core Self:</strong> What values have ALWAYS been true for you? (Even before your career)</p>
                    <p><strong>Layer 2 - Professional Self:</strong> What capabilities do you have? (These travel with you)</p>
                    <p><strong>Layer 3 - Institutional Self:</strong> What role/title are you leaving? (This is what's changing)</p>
                    <p><strong>Layer 4 - Social Self:</strong> How do others see you? (This will adapt)</p>
                    
                    <p><strong>The revelation:</strong> Only Layer 3 is actually changing. Layers 1 and 2 are YOURS forever.</p>
                    <p>You're not losing yourself. You're just changing the container.</p>
                    <p><strong>That's it. Just do that today.</strong></p>
                </div>
            </section>
            
            ${generateNextStepsHTML()}
            
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
                <p>This is most common for academics facing sudden redundancy, senior professionals in forced career changes, and anyone experiencing significant imposed change.</p>
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
            
            <section class="next-steps">
                <h2>Your Next Steps</h2>
                <p>Having multiple reds means you need support. This is too much to figure out alone.</p>
                
                <div class="cta-grid">
                    <div class="cta-card">
                        <h3>📥 Download Your Results</h3>
                        <p>Get a detailed PDF of your results including all your scores and what each constraint means.</p>
                        <button class="btn btn-primary" data-action="download-pdf">Download PDF Report</button>
                    </div>
                    
                    <div class="cta-card highlight">
                        <h3>📞 Book a Free Results Review (Recommended)</h3>
                        <p>With multiple constraints, a conversation is really valuable. We'll discuss all your reds, prioritize which to address first, and create a realistic pathway forward.</p>
                        <p class="spots">I have 6 spots available each week. This one is especially important for you.</p>
                        <button class="btn btn-primary" data-action="book-free-call">Schedule Your Free 30-Minute Call</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>🎯 Single Mentoring Session</h3>
                        <p>One 90-minute focused session to prioritize your constraints and create a phased action plan.</p>
                        <p class="price">£197</p>
                        <button class="btn btn-secondary" data-action="book-mentoring">Book Mentoring Session</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>🎯 Full Coaching Programme (Recommended)</h3>
                        <p>Address all your constraints systematically. 7-10 sessions over 3-5 months with workbooks for each constraint.</p>
                        <p class="price">£1,497-£2,497</p>
                        <button class="btn btn-secondary" data-action="view-packages">Learn About Coaching Packages</button>
                    </div>
                    
                    <div class="cta-card">
                        <h3>📧 Stay Connected</h3>
                        <p>I'll send you an email in the next hour with your results PDF and information about working with multiple constraints.</p>
                        <p class="reassurance">Take your time to process your results.</p>
                    </div>
                </div>
            </section>
            
            ${generateQuestionsHTML()}
        </div>
    `;
}

function generateAllGreenContent(scores) {
    return `
        <div class="results-header">
            <h1>Your Results: No Major Constraints</h1>
            ${generateScoresHTML(scores)}
            <p class="constraint-label">Great news: <strong>No Red Constraints</strong></p>
        </div>
        
        <div class="results-content">
            <section>
                <h2>What This Means</h2>
                <p>You don't have any major constraints blocking your transition. Your Motivation, Learning, and Identity scores are all in the amber or green range.</p>
                
                <p class="good-news"><strong>This is excellent!</strong> You have the foundation to make your transition successfully.</p>
                
                <p>However, if you're still feeling stuck, it might be because:</p>
                <ul>
                    <li>Your scores are amber (workable but could be stronger)</li>
                    <li>You need specific guidance on next steps</li>
                    <li>You could benefit from accountability and support</li>
                    <li>There are other factors beyond M×L×I affecting your transition</li>
                </ul>
            </section>
            
            ${generateNextStepsHTML()}
            
            ${generateQuestionsHTML()}
        </div>
    `;
}

function generateNextStepsHTML() {
    return `
        <section class="next-steps">
            <h2>Your Next Steps</h2>
            <p>You have several options from here:</p>
            
            <div class="cta-grid">
                <div class="cta-card">
                    <h3>📥 Download Your Results</h3>
                    <p>Get a detailed PDF of your results including strategies and resources for next steps.</p>
                    <button class="btn btn-primary" data-action="download-pdf">Download PDF Report</button>
                </div>
                
                <div class="cta-card">
                    <h3>📚 Learn More</h3>
                    <p>Free resources explaining your constraint and how to address it effectively.</p>
                    <button class="btn btn-secondary" data-action="learn-more">Read More</button>
                </div>
                
                <div class="cta-card highlight">
                    <h3>📞 Book a Free Results Review</h3>
                    <p>Let's discuss your results together. Understand your constraint, explore what's blocking you, identify your path forward.</p>
                    <p><strong>No pressure, no commitment - just clarity.</strong></p>
                    <p class="spots">I have 6 spots available each week for these conversations.</p>
                    <button class="btn btn-primary" data-action="book-free-call">Schedule Your Free 30-Minute Call</button>
                </div>
                
                <div class="cta-card">
                    <h3>🎯 Single Mentoring Session</h3>
                    <p>One 90-minute focused session. Deep dive into your constraint and create your personal action plan.</p>
                    <p class="price">£197</p>
                    <button class="btn btn-secondary" data-action="book-mentoring">Book Mentoring Session</button>
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

function generateQuestionsHTML() {
    return `
        <section class="questions">
            <p><strong>Questions?</strong></p>
            <p>Email me directly: <a href="mailto:paul@academicleadershiptransformations.co.uk">paul@academicleadershiptransformations.co.uk</a></p>
            <p>I read and respond to every message personally.</p>
        </section>
    `;
}

// ============================================
// CTA BUTTON HANDLERS
// ============================================

function setupCTAHandlers(userId) {
    // Download PDF
    const pdfButtons = document.querySelectorAll('[data-action="download-pdf"]');
    pdfButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // TODO: Implement PDF generation (Priority 2)
            alert('PDF generation coming soon! For now, you can print this page (Ctrl/Cmd + P)');
            // Future: window.location.href = `/api/generate-pdf?uid=${userId}`;
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
            // TODO: Create coaching packages page
            alert('Coaching packages page coming soon!');
            // Future: window.location.href = '/coaching-packages.html';
        });
    });
    
    // Learn more
    const learnMoreButtons = document.querySelectorAll('[data-action="learn-more"]');
    learnMoreButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // TODO: Create content pages
            alert('Content pages coming soon!');
            // Future: window.location.href = '/guides/motivation.html';
        });
    });
}

// ============================================
// EMAIL TRIGGER (Priority 3)
// ============================================

function triggerResultsEmail(scores, reds) {
    // TODO: Implement email trigger
    // This will call your backend to send Email #1
    // For now, just log it
    console.log('Email triggered for:', {
        scores: scores,
        reds: reds
    });
    
    // Future implementation:
    /*
    fetch('/api/send-results-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: scores.userId,
            motivation: scores.motivation,
            learning: scores.learning,
            identity: scores.identity,
            reds: reds
        })
    });
    */
}
