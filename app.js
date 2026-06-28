/**
 * GitPulse — Main Application Engine
 * Integrates GitHub API, Local Git Log parser, loader sequence, and custom canvas charts.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
    const pulseForm = document.getElementById('pulseForm');
    const usernameInput = document.getElementById('usernameInput');
    const showOfflineBtn = document.getElementById('showOfflineBtn');
    const closeOfflineBtn = document.getElementById('closeOfflineBtn');
    const parseLogBtn = document.getElementById('parseLogBtn');
    const gitLogInput = document.getElementById('gitLogInput');
    const copyCmdBtn = document.getElementById('copyCmdBtn');
    const btnRestart = document.getElementById('btnRestart');
    const btnShareLinkedIn = document.getElementById('btnShareLinkedIn');

    // Views
    const landingView = document.getElementById('landingView');
    const offlineView = document.getElementById('offlineView');
    const loadingView = document.getElementById('loadingView');
    const storyView = document.getElementById('storyView');

    // Loader elements
    const loadPercent = document.getElementById('loadPercent');
    const loadStatus = document.getElementById('loadStatus');
    const loadProgress = document.getElementById('loadProgress');

    // Slide elements to fill
    const slideAvatar = document.getElementById('slideAvatar');
    const slideName = document.getElementById('slideName');
    const slideUsername = document.getElementById('slideUsername');
    const slideBio = document.getElementById('slideBio');
    const slideCreated = document.getElementById('slideCreated');
    const slideLocation = document.getElementById('slideLocation');

    const statRepos = document.getElementById('statRepos');
    const statStars = document.getElementById('statStars');
    const statFollowers = document.getElementById('statFollowers');

    const reposContainer = document.getElementById('reposContainer');
    const langLegend = document.getElementById('langLegend');

    const summaryRank = document.getElementById('summaryRank');
    const summaryTitle = document.getElementById('summaryTitle');
    const summaryDesc = document.getElementById('summaryDesc');
    const telemetryList = document.getElementById('telemetryList');

    // State
    let devData = null;

    // Transition helper
    function showView(targetView) {
        const views = [landingView, offlineView, loadingView, storyView];
        views.forEach(v => {
            if (v === targetView) {
                v.classList.add('active');
                gsap.fromTo(v, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 });
            } else {
                v.classList.remove('active');
            }
        });
    }

    // Toggle offline log parser
    showOfflineBtn.addEventListener('click', () => showView(offlineView));
    closeOfflineBtn.addEventListener('click', () => showView(landingView));

    // Copy terminal command
    copyCmdBtn.addEventListener('click', () => {
        const cmd = document.getElementById('powershellCommand').innerText;
        navigator.clipboard.writeText(cmd).then(() => {
            copyCmdBtn.innerHTML = '<i class="fas fa-check text-green-500"></i>';
            setTimeout(() => {
                copyCmdBtn.innerHTML = '<i class="far fa-copy"></i>';
            }, 2000);
        });
    });

    // Form Submission: GitHub API mode
    pulseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (!username) return;

        showView(loadingView);
        await runLoaderSequence(async (onProgress) => {
            try {
                onProgress(10, 'Connecting to satellite telemetry...');
                const userRes = await fetch(`https://api.github.com/users/${username}`);
                if (!userRes.ok) throw new Error('Developer profile not found');
                const user = await userRes.json();
                
                onProgress(40, 'Scanning repos in quadrant...');
                const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
                if (!reposRes.ok) throw new Error('Repository search failed');
                const repos = await reposRes.json();

                onProgress(70, 'Mapping language constellations...');
                // Aggregate language stats
                const languages = {};
                let totalStars = 0;
                repos.forEach(repo => {
                    totalStars += repo.stargazers_count;
                    if (repo.language) {
                        languages[repo.language] = (languages[repo.language] || 0) + 1;
                    }
                });

                // Top repos sorting
                const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3);

                // Setup unified format
                devData = {
                    name: user.name || user.login,
                    username: user.login,
                    avatar: user.avatar_url,
                    bio: user.bio || 'This explorer has chosen to keep their bio in the shadow fields.',
                    created: new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                    location: user.location || 'Deep Space',
                    reposCount: user.public_repos,
                    starsCount: totalStars,
                    followersCount: user.followers,
                    languages: Object.entries(languages).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 4),
                    topRepos: sortedRepos.map(r => ({
                        name: r.name,
                        desc: r.description || 'No system description provided.',
                        stars: r.stargazers_count,
                        language: r.language || 'Plaintext',
                        url: r.html_url
                    })),
                    type: 'api'
                };

                onProgress(90, 'Generating grade telemetry...');
                generateAssessment(devData);

                onProgress(100, 'Teleportation sequence ready!');
            } catch (err) {
                console.error(err);
                alert(`Error: ${err.message}. Please check spelling or use Local Git Log mode.`);
                showView(landingView);
                throw err;
            }
        });
    });

    // Offline Parser: Local Git Log mode
    parseLogBtn.addEventListener('click', async () => {
        const rawLog = gitLogInput.value.trim();
        if (!rawLog) {
            alert('Please paste some git log output.');
            return;
        }

        showView(loadingView);
        await runLoaderSequence(async (onProgress) => {
            try {
                onProgress(15, 'Scanning telemetry stream...');
                let commits = [];
                
                // Try JSON parsing
                try {
                    // Preprocess raw input in case they pasted trailing commas or incomplete JSON
                    let processed = rawLog;
                    if (processed.endsWith(',')) {
                        processed = processed.slice(0, -1);
                    }
                    if (!processed.startsWith('[')) {
                        processed = '[' + processed + ']';
                    }
                    commits = JSON.parse(processed);
                } catch (jsonErr) {
                    onProgress(30, 'Decrypting raw format...');
                    // Fallback: basic regex log parser if they paste raw terminal text
                    const commitBlocks = rawLog.split(/commit\s+[a-f0-9]{40}/gi);
                    commitBlocks.forEach(block => {
                        const authorMatch = block.match(/Author:\s*(.*)/i);
                        const dateMatch = block.match(/Date:\s*(.*)/i);
                        const msgLines = block.split('\n').filter(line => line.trim() !== '' && !line.match(/Author:|Date:/i));
                        const message = msgLines.length > 0 ? msgLines[msgLines.length - 1].trim() : 'Updated repository';
                        
                        if (authorMatch && dateMatch) {
                            commits.push({
                                author: authorMatch[1].trim(),
                                date: dateMatch[1].trim(),
                                message: message
                            });
                        }
                    });
                }

                if (commits.length === 0) {
                    throw new Error('Could not parse any commit records.');
                }

                onProgress(60, 'Synthesizing repo clusters...');
                // Fake user profile details from commit authors
                const primaryAuthor = commits[0].author || 'Local Dev';
                const totalCommits = commits.length;
                
                // Fabricate stats based on commits
                devData = {
                    name: primaryAuthor.split('<')[0].trim(),
                    username: 'local.' + primaryAuthor.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10),
                    avatar: 'avatar.png',
                    bio: `Local Git Pulse compiled from ${totalCommits} commits. Deeply dedicated backend builder.`,
                    created: 'Local Sandbox',
                    location: 'Localhost',
                    reposCount: 1,
                    starsCount: Math.round(totalCommits * 0.15),
                    followersCount: Math.round(totalCommits * 0.05),
                    languages: [
                        { name: 'JavaScript', count: 45 },
                        { name: 'Python', count: 35 },
                        { name: 'CSS', count: 12 },
                        { name: 'HTML', count: 8 }
                    ],
                    topRepos: commits.slice(0, 3).map((c, i) => ({
                        name: c.message.slice(0, 20) || `module-cluster-${i+1}`,
                        desc: `Commit: ${c.message || 'Updated codebase'}`,
                        stars: Math.max(1, Math.round((commits.length - i) * 0.1)),
                        language: 'Local Git',
                        url: '#'
                    })),
                    type: 'local',
                    totalCommits: totalCommits
                };

                onProgress(85, 'Calculating local gravity...');
                generateAssessment(devData);
                onProgress(100, 'Compile completed!');
            } catch (err) {
                console.error(err);
                alert(`Error parsing git log: ${err.message}. Make sure output matches the format.`);
                showView(offlineView);
                throw err;
            }
        });
    });

    // Run loader count animation
    function runLoaderSequence(workCallback) {
        return new Promise((resolve, reject) => {
            let pct = 0;
            loadPercent.innerText = '0%';
            loadProgress.style.width = '0%';

            const interval = setInterval(() => {
                if (pct < 90) {
                    pct += Math.floor(Math.random() * 8) + 1;
                    if (pct > 90) pct = 90;
                    loadPercent.innerText = `${pct}%`;
                    loadProgress.style.width = `${pct}%`;
                }
            }, 100);

            // Execute actual fetching/processing
            workCallback((progressPct, statusText) => {
                loadStatus.innerText = statusText;
            }).then(() => {
                clearInterval(interval);
                // Complete loader
                pct = 100;
                loadPercent.innerText = '100%';
                loadProgress.style.width = '100%';
                
                setTimeout(() => {
                    launchStoryView();
                    resolve();
                }, 800);
            }).catch(err => {
                clearInterval(interval);
                reject(err);
            });
        });
    }

    // Launch Story Visualizer
    function launchStoryView() {
        if (!devData) return;

        // Fill Slide 1: Identity
        slideAvatar.src = devData.avatar;
        slideName.innerText = devData.name;
        slideUsername.innerText = `@${devData.username}`;
        slideBio.innerText = devData.bio;
        slideCreated.innerText = devData.created;
        slideLocation.innerText = devData.location;

        // Fill Slide 2: Stats
        statRepos.innerText = '0';
        statRepos.dataset.target = devData.reposCount;
        
        statStars.innerText = '0';
        statStars.dataset.target = devData.starsCount;
        
        statFollowers.innerText = '0';
        statFollowers.dataset.target = devData.followersCount;

        // Fill Slide 3: Language Legend (Actual rendering is in story.js using window.renderLanguagesChart)
        langLegend.innerHTML = '';
        const colors = ['#3b82f6', '#00ffff', '#8b5cf6', '#ef4444'];
        let totalCount = devData.languages.reduce((acc, curr) => acc + curr.count, 0) || 1;
        devData.languages.forEach((lang, i) => {
            const pct = Math.round((lang.count / totalCount) * 100);
            langLegend.innerHTML += `
                <div class="legend-item" style="opacity: 0;">
                    <div class="legend-left">
                        <span class="legend-color" style="background-color: ${colors[i % colors.length]}; box-shadow: 0 0 10px ${colors[i % colors.length]}"></span>
                        <span class="legend-name">${lang.name}</span>
                    </div>
                    <span class="legend-percentage">${pct}%</span>
                </div>
            `;
        });

        // Fill Slide 4: Top Repositories
        reposContainer.innerHTML = '';
        devData.topRepos.forEach((repo, i) => {
            reposContainer.innerHTML += `
                <a href="${repo.url}" target="_blank" class="repo-card glass-card" style="opacity: 0;">
                    <div class="repo-top">
                        <span class="slide-badge" style="margin-bottom: 0.5rem; display: inline-block;">System ${i+1}</span>
                        <div class="repo-name">${repo.name}</div>
                        <p class="repo-desc">${repo.desc}</p>
                    </div>
                    <div class="repo-bottom">
                        <div class="repo-lang">
                            <span class="repo-lang-dot" style="background-color: ${colors[i % colors.length]}"></span>
                            <span>${repo.language}</span>
                        </div>
                        <div class="repo-stars">
                            <i class="fas fa-star"></i> ${repo.stars}
                        </div>
                    </div>
                </a>
            `;
        });

        // Fill Slide 5: Telemetry Summary Logs
        summaryRank.innerText = devData.assessment.rank;
        summaryRank.dataset.grade = devData.assessment.rank;
        summaryTitle.innerText = devData.assessment.title;
        summaryDesc.innerText = devData.assessment.description;

        telemetryList.innerHTML = '';
        const logs = [
            `Initialized connection quadrant [${devData.username}]`,
            `Analyzed ${devData.reposCount} active stellar repositories`,
            `Registered stellar mass of ${devData.starsCount} stargazers`,
            `Decrypted spectral signature: Primary element ${devData.languages[0]?.name || 'unknown'}`,
            `Stellar grade locked in: Grade ${devData.assessment.rank}`
        ];
        logs.forEach((log, idx) => {
            telemetryList.innerHTML += `<li style="opacity: 0;"><span class="time">[0.${idx*15 + 10}s]</span> ${log}</li>`;
        });

        // Setup Slide Controller
        showView(storyView);
        window.StoryPlayer.reset();
        
        // Trigger telemetry logs animation in Slide 5
        gsap.fromTo(telemetryList.querySelectorAll('li'),
            { opacity: 0, x: -10 },
            { opacity: 1, x: 0, stagger: 0.1, duration: 0.8, delay: 0.8 }
        );
    }

    // Assessor Grade Algorithm
    function generateAssessment(data) {
        let score = (data.reposCount * 2) + (data.starsCount * 5) + (data.followersCount * 3);
        if (data.type === 'local') {
            score = data.totalCommits * 3;
        }

        let rank = 'B';
        let title = 'Stellar Scout';
        let description = 'A growing developer orbit, establishing new lines of code and foundational projects.';

        if (score > 1000) {
            rank = 'S';
            title = 'Quantum Architect';
            description = 'Your contributions dictate the local space-time fabric. Extremely influential, with robust repos and high-gravity impact.';
        } else if (score > 400) {
            rank = 'A+';
            title = 'constellation Designer';
            description = 'Highly active developer with established modules, beautiful portfolios, and consistent cosmic footprint.';
        } else if (score > 150) {
            rank = 'A';
            title = 'Stellar Pioneer';
            description = 'Exploring advanced coding systems. A balanced profile with high quality contributions and distinct focus.';
        }

        data.assessment = { rank, title, description };
    }

    // Canvas Language Chart Render
    window.renderLanguagesChart = () => {
        const chartCanvas = document.getElementById('nebulaChart');
        if (!chartCanvas) return;
        const chartCtx = chartCanvas.getContext('2d');
        const cWidth = chartCanvas.width;
        const cHeight = chartCanvas.height;

        chartCtx.clearRect(0, 0, cWidth, cHeight);

        const data = devData.languages;
        if (!data || data.length === 0) return;

        let totalCount = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
        const colors = ['#3b82f6', '#00ffff', '#8b5cf6', '#ef4444'];
        
        let startAngle = -Math.PI / 2; // start at top

        // Animated draw using gsap
        const chartProgress = { val: 0 };
        gsap.to(chartProgress, {
            val: 1,
            duration: 1.5,
            ease: 'power3.out',
            onUpdate: () => {
                chartCtx.clearRect(0, 0, cWidth, cHeight);
                let currentStartAngle = startAngle;

                data.forEach((lang, i) => {
                    const sliceAngle = (lang.count / totalCount) * Math.PI * 2 * chartProgress.val;
                    const endAngle = currentStartAngle + sliceAngle;
                    const color = colors[i % colors.length];

                    // Draw outer arc
                    chartCtx.strokeStyle = color;
                    chartCtx.lineWidth = 14;
                    chartCtx.lineCap = 'round';
                    
                    // Draw outer glowing neon arc
                    chartCtx.shadowBlur = 15;
                    chartCtx.shadowColor = color;
                    chartCtx.beginPath();
                    chartCtx.arc(cWidth / 2, cHeight / 2, 90 - (i * 20), currentStartAngle, endAngle);
                    chartCtx.stroke();
                    
                    // Reset shadow for inner elements
                    chartCtx.shadowBlur = 0;

                    // Inner background thin tracking ring
                    chartCtx.strokeStyle = 'rgba(255,255,255,0.03)';
                    chartCtx.lineWidth = 4;
                    chartCtx.beginPath();
                    chartCtx.arc(cWidth / 2, cHeight / 2, 90 - (i * 20), 0, Math.PI * 2);
                    chartCtx.stroke();

                    currentStartAngle = endAngle;
                });
            }
        });
    };

    // Restart button
    btnRestart.addEventListener('click', () => {
        devData = null;
        showView(landingView);
        usernameInput.value = '';
        gitLogInput.value = '';
    });

    // Copy Text Fallback helper
    function copyTextToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    resolve();
                } else {
                    reject(new Error('Copy command failed'));
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    // Share on LinkedIn button
    btnShareLinkedIn.addEventListener('click', () => {
        const name = devData.name;
        const user = devData.username;
        const rank = devData.assessment.rank;
        const title = devData.assessment.title;
        const repos = devData.reposCount;
        const stars = devData.starsCount;
        const primaryLang = devData.languages[0]?.name || 'Code';

        // Pre-made custom message detailing the analysis metrics
        const shareText = `🌌 Just scanned my GitHub profile on GitPulse!

🛡️ Telemetry Rank: ${rank} (${title})
💻 Developer: ${name} (@${user})
📊 Stats Analyzed:
  - Repositories: ${repos}
  - Total Stargazers: ${stars}
  - Core Language: ${primaryLang}

🔗 Analyze your developer universe: https://rahulagarwal.tech/gitpulse

Project developed by @Rahul Agarwal #GitPulse #GitHub #OpenSource #CreativeCoding`;

        // Copy custom post text to clipboard with fallback
        copyTextToClipboard(shareText).then(() => {
            const originalHTML = btnShareLinkedIn.innerHTML;
            btnShareLinkedIn.innerHTML = '<i class="fas fa-check"></i> COPIED POST TEXT!';
            btnShareLinkedIn.style.backgroundColor = '#10b981'; // Green feedback
            btnShareLinkedIn.style.color = '#000';
            
            setTimeout(() => {
                btnShareLinkedIn.innerHTML = originalHTML;
                btnShareLinkedIn.style.backgroundColor = ''; // Reset
                btnShareLinkedIn.style.color = '';
                
                // Open LinkedIn share dialog with our URL (which will load the OG banner/card preview)
                const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://rahulagarwal.tech/gitpulse')}`;
                window.open(shareUrl, '_blank');
            }, 1200);
        }).catch(err => {
            console.error('Clipboard copy failed:', err);
            // Fallback: direct redirect
            const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://rahulagarwal.tech/gitpulse')}`;
            window.open(shareUrl, '_blank');
        });
    });
});
