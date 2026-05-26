document.addEventListener('DOMContentLoaded', () => {

    // ==================== REAL-TIME BROADCAST SYNC CHANNEL ====================
    const syncChannel = new BroadcastChannel('cric_hit_sync');

    function broadcastUpdate() {
        syncChannel.postMessage({ type: 'SYNC_ALL' });
    }

    syncChannel.onmessage = (e) => {
        if (e.data.type === 'SYNC_ALL') {
            loadDataFromStorage();
            renderActiveView();
        }
    };

    window.addEventListener('storage', () => {
        loadDataFromStorage();
        renderActiveView();
    });


    // ==================== CLIENT DATABASE SCHEMAS ====================
    let players = [];
    let activeMatch = null;
    let tournaments = [];
    let announcements = [];
    let chats = [];
    let chatSettings = { publicLocked: false, privateLocked: false };
    let myProfileId = null;
    let completedMatches = [];
    let recruitmentPosts = [];
    let matches = [];
    let h2h = {};
    let currentChatRoom = 'public';

    // Seeding player database with default innings logs for CricInsights (Image 5)
    const seedInningsHistory = [
        { date: '13/10/25', opponent: 'VIJAYNAGAR-XI vs DANGEROUS LIONS 11', runs: 43, balls: 22, outType: 'Caught out', over: 14 },
        { date: '12/10/25', opponent: 'SPARTANS-II vs SHIVAY XI', runs: 25, balls: 17, outType: 'Caught out', over: 20 },
        { date: '10/10/25', opponent: 'Rafale XI vs Ramdev Cc', runs: 31, balls: 15, outType: 'Caught and bowled', over: 12 },
        { date: '09/10/25', opponent: 'VIJAYNAGAR-XI vs SPARTANS-II', runs: 2, balls: 5, outType: 'Caught out', over: 14 },
        { date: '08/10/25', opponent: 'Tejas XXII vs ANNA XI', runs: 10, balls: 6, outType: 'Caught behind', over: 20 }
    ];

    const defaultPlayers = [
        { id: 'p-rohit', name: 'Rohit Sharma', age: 37, team: 'India', batStyle: 'Right-Handed', bowlStyle: 'Right-arm Offbreak', stats: { matches: 0, innings: 0, runs: 0, wickets: 0, avg: 0.0, sr: 0.0, fours: 0, sixes: 0 }, inningsHistory: [] },
        { id: 'p-virat', name: 'Virat Kohli', age: 35, team: 'India', batStyle: 'Right-Handed', bowlStyle: 'None', stats: { matches: 0, innings: 0, runs: 0, wickets: 0, avg: 0.0, sr: 0.0, fours: 0, sixes: 0 }, inningsHistory: [] },
        { id: 'p-bumrah', name: 'Jasprit Bumrah', age: 30, team: 'India', batStyle: 'Right-Handed', bowlStyle: 'Right-arm Fast', stats: { matches: 0, innings: 0, runs: 0, wickets: 0, avg: 0.0, sr: 0.0, fours: 0, sixes: 0 }, inningsHistory: [] },
        { id: 'p-hardik', name: 'Hardik Pandya', age: 30, team: 'India', batStyle: 'Right-Handed', bowlStyle: 'Right-arm Fast', stats: { matches: 0, innings: 0, runs: 0, wickets: 0, avg: 0.0, sr: 0.0, fours: 0, sixes: 0 }, inningsHistory: [] }
    ];

    // Seeding recruitment postings matching Screen 6 details
    const defaultRecruitmentPosts = [];

    // Seeding Ecosystem Directory listings matching Screen 3 categories
    const directoryDatabase = {
        umpires: [
            { name: 'Rohan Shastri', experience: '8 Years', grade: 'BCCI Level 1', contact: '+91 94220 11002' },
            { name: 'Kunal Jadeja', experience: '5 Years', grade: 'State Certified', contact: '+91 98980 44321' }
        ],
        scorers: [
            { name: 'Tejas Patel', experience: '4 Years', type: 'Digital Scorer Pro', contact: '+91 90123 45678' },
            { name: 'Yash Sharma', experience: '6 Years', type: 'Official League Scorer', contact: '+91 91234 56789' }
        ],
        grounds: [
            { name: 'Narendra Modi Stadium Ground B', location: 'Motera, Ahmedabad', pitch: 'Red Soil Turf', contact: '+91 79 2626 0000' },
            { name: 'Sabarmati Railway Cricket Ground', location: 'Sabarmati, Ahmedabad', pitch: 'Clay Soil Turf', contact: '+91 95566 22110' }
        ],
        academies: [
            { name: 'Ahmedabad Cricket Elite Academy', coach: 'Coach Verma', fees: 'INR 2,500/Month', contact: '+91 99009 90099' }
        ],
        coaches: [
            { name: 'Sanjay Verma', specialization: 'Fast Bowling & Tactics', grade: 'Level A Certified', contact: '+91 94230 45450' }
        ],
        nets: [
            { name: 'sabarmati Box Cricket Arena & Indoor Nets', location: 'Sabarmati, Ahmedabad', price: 'INR 800/Hour', contact: '+91 98222 33110' }
        ],
        physios: [
            { name: 'Dr. Aarav Mehta', experience: '10 Years', specialization: 'Sports Rehab & Physiotherapy', contact: '+91 98765 00112' },
            { name: 'Dr. Riya Sen', experience: '6 Years', specialization: 'Athletic Trainer & Recovery', contact: '+91 97654 32109' }
        ],
        streamers: [
            { name: 'CricLive Digital Streams', experience: '3 Years', type: 'HD YouTube Broadcaster', contact: '+91 98112 23344' },
            { name: 'Vyas Broadcasters', experience: '5 Years', type: 'Turf & Box Streaming Crew', contact: '+91 99112 23344' }
        ],
        shops: [
            { name: 'Cric-Hit Equipment Store', location: 'Sabarmati, Ahmedabad', specialization: 'SS/SG Premium Bats & Kits', contact: '+91 79 4001 0203' },
            { name: 'Super Sports Hub', location: 'Sabarmati, Ahmedabad', specialization: 'Cricket Footwear & Accessories', contact: '+91 90999 88877' }
        ]
    };

    function loadDataFromStorage() {
        // Players
        try {
            const storedPlayers = localStorage.getItem('cric_players');
            if (storedPlayers) {
                players = JSON.parse(storedPlayers);
            } else {
                players = [...defaultPlayers];
                localStorage.setItem('cric_players', JSON.stringify(players));
            }
        } catch (e) {
            console.error("Error parsing players:", e);
            players = [...defaultPlayers];
        }

        // Active User Profile
        myProfileId = localStorage.getItem('cric_my_profile_id');

        // Active Match State
        try {
            const storedMatch = localStorage.getItem('cric_active_match');
            if (storedMatch) {
                activeMatch = JSON.parse(storedMatch);
            } else {
                activeMatch = { status: 'SETUP' };
                localStorage.setItem('cric_active_match', JSON.stringify(activeMatch));
            }
        } catch (e) {
            console.error("Error parsing active match:", e);
            activeMatch = { status: 'SETUP' };
        }

        // Tournaments
        try {
            const storedTourneys = localStorage.getItem('cric_tournaments');
            if (storedTourneys) {
                tournaments = JSON.parse(storedTourneys);
            } else {
                tournaments = [];
                localStorage.setItem('cric_tournaments', JSON.stringify(tournaments));
            }
        } catch (e) {
            console.error("Error parsing tournaments:", e);
            tournaments = [];
        }

        // Announcements
        try {
            const storedAnnounces = localStorage.getItem('cric_announcements');
            announcements = storedAnnounces ? JSON.parse(storedAnnounces) : [];
        } catch (e) {
            console.error("Error parsing announcements:", e);
            announcements = [];
        }

        // Chats
        try {
            const storedChats = localStorage.getItem('cric_chats');
            chats = storedChats ? JSON.parse(storedChats) : [];
        } catch (e) {
            console.error("Error parsing chats:", e);
            chats = [];
        }

        // Chat Settings
        try {
            const storedChatSettings = localStorage.getItem('cric_chat_settings');
            chatSettings = storedChatSettings ? JSON.parse(storedChatSettings) : { publicLocked: false, privateLocked: false };
        } catch (e) {
            console.error("Error parsing chat settings:", e);
            chatSettings = { publicLocked: false, privateLocked: false };
        }

        // Recruitment Posts
        try {
            const storedMM = localStorage.getItem('cric_recruitment_posts');
            if (storedMM) {
                recruitmentPosts = JSON.parse(storedMM);
            } else {
                recruitmentPosts = [...defaultRecruitmentPosts];
                localStorage.setItem('cric_recruitment_posts', JSON.stringify(recruitmentPosts));
            }
        } catch (e) {
            console.error("Error parsing recruitment posts:", e);
            recruitmentPosts = [];
        }

        // Completed Matches
        try {
            const storedCompleted = localStorage.getItem('cric_completed_matches');
            completedMatches = storedCompleted ? JSON.parse(storedCompleted) : [];
        } catch (e) {
            console.error("Error parsing completed matches:", e);
            completedMatches = [];
        }

        // Matches Database
        try {
            const storedMatches = localStorage.getItem('cric_matches');
            if (storedMatches) {
                matches = JSON.parse(storedMatches);
            } else {
                matches = [];
                localStorage.setItem('cric_matches', JSON.stringify(matches));
            }
        } catch (e) {
            console.error("Error parsing matches:", e);
            matches = [];
        }

        // H2H statistics tracker
        try {
            const storedH2H = localStorage.getItem('cric_h2h');
            h2h = storedH2H ? JSON.parse(storedH2H) : {};
        } catch (e) {
            console.error("Error parsing H2H data:", e);
            h2h = {};
        }
    }

    function recordH2HEvent(batsmanId, bowlerId, runs, isDismissal) {
        if (!batsmanId || !bowlerId) return;
        const key = batsmanId + "_" + bowlerId;
        if (!h2h[key]) {
            h2h[key] = { runs: 0, balls: 0, dismissals: 0 };
        }
        h2h[key].runs += runs;
        h2h[key].balls += 1;
        if (isDismissal) {
            h2h[key].dismissals += 1;
        }
    }

    function updateLinkedMatch() {
        if (activeMatch && activeMatch.linkedMatchId) {
            const idx = matches.findIndex(m => m.id === activeMatch.linkedMatchId);
            if (idx !== -1) {
                matches[idx].scoreA = activeMatch.score;
                matches[idx].wicketsA = activeMatch.wickets;
                const overs = Math.floor(activeMatch.balls / 6);
                const balls = activeMatch.balls % 6;
                matches[idx].oversA = `${overs}.${balls}`;
                matches[idx].status = activeMatch.status;
                if (activeMatch.status === 'COMPLETED') {
                    matches[idx].result = `${activeMatch.teamA} completed innings at ${activeMatch.score}/${activeMatch.wickets}`;
                }
            }
        }
    }

    function saveDataToStorage() {
        updateLinkedMatch();
        localStorage.setItem('cric_players', JSON.stringify(players));
        localStorage.setItem('cric_active_match', JSON.stringify(activeMatch));
        localStorage.setItem('cric_tournaments', JSON.stringify(tournaments));
        localStorage.setItem('cric_announcements', JSON.stringify(announcements));
        localStorage.setItem('cric_chats', JSON.stringify(chats));
        localStorage.setItem('cric_chat_settings', JSON.stringify(chatSettings));
        localStorage.setItem('cric_recruitment_posts', JSON.stringify(recruitmentPosts));
        localStorage.setItem('cric_completed_matches', JSON.stringify(completedMatches));
        localStorage.setItem('cric_matches', JSON.stringify(matches));
        localStorage.setItem('cric_h2h', JSON.stringify(h2h));
        if (myProfileId) {
            localStorage.setItem('cric_my_profile_id', myProfileId);
        } else {
            localStorage.removeItem('cric_my_profile_id');
        }
    }


    // ==================== UNDO HISTORY & MATCH HELPERS ====================
    let matchHistoryStack = [];

    function saveMatchStateToHistory() {
        if (!activeMatch) return;
        matchHistoryStack.push({
            activeMatch: JSON.parse(JSON.stringify(activeMatch)),
            players: JSON.parse(JSON.stringify(players)),
            completedMatches: JSON.parse(JSON.stringify(completedMatches))
        });
        if (matchHistoryStack.length > 20) {
            matchHistoryStack.shift();
        }
    }

    function swapBatsmenStrike() {
        if (!activeMatch || activeMatch.status !== 'LIVE') return;
        const temp = activeMatch.striker;
        activeMatch.striker = activeMatch.nonStriker;
        activeMatch.nonStriker = temp;
    }

    function commitIndividualStats(playerId, runs, balls, fours, sixes, arg6, arg7, arg8, arg9) {
        const p = players.find(x => x.id === playerId);
        if (!p) return;

        if (arg9 !== undefined) {
            // Bowler signature: commitIndividualStats(id, 0, 0, 0, 0, bowlBalls, bowlRuns, bowlWickets, matchesInc)
            const bowlBalls = arg6;
            const bowlRuns = arg7;
            const bowlWickets = arg8;
            const matchesInc = arg9;

            p.stats.matches += matchesInc;
            p.stats.wickets += bowlWickets;
        } else {
            // Batsman signature: commitIndividualStats(id, runs, balls, fours, sixes, matchesInc, inningsInc, 0)
            const matchesInc = arg6;
            const inningsInc = arg7;

            p.stats.matches += matchesInc;
            p.stats.innings += inningsInc;
            p.stats.runs += runs;
            p.stats.fours += fours;
            p.stats.sixes += sixes;

            // Update average
            if (p.stats.innings > 0) {
                p.stats.avg = parseFloat((p.stats.runs / p.stats.innings).toFixed(1));
            } else {
                p.stats.avg = 0.0;
            }

            // Estimate/track balls faced for strike rate
            if (!p.stats.ballsFaced) {
                p.stats.ballsFaced = p.stats.innings > 0 ? Math.round((p.stats.runs / (p.stats.sr || 120)) * 100) : 0;
            }
            p.stats.ballsFaced += balls;
            if (p.stats.ballsFaced > 0) {
                p.stats.sr = parseFloat(((p.stats.runs / p.stats.ballsFaced) * 100).toFixed(1));
            } else {
                p.stats.sr = 0.0;
            }
        }
    }

    function triggerUmpireOverComplete() {
        const helper = document.getElementById('umpire-over-helper');
        helper.classList.remove('hidden');

        const nextSelect = document.getElementById('umpire-next-bowler-select');
        nextSelect.innerHTML = '';

        const available = players.filter(p => p.id !== activeMatch.bowler.id && p.id !== activeMatch.striker.id && p.id !== activeMatch.nonStriker.id);
        available.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.text = `${p.name} (${p.team})`;
            nextSelect.appendChild(opt);
        });

        const searchInput = document.getElementById('umpire-next-bowler-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.oninput = () => {
                const query = searchInput.value.toLowerCase();
                nextSelect.innerHTML = '';
                available.forEach(p => {
                    if (p.name.toLowerCase().includes(query) || p.team.toLowerCase().includes(query)) {
                        const opt = document.createElement('option');
                        opt.value = p.id;
                        opt.text = `${p.name} (${p.team})`;
                        nextSelect.appendChild(opt);
                    }
                });
            };
        }

        activeMatch.commentary.push(`Over complete! 6 legal balls recorded.`);
    }

    // ==================== COMMUNITIES SYNCED CHAT ENGINE ====================
    function renderChatMessages() {
        const display = document.getElementById('chat-messages-display');
        const input = document.getElementById('chat-message-input');
        const warning = document.getElementById('chat-admin-warning');

        if (!display || !input) return;

        display.innerHTML = '';
        const roomChats = chats.filter(c => c.room === currentChatRoom);

        if (roomChats.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = "text-xs text-on-surface-variant italic text-center py-10";
            emptyMsg.innerText = `Welcome to the ${currentChatRoom === 'public' ? 'Public Chat' : 'Private Room'}. Say hello to other players!`;
            display.appendChild(emptyMsg);
        } else {
            roomChats.forEach(msg => {
                const bubble = document.createElement('div');
                let sideClass = 'other';
                if (msg.senderId === myProfileId || (msg.senderId === 'guest' && !myProfileId)) {
                    sideClass = 'self';
                }
                let adminBubbleClass = msg.isAdmin ? ' admin-msg border-l-4 border-accent-neon' : '';
                bubble.className = `chat-bubble ${sideClass}${adminBubbleClass}`;
                
                bubble.innerHTML = `
                    <div class="text-[10px] text-secondary font-black tracking-wider uppercase mb-0.5">${msg.sender}${msg.isAdmin ? ' (Host/Admin)' : ''}</div>
                    <div class="text-xs text-white">${msg.text}</div>
                    <div class="text-[8px] text-on-surface-variant text-right mt-1">${msg.time}</div>
                `;
                display.appendChild(bubble);
            });
            display.scrollTop = display.scrollHeight;
        }

        // Lock Checking
        const isLocked = currentChatRoom === 'public' ? chatSettings.publicLocked : chatSettings.privateLocked;
        const currentProfile = players.find(p => p.id === myProfileId);
        const isUserAdmin = (activeViewKey === 'host') || 
                            (myProfileId === 'admin') || 
                            (currentProfile && tournaments.some(t => t.hostName === currentProfile.name));

        if (isLocked) {
            if (warning) warning.classList.remove('hidden');
            if (isUserAdmin) {
                input.disabled = false;
                input.placeholder = "Type admin message...";
            } else {
                input.disabled = true;
                input.placeholder = "Locked by Admin. Only Hosts can message.";
            }
        } else {
            if (warning) warning.classList.add('hidden');
            input.disabled = false;
            input.placeholder = "Type message...";
        }
    }

    function sendChatMessage() {
        const input = document.getElementById('chat-message-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const isLocked = currentChatRoom === 'public' ? chatSettings.publicLocked : chatSettings.privateLocked;
        const currentProfile = players.find(p => p.id === myProfileId);
        const isUserAdmin = (activeViewKey === 'host') || 
                            (myProfileId === 'admin') || 
                            (currentProfile && tournaments.some(t => t.hostName === currentProfile.name));

        if (isLocked && !isUserAdmin) {
            alert("Only Tournament Hosts or Admins can post in this room while it is locked.");
            return;
        }

        let senderName = 'Guest Player';
        if (activeViewKey === 'host') {
            senderName = 'Host Admin';
        } else if (currentProfile) {
            senderName = currentProfile.name;
        }

        const newMsg = {
            id: 'msg-' + Date.now(),
            room: currentChatRoom,
            sender: senderName,
            senderId: myProfileId || 'guest',
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAdmin: isUserAdmin || activeViewKey === 'host'
        };

        chats.push(newMsg);
        input.value = '';

        saveDataToStorage();
        broadcastUpdate();
        renderChatMessages();
    }

    // ==================== NAVIGATION ROUTING ====================
    const views = {
        'landing': document.getElementById('view-landing'),
        'umpire': document.getElementById('view-umpire'),
        'player': document.getElementById('view-player'),
        'public': document.getElementById('view-public'),
        'host': document.getElementById('view-host')
    };

    let activeViewKey = 'landing';

    function switchView(viewKey) {
        if (!views[viewKey]) return;
        activeViewKey = viewKey;

        Object.keys(views).forEach(key => {
            views[key].classList.add('hidden');
        });
        views[viewKey].classList.remove('hidden');

        document.querySelectorAll('.nav-link').forEach(link => {
            const target = link.getAttribute('data-target');
            if (target === viewKey) {
                link.classList.add('text-secondary', 'border-b-2', 'border-secondary');
                link.classList.remove('text-on-surface-variant');
            } else {
                link.classList.remove('text-secondary', 'border-b-2', 'border-secondary');
                if (link.tagName === 'A') {
                    link.classList.add('text-on-surface-variant');
                }
            }
        });

        renderActiveView();
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            switchView(target);
            location.hash = target;
        });
    });

    window.addEventListener('hashchange', () => {
        const hash = location.hash.replace('#', '');
        if (views[hash]) {
            switchView(hash);
        }
    });


    // ==================== RENDERING VIEW SWITCHBOARD ====================
    function renderActiveView() {
        const headerUserBadge = document.getElementById('header-user-badge');
        const headerUserName = document.getElementById('header-user-name');
        
        if (myProfileId) {
            const myProfile = players.find(p => p.id === myProfileId);
            if (myProfile) {
                headerUserName.innerText = myProfile.name;
                headerUserBadge.classList.remove('hidden');
            }
        } else {
            headerUserBadge.classList.add('hidden');
        }

        switch (activeViewKey) {
            case 'landing':
                break;
            case 'umpire':
                renderUmpireView();
                break;
            case 'player':
                renderPlayerView();
                break;
            case 'public':
                renderPublicView();
                break;
            case 'host':
                renderHostView();
                break;
        }
    }


    // ==================== UMPIRE PANEL CONTROLLER ====================
    function renderUmpireView() {
        const setupCard = document.getElementById('umpire-setup-card');
        const scoringDashboard = document.getElementById('umpire-scoring-dashboard');

        if (!activeMatch || activeMatch.status === 'SETUP' || activeMatch.status === 'COMPLETED') {
            setupCard.classList.remove('hidden');
            scoringDashboard.classList.add('hidden');
            populateUmpireDropdowns();
        } else {
            setupCard.classList.add('hidden');
            scoringDashboard.classList.remove('hidden');
            updateUmpireScoreboard();
        }
    }

    function populateUmpireDropdowns() {
        const strikerSelect = document.getElementById('umpire-striker-select');
        const nonStrikerSelect = document.getElementById('umpire-nonstriker-select');
        const bowlerSelect = document.getElementById('umpire-bowler-select');
        const matchSelect = document.getElementById('umpire-match-select');

        strikerSelect.innerHTML = '';
        nonStrikerSelect.innerHTML = '';
        bowlerSelect.innerHTML = '';
        
        // Populate match select
        matchSelect.innerHTML = '<option value="custom">-- Quick Start (Custom Match / No League Link) --</option>';
        matches.forEach(m => {
            if (m.status === 'UPCOMING' || m.status === 'LIVE') {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.text = `${m.teamA} vs ${m.teamB} (${m.tournamentName || 'League Match'})`;
                matchSelect.appendChild(opt);
            }
        });

        // Add change event listener for matchSelect if not already bound
        if (!matchSelect.dataset.listenerBound) {
            matchSelect.dataset.listenerBound = 'true';
            matchSelect.addEventListener('change', () => {
                const selectedMatchId = matchSelect.value;
                if (selectedMatchId === 'custom') {
                    document.getElementById('umpire-team-a').value = '';
                    document.getElementById('umpire-team-b').value = '';
                    document.getElementById('umpire-overs').value = 5;
                    document.getElementById('umpire-team-a').readOnly = false;
                    document.getElementById('umpire-team-b').readOnly = false;
                } else {
                    const sel = matches.find(m => m.id === selectedMatchId);
                    if (sel) {
                        document.getElementById('umpire-team-a').value = sel.teamA;
                        document.getElementById('umpire-team-b').value = sel.teamB;
                        document.getElementById('umpire-overs').value = 5;
                        document.getElementById('umpire-team-a').readOnly = true;
                        document.getElementById('umpire-team-b').readOnly = true;
                    }
                }
            });
        }

        players.forEach((p, idx) => {
            const opt1 = document.createElement('option');
            opt1.value = p.id;
            opt1.text = p.name + " (" + p.team + ")";
            strikerSelect.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = p.id;
            opt2.text = p.name + " (" + p.team + ")";
            if (idx === 1) opt2.selected = true;
            nonStrikerSelect.appendChild(opt2);

            const opt3 = document.createElement('option');
            opt3.value = p.id;
            opt3.text = p.name + " (" + p.team + ")";
            if (idx === 2) opt3.selected = true;
            bowlerSelect.appendChild(opt3);
        });

        // Search Autocomplete Suggestion Filters for Umpire Selectors
        const bindAutocomplete = (searchId, selectId, defaultSelectIdx) => {
            const input = document.getElementById(searchId);
            const select = document.getElementById(selectId);
            if (!input || !select) return;
            
            input.value = '';
            input.oninput = () => {
                const query = input.value.toLowerCase();
                select.innerHTML = '';
                players.forEach((p, idx) => {
                    if (p.name.toLowerCase().includes(query) || p.team.toLowerCase().includes(query)) {
                        const opt = document.createElement('option');
                        opt.value = p.id;
                        opt.text = p.name + " (" + p.team + ")";
                        if (query === '' && idx === defaultSelectIdx) {
                            opt.selected = true;
                        }
                        select.appendChild(opt);
                    }
                });
            };
        };

        bindAutocomplete('umpire-striker-search', 'umpire-striker-select', 0);
        bindAutocomplete('umpire-nonstriker-search', 'umpire-nonstriker-select', 1);
        bindAutocomplete('umpire-bowler-search', 'umpire-bowler-select', 2);
    }

    // Start Live Innings (with Toss configuration - Image 8)
    document.getElementById('btn-start-match').addEventListener('click', () => {
        const teamA = document.getElementById('umpire-team-a').value.trim() || 'Stormers';
        const teamB = document.getElementById('umpire-team-b').value.trim() || 'Titans';
        const limitOvers = parseInt(document.getElementById('umpire-overs').value) || 5;

        const tossWinnerSelect = document.getElementById('umpire-toss-won').value;
        const tossDecision = document.getElementById('umpire-toss-decision').value;
        const tossWinnerName = tossWinnerSelect === 'teamA' ? teamA : teamB;

        const strikerId = document.getElementById('umpire-striker-select').value;
        const nonStrikerId = document.getElementById('umpire-nonstriker-select').value;
        const bowlerId = document.getElementById('umpire-bowler-select').value;

        const striker = players.find(p => p.id === strikerId);
        const nonStriker = players.find(p => p.id === nonStrikerId);
        const bowler = players.find(p => p.id === bowlerId);

        if (!striker || !nonStriker || !bowler) {
            alert("Validation Error: Please select valid players for Striker, Non-Striker, and Bowler.");
            return;
        }

        if (strikerId === nonStrikerId || strikerId === bowlerId || nonStrikerId === bowlerId) {
            alert("Validation Error: Striker, Non-Striker, and Bowler must be unique players. Please check your selections.");
            return;
        }

        const selectedMatchId = document.getElementById('umpire-match-select').value;
        if (selectedMatchId !== 'custom') {
            const matchIndex = matches.findIndex(m => m.id === selectedMatchId);
            if (matchIndex !== -1) {
                matches[matchIndex].status = 'LIVE';
                matches[matchIndex].result = 'Match is live';
            }
        }

        activeMatch = {
            linkedMatchId: selectedMatchId !== 'custom' ? selectedMatchId : null,
            teamA: teamA,
            teamB: teamB,
            oversLimit: limitOvers,
            score: 0,
            wickets: 0,
            balls: 0,
            extras: 0,
            tossDetails: `${tossWinnerName} won the toss & elected to ${tossDecision} first`,
            striker: { id: striker.id, name: striker.name, runs: 0, balls: 0, fours: 0, sixes: 0 },
            nonStriker: { id: nonStriker.id, name: nonStriker.name, runs: 0, balls: 0, fours: 0, sixes: 0 },
            bowler: { id: bowler.id, name: bowler.name, runs: 0, wickets: 0, balls: 0 },
            recentBalls: [],
            commentary: [
                `Toss Result: ${tossWinnerName} won the toss and elected to ${tossDecision} first.`,
                `Match innings started! ${teamA} is batting. ${striker.name} & ${nonStriker.name} open. ${bowler.name} bowling.`
            ],
            status: 'LIVE',
            currentBatsmen: [striker.id, nonStriker.id],
            bowlerHistory: [bowler.id]
        };

        saveDataToStorage();
        broadcastUpdate();
        renderUmpireView();
    });

    function updateUmpireScoreboard() {
        if (!activeMatch || activeMatch.status !== 'LIVE') return;

        document.getElementById('umpire-teams-header').innerText = activeMatch.teamA + " Innings vs " + activeMatch.teamB;
        document.getElementById('umpire-toss-display').innerText = activeMatch.tossDetails;
        document.getElementById('umpire-live-runs').innerText = activeMatch.score;
        document.getElementById('umpire-live-wickets').innerText = activeMatch.wickets;
        document.getElementById('umpire-target-overs').innerText = activeMatch.oversLimit;

        const overs = Math.floor(activeMatch.balls / 6);
        const balls = activeMatch.balls % 6;
        document.getElementById('umpire-live-overs').innerText = overs + "." + balls;

        const totalOversFraction = activeMatch.balls / 6;
        const crr = totalOversFraction > 0 ? (activeMatch.score / totalOversFraction).toFixed(2) : '0.00';
        document.getElementById('umpire-live-crr').innerText = crr;
        document.getElementById('umpire-live-extras').innerText = activeMatch.extras;

        // Calculate Projected Score (Image 4)
        const proj = Math.round(parseFloat(crr) * activeMatch.oversLimit);
        document.getElementById('umpire-projected-score').innerText = `${proj} runs (at ${crr} RPO)`;

        // Batsmen
        document.getElementById('umpire-strike-name').innerText = activeMatch.striker.name;
        document.getElementById('umpire-strike-runs').innerText = activeMatch.striker.runs;
        document.getElementById('umpire-strike-balls').innerText = activeMatch.striker.balls;
        document.getElementById('umpire-strike-fours').innerText = activeMatch.striker.fours;
        document.getElementById('umpire-strike-sixes').innerText = activeMatch.striker.sixes;

        document.getElementById('umpire-nonstrike-name').innerText = activeMatch.nonStriker.name;
        document.getElementById('umpire-nonstrike-runs').innerText = activeMatch.nonStriker.runs;
        document.getElementById('umpire-nonstrike-balls').innerText = activeMatch.nonStriker.balls;
        document.getElementById('umpire-nonstrike-fours').innerText = activeMatch.nonStriker.fours;
        document.getElementById('umpire-nonstrike-sixes').innerText = activeMatch.nonStriker.sixes;

        // Bowler & Wickets icons (Image 4)
        document.getElementById('umpire-bowler-name').innerText = activeMatch.bowler.name;
        document.getElementById('umpire-bowler-runs').innerText = activeMatch.bowler.runs;
        document.getElementById('umpire-bowler-wickets').innerText = activeMatch.bowler.wickets;

        const wicIcons = document.getElementById('umpire-bowler-wickets-icons');
        wicIcons.innerHTML = '';
        for (let w = 0; w < activeMatch.bowler.wickets; w++) {
            wicIcons.innerHTML += '<span class="material-symbols-outlined text-xs" style="font-variation-settings: \'FILL\' 1">sports_cricket</span>';
        }
        
        const bOvers = Math.floor(activeMatch.bowler.balls / 6);
        const bBalls = activeMatch.bowler.balls % 6;
        document.getElementById('umpire-bowl-overs').innerText = bOvers + "." + bBalls;

        // Recent balls log
        const recentLog = document.getElementById('umpire-over-balls-log');
        recentLog.innerHTML = '';
        if (activeMatch.recentBalls.length === 0) {
            recentLog.innerHTML = '<span class="text-xs text-on-surface-variant italic">No deliveries.</span>';
        } else {
            activeMatch.recentBalls.forEach(ball => {
                const chip = document.createElement('span');
                let colorClass = 'bg-white/10 text-white';
                if (ball === '4') colorClass = 'bg-green-500/20 text-green-400 font-bold border border-green-500/30';
                if (ball === '6') colorClass = 'bg-green-500/35 text-green-400 font-black border border-green-400/40';
                if (ball === 'W') colorClass = 'bg-red-500/30 text-red-400 font-bold border border-red-500/30';
                if (ball.includes('Wd') || ball.includes('Nb')) colorClass = 'bg-yellow-500/20 text-yellow-400';
                
                chip.className = `px-2.5 py-1 rounded-lg text-xs ${colorClass}`;
                chip.innerText = ball;
                recentLog.appendChild(chip);
            });
        }

        // Commentary
        const feed = document.getElementById('umpire-commentary-feed');
        feed.innerHTML = '';
        activeMatch.commentary.slice().reverse().forEach(log => {
            const line = document.createElement('div');
            line.className = "py-1.5 border-b border-white/5 last:border-0";
            if (log.includes('OUT') || log.includes('Wicket') || log.includes('retired')) {
                line.className += " text-red-400 font-bold";
            } else if (log.includes('boundary') || log.includes('FOUR') || log.includes('SIX')) {
                line.className += " text-green-400";
            }
            line.innerText = log;
            feed.appendChild(line);
        });
    }

    // Record Legal Ball (with +5 and +7 capability)
    document.querySelectorAll('.btn-umpire-run').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!activeMatch || activeMatch.status !== 'LIVE') return;
            saveMatchStateToHistory();
            const val = parseInt(btn.getAttribute('data-val'));

            activeMatch.score += val;
            activeMatch.balls += 1;
            activeMatch.striker.runs += val;
            activeMatch.striker.balls += 1;
            if (val === 4) activeMatch.striker.fours += 1;
            if (val === 6) activeMatch.striker.sixes += 1;

            activeMatch.bowler.runs += val;
            activeMatch.bowler.balls += 1;
            recordH2HEvent(activeMatch.striker.id, activeMatch.bowler.id, val, false);

            let ballSymbol = val.toString();
            if (val === 0) ballSymbol = '•';
            activeMatch.recentBalls.push(ballSymbol);

            const overCount = Math.floor((activeMatch.balls - 1) / 6);
            const ballIndex = ((activeMatch.balls - 1) % 6) + 1;
            let commentaryMsg = `${overCount}.${ballIndex}: ${activeMatch.bowler.name} to ${activeMatch.striker.name}, `;
            if (val === 0) {
                commentaryMsg += "no run.";
            } else if (val === 4) {
                commentaryMsg += "FOUR boundary!";
            } else if (val === 6) {
                commentaryMsg += "SIX runs, shot!";
            } else {
                commentaryMsg += `${val} run${val > 1 ? 's' : ''}.`;
            }
            activeMatch.commentary.push(commentaryMsg);

            // Swap strike on odd runs
            if (val % 2 !== 0) {
                swapBatsmenStrike();
            }

            if (activeMatch.balls % 6 === 0) {
                triggerUmpireOverComplete();
            }

            saveDataToStorage();
            broadcastUpdate();
            updateUmpireScoreboard();
        });
    });

    // Record Extras (Added Leg Byes - Image 4 & 9)
    document.querySelectorAll('.btn-umpire-extra').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!activeMatch || activeMatch.status !== 'LIVE') return;
            saveMatchStateToHistory();
            const type = btn.getAttribute('data-type');

            if (type === 'wide') {
                activeMatch.score += 1;
                activeMatch.extras += 1;
                activeMatch.bowler.runs += 1;
                activeMatch.recentBalls.push('Wd');
                activeMatch.commentary.push(`Wide delivery conceded by ${activeMatch.bowler.name}.`);
            } else if (type === 'no-ball') {
                activeMatch.score += 1;
                activeMatch.extras += 1;
                activeMatch.bowler.runs += 1;
                activeMatch.recentBalls.push('Nb');
                activeMatch.commentary.push(`No Ball! Free hit given.`);
            } else if (type === 'bye') {
                activeMatch.score += 1;
                activeMatch.extras += 1;
                activeMatch.balls += 1;
                activeMatch.bowler.balls += 1;
                activeMatch.striker.balls += 1;
                activeMatch.recentBalls.push('B');
                activeMatch.commentary.push(`1 bye runs recorded.`);
                swapBatsmenStrike();
                
                if (activeMatch.balls % 6 === 0) {
                    triggerUmpireOverComplete();
                }
            } else if (type === 'leg-bye') {
                // Leg Bye extra (Image 9)
                activeMatch.score += 1;
                activeMatch.extras += 1;
                activeMatch.balls += 1;
                activeMatch.bowler.balls += 1;
                activeMatch.striker.balls += 1;
                activeMatch.recentBalls.push('LB');
                activeMatch.commentary.push(`1 leg-bye logged.`);
                swapBatsmenStrike();

                if (activeMatch.balls % 6 === 0) {
                    triggerUmpireOverComplete();
                }
            }

            saveDataToStorage();
            broadcastUpdate();
            updateUmpireScoreboard();
        });
    });

    // Retire Batsman trigger (Image 9)
    document.getElementById('btn-retire-batsman').addEventListener('click', () => {
        if (!activeMatch || activeMatch.status !== 'LIVE') return;
        
        const helper = document.getElementById('umpire-retire-helper');
        helper.classList.remove('hidden');

        document.getElementById('retire-opt-striker').text = activeMatch.striker.name + " (Striker)";
        document.getElementById('retire-opt-nonstriker').text = activeMatch.nonStriker.name + " (Non-Striker)";

        const incomingSelect = document.getElementById('umpire-retire-replacement-select');
        incomingSelect.innerHTML = '';
        
        const available = players.filter(p => !activeMatch.currentBatsmen.includes(p.id));
        available.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.text = p.name;
            incomingSelect.appendChild(opt);
        });

        const searchInput = document.getElementById('umpire-retire-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.oninput = () => {
                const query = searchInput.value.toLowerCase();
                incomingSelect.innerHTML = '';
                available.forEach(p => {
                    if (p.name.toLowerCase().includes(query) || p.team.toLowerCase().includes(query)) {
                        const opt = document.createElement('option');
                        opt.value = p.id;
                        opt.text = p.name;
                        incomingSelect.appendChild(opt);
                    }
                });
            };
        }
    });

    // Submit Retire Batsman (Image 9)
    document.getElementById('btn-submit-retire').addEventListener('click', () => {
        const whoRetire = document.getElementById('umpire-retire-player-select').value;
        const incomingId = document.getElementById('umpire-retire-replacement-select').value;
        const incoming = players.find(p => p.id === incomingId);

        if (!incoming) {
            alert("Select a replacement batsman to continue.");
            return;
        }

        saveMatchStateToHistory();

        let retiredPlayerName = '';
        if (whoRetire === 'striker') {
            const oldStrikerId = activeMatch.striker.id;
            retiredPlayerName = activeMatch.striker.name;
            
            // Log innings details in history for insights before swapping out
            recordInningsHistory(oldStrikerId, activeMatch.striker.runs, activeMatch.striker.balls, 'Retired');

            activeMatch.striker = { id: incoming.id, name: incoming.name, runs: 0, balls: 0, fours: 0, sixes: 0 };
            activeMatch.currentBatsmen = activeMatch.currentBatsmen.filter(id => id !== oldStrikerId);
            activeMatch.currentBatsmen.push(incoming.id);
        } else {
            const oldNonStrikerId = activeMatch.nonStriker.id;
            retiredPlayerName = activeMatch.nonStriker.name;
            
            recordInningsHistory(oldNonStrikerId, activeMatch.nonStriker.runs, activeMatch.nonStriker.balls, 'Retired');

            activeMatch.nonStriker = { id: incoming.id, name: incoming.name, runs: 0, balls: 0, fours: 0, sixes: 0 };
            activeMatch.currentBatsmen = activeMatch.currentBatsmen.filter(id => id !== oldNonStrikerId);
            activeMatch.currentBatsmen.push(incoming.id);
        }

        activeMatch.commentary.push(`Player retirement: ${retiredPlayerName} retired. ${incoming.name} comes to the crease.`);
        document.getElementById('umpire-retire-helper').classList.add('hidden');

        saveDataToStorage();
        broadcastUpdate();
        updateUmpireScoreboard();
    });

    document.getElementById('btn-cancel-retire').addEventListener('click', () => {
        document.getElementById('umpire-retire-helper').classList.add('hidden');
    });

    // Confirm Out Wicket
    document.getElementById('btn-submit-wicket').addEventListener('click', () => {
        if (!activeMatch || activeMatch.status !== 'LIVE') return;
        
        const whoOut = document.getElementById('umpire-wicket-player-select').value;
        const wicType = document.getElementById('umpire-wicket-type-select').value;
        const incomingId = document.getElementById('umpire-incoming-batsman-select').value;
        const incoming = players.find(p => p.id === incomingId);

        if (!incoming) {
            alert("No incoming player is available to bat.");
            return;
        }

        saveMatchStateToHistory();

        activeMatch.wickets += 1;
        activeMatch.balls += 1;
        activeMatch.bowler.balls += 1;
        
        if (wicType !== 'Run Out') {
            activeMatch.bowler.wickets += 1;
            const dismissedPlayerId = whoOut === 'striker' ? activeMatch.striker.id : activeMatch.nonStriker.id;
            recordH2HEvent(dismissedPlayerId, activeMatch.bowler.id, 0, true);
        }

        let outBatsmanName = '';
        if (whoOut === 'striker') {
            const oldStrikerId = activeMatch.striker.id;
            outBatsmanName = activeMatch.striker.name;
            activeMatch.striker.balls += 1;
            
            // Record innings log to player object (Image 5)
            recordInningsHistory(oldStrikerId, activeMatch.striker.runs, activeMatch.striker.balls, wicType);
            commitIndividualStats(oldStrikerId, activeMatch.striker.runs, activeMatch.striker.balls, activeMatch.striker.fours, activeMatch.striker.sixes, 0, 0, 0);

            activeMatch.striker = { id: incoming.id, name: incoming.name, runs: 0, balls: 0, fours: 0, sixes: 0 };
            activeMatch.currentBatsmen = activeMatch.currentBatsmen.filter(id => id !== oldStrikerId);
            activeMatch.currentBatsmen.push(incoming.id);
        } else {
            const oldNonStrikerId = activeMatch.nonStriker.id;
            outBatsmanName = activeMatch.nonStriker.name;
            
            recordInningsHistory(oldNonStrikerId, activeMatch.nonStriker.runs, activeMatch.nonStriker.balls, wicType);
            commitIndividualStats(oldNonStrikerId, activeMatch.nonStriker.runs, activeMatch.nonStriker.balls, activeMatch.nonStriker.fours, activeMatch.nonStriker.sixes, 0, 0, 0);

            activeMatch.nonStriker = { id: incoming.id, name: incoming.name, runs: 0, balls: 0, fours: 0, sixes: 0 };
            activeMatch.currentBatsmen = activeMatch.currentBatsmen.filter(id => id !== oldNonStrikerId);
            activeMatch.currentBatsmen.push(incoming.id);
        }

        activeMatch.recentBalls.push('W');
        
        const overCount = Math.floor((activeMatch.balls - 1) / 6);
        const ballIndex = ((activeMatch.balls - 1) % 6) + 1;
        activeMatch.commentary.push(`${overCount}.${ballIndex}: OUT! ${outBatsmanName} is ${wicType} off ${activeMatch.bowler.name}. ${incoming.name} comes to bat.`);

        document.getElementById('umpire-wicket-helper').classList.add('hidden');

        if (activeMatch.balls % 6 === 0) {
            triggerUmpireOverComplete();
        }

        saveDataToStorage();
        broadcastUpdate();
        updateUmpireScoreboard();
    });

    // Helper: Pushes innings log to player history (Image 5)
    function recordInningsHistory(playerId, runs, balls, outType) {
        const player = players.find(p => p.id === playerId);
        if (!player) return;

        if (!player.inningsHistory) player.inningsHistory = [];
        
        const newRecord = {
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
            opponent: `${activeMatch.teamA} vs ${activeMatch.teamB}`,
            runs: runs,
            balls: balls,
            outType: outType,
            over: Math.floor(activeMatch.balls / 6)
        };

        // Keep last 5 innings (Image 5)
        player.inningsHistory.unshift(newRecord);
        if (player.inningsHistory.length > 5) {
            player.inningsHistory.pop();
        }
    }

    // Complete Match / commit results
    document.getElementById('btn-end-innings').addEventListener('click', () => {
        if (!activeMatch || activeMatch.status !== 'LIVE') return;

        if (confirm("End match and log results?")) {
            recordInningsHistory(activeMatch.striker.id, activeMatch.striker.runs, activeMatch.striker.balls, 'Not out');
            recordInningsHistory(activeMatch.nonStriker.id, activeMatch.nonStriker.runs, activeMatch.nonStriker.balls, 'Not out');

            commitIndividualStats(activeMatch.striker.id, activeMatch.striker.runs, activeMatch.striker.balls, activeMatch.striker.fours, activeMatch.striker.sixes, 1, 1, 0);
            commitIndividualStats(activeMatch.nonStriker.id, activeMatch.nonStriker.runs, activeMatch.nonStriker.balls, activeMatch.nonStriker.fours, activeMatch.nonStriker.sixes, 1, 1, 0);
            commitIndividualStats(activeMatch.bowler.id, 0, 0, 0, 0, activeMatch.bowler.balls, activeMatch.bowler.runs, activeMatch.bowler.wickets, 1);

            activeMatch.status = 'COMPLETED';
            activeMatch.commentary.push(`Match complete! Final Score: ${activeMatch.teamA} ${activeMatch.score}/${activeMatch.wickets} in ${Math.floor(activeMatch.balls / 6)}.${activeMatch.balls % 6} overs.`);

            // Log match result in completedMatches (Image 1)
            const finalResultText = `${activeMatch.teamA} completed innings at ${activeMatch.score}/${activeMatch.wickets}`;
            completedMatches.unshift({
                id: 'match-' + Date.now(),
                teamA: activeMatch.teamA,
                teamB: activeMatch.teamB,
                scoreA: activeMatch.score,
                wicketsA: activeMatch.wickets,
                oversA: (Math.floor(activeMatch.balls / 6)) + "." + (activeMatch.balls % 6),
                result: finalResultText
            });

            saveDataToStorage();
            broadcastUpdate();
            renderUmpireView();
        }
    });


    // ==================== PLAYER PORTAL SUB-TABS (Image 5) ====================
    let activePlayerSubTab = 'lifetime';

    document.getElementById('btn-tab-lifetime').addEventListener('click', () => {
        switchPlayerSubTab('lifetime');
    });
    document.getElementById('btn-tab-insights').addEventListener('click', () => {
        switchPlayerSubTab('insights');
    });
    document.getElementById('btn-tab-compare').addEventListener('click', () => {
        switchPlayerSubTab('compare');
    });
    document.getElementById('btn-tab-faceoff').addEventListener('click', () => {
        switchPlayerSubTab('faceoff');
    });

    function switchPlayerSubTab(tabKey) {
        activePlayerSubTab = tabKey;
        
        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            if (btn.id === `btn-tab-${tabKey}`) {
                btn.classList.add('active', 'text-secondary', 'border-b-2', 'border-secondary');
                btn.classList.remove('text-on-surface-variant');
            } else {
                btn.classList.remove('active', 'text-secondary', 'border-b-2', 'border-secondary');
                btn.classList.add('text-on-surface-variant');
            }
        });

        // Toggle panel divs
        document.getElementById('panel-lifetime').classList.add('hidden');
        document.getElementById('panel-insights').classList.add('hidden');
        document.getElementById('panel-compare').classList.add('hidden');
        document.getElementById('panel-faceoff').classList.add('hidden');

        document.getElementById(`panel-${tabKey}`).classList.remove('hidden');
        
        if (tabKey === 'insights') {
            loadPlayerCricInsights();
        } else if (tabKey === 'compare') {
            loadPlayerComparisonPanel();
        } else if (tabKey === 'faceoff') {
            loadPlayerFaceOffPanel();
        }
    }

    // CricInsights (Image 5)
    function loadPlayerCricInsights() {
        const p = players.find(x => x.id === myProfileId);
        if (!p) return;

        const body = document.getElementById('table-insights-body');
        body.innerHTML = '';

        if (!p.inningsHistory || p.inningsHistory.length === 0) {
            body.innerHTML = '<tr><td colspan="5" class="text-center text-xs text-on-surface-variant italic py-8">No recent innings recorded yet.</td></tr>';
            document.getElementById('insight-form-runs').innerText = '0';
            document.getElementById('insight-form-caught').innerText = '0';
            document.getElementById('insight-form-notouts').innerText = '0';
            document.getElementById('insight-form-avg').innerText = '0.0';
            return;
        }

        // Fill table rows
        p.inningsHistory.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.date}</td>
                <td class="font-bold text-white">${row.opponent}</td>
                <td class="font-mono text-secondary">${row.runs} (${row.balls})</td>
                <td>${row.outType}</td>
                <td class="text-on-surface-variant">${row.over}</td>
            `;
            body.appendChild(tr);
        });

        // CricInsights Aggregated Form stats
        const last5 = p.inningsHistory.slice(0, 5);
        const totalRuns = last5.reduce((sum, item) => sum + item.runs, 0);
        const caughtOut = last5.filter(item => item.outType.toLowerCase().includes('caught')).length;
        const notOuts = last5.filter(item => item.outType.toLowerCase().includes('not out') || item.outType.toLowerCase().includes('retired')).length;
        const avgForm = last5.length > 0 ? (totalRuns / Math.max(1, last5.length - notOuts)).toFixed(1) : '0.0';

        document.getElementById('insight-form-runs').innerText = totalRuns;
        document.getElementById('insight-form-caught').innerText = caughtOut;
        document.getElementById('insight-form-notouts').innerText = notOuts;
        document.getElementById('insight-form-avg').innerText = avgForm;
    }

    // Player Comparison engine (Image 5)
    function loadPlayerComparisonPanel() {
        const selectA = document.getElementById('compare-player-a');
        const selectB = document.getElementById('compare-player-b');

        selectA.innerHTML = '';
        selectB.innerHTML = '';

        players.forEach(p => {
            const optA = document.createElement('option');
            optA.value = p.id;
            optA.text = p.name;
            if (p.id === myProfileId) optA.selected = true;
            selectA.appendChild(optA);

            const optB = document.createElement('option');
            optB.value = p.id;
            optB.text = p.name;
            // Select second player by default
            if (players.length > 1 && p.id === players[1].id) optB.selected = true;
            selectB.appendChild(optB);
        });

        updateComparisonStats();
    }

    function updateComparisonStats() {
        const idA = document.getElementById('compare-player-a').value;
        const idB = document.getElementById('compare-player-b').value;

        const pA = players.find(p => p.id === idA);
        const pB = players.find(p => p.id === idB);

        if (!pA || !pB) return;

        document.getElementById('comp-val-matches-a').innerText = pA.stats.matches;
        document.getElementById('comp-val-matches-b').innerText = pB.stats.matches;

        document.getElementById('comp-val-runs-a').innerText = pA.stats.runs;
        document.getElementById('comp-val-runs-b').innerText = pB.stats.runs;

        document.getElementById('comp-val-avg-a').innerText = pA.stats.avg.toFixed(1);
        document.getElementById('comp-val-avg-b').innerText = pB.stats.avg.toFixed(1);

        document.getElementById('comp-val-sr-a').innerText = pA.stats.sr.toFixed(1);
        document.getElementById('comp-val-sr-b').innerText = pB.stats.sr.toFixed(1);

        document.getElementById('comp-val-wkts-a').innerText = pA.stats.wickets;
        document.getElementById('comp-val-wkts-b').innerText = pB.stats.wickets;

        document.getElementById('comp-val-fours-a').innerText = pA.stats.fours;
        document.getElementById('comp-val-fours-b').innerText = pB.stats.fours;
    }

    document.getElementById('compare-player-a').addEventListener('change', updateComparisonStats);
    document.getElementById('compare-player-b').addEventListener('change', updateComparisonStats);


    // Bowler vs Batsman Face Off H2H calculation
    function loadPlayerFaceOffPanel() {
        const selectA = document.getElementById('faceoff-player-a');
        const selectB = document.getElementById('faceoff-player-b');

        selectA.innerHTML = '';
        selectB.innerHTML = '';

        players.forEach(p => {
            const optA = document.createElement('option');
            optA.value = p.id;
            optA.text = p.name;
            if (p.id === myProfileId) optA.selected = true;
            selectA.appendChild(optA);

            const optB = document.createElement('option');
            optB.value = p.id;
            optB.text = p.name;
            if (players.length > 1 && p.id === players[1].id) optB.selected = true;
            selectB.appendChild(optB);
        });

        updateFaceOffStats();
    }

    function updateFaceOffStats() {
        const idA = document.getElementById('faceoff-player-a').value; // Batsman
        const idB = document.getElementById('faceoff-player-b').value; // Bowler

        const key = idA + "_" + idB;
        const stats = h2h[key] || { runs: 0, balls: 0, dismissals: 0 };

        document.getElementById('faceoff-runs').innerText = stats.runs;
        document.getElementById('faceoff-balls').innerText = stats.balls;
        document.getElementById('faceoff-dismissals').innerText = stats.dismissals;

        // Dynamic edge percentage
        let batsmanScore = 50 + stats.runs - (stats.dismissals * 15);
        let bowlerScore = 50 + (stats.dismissals * 15) - (stats.runs * 0.5);

        let total = batsmanScore + bowlerScore;
        let batsmanPct = total > 0 ? Math.round((batsmanScore / total) * 100) : 50;
        let bowlerPct = 100 - batsmanPct;

        if (batsmanPct < 10) { batsmanPct = 10; bowlerPct = 90; }
        if (batsmanPct > 90) { batsmanPct = 90; bowlerPct = 10; }

        document.getElementById('faceoff-edge-batsman').style.width = batsmanPct + '%';
        document.getElementById('faceoff-edge-bowler').style.width = bowlerPct + '%';
        document.getElementById('faceoff-edge-batsman-text').innerText = batsmanPct + '%';
        document.getElementById('faceoff-edge-bowler-text').innerText = bowlerPct + '%';
    }

    document.getElementById('faceoff-player-a').addEventListener('change', updateFaceOffStats);
    document.getElementById('faceoff-player-b').addEventListener('change', updateFaceOffStats);


    // ==================== BENTO LEFT NAV: TOURNEYS VS MATCHMAKER VS DIRECTORY ====================
    let activeBentoTab = 'tourneys';

    document.getElementById('btn-tab-tourneys').addEventListener('click', () => {
        switchBentoTab('tourneys');
    });
    document.getElementById('btn-tab-matchmaker').addEventListener('click', () => {
        switchBentoTab('matchmaker');
    });
    document.getElementById('btn-tab-directory').addEventListener('click', () => {
        switchBentoTab('directory');
    });

    function switchBentoTab(tabKey) {
        activeBentoTab = tabKey;
        
        document.querySelectorAll('#view-player .sub-tab-btn').forEach(btn => {
            if (btn.id === `btn-tab-${tabKey}`) {
                btn.classList.add('active', 'text-secondary', 'border-b-2', 'border-secondary');
                btn.classList.remove('text-on-surface-variant');
            } else {
                btn.classList.remove('active', 'text-secondary', 'border-b-2', 'border-secondary');
                btn.classList.add('text-on-surface-variant');
            }
        });

        document.getElementById('section-tourneys').classList.add('hidden');
        document.getElementById('section-matchmaker').classList.add('hidden');
        document.getElementById('section-directory').classList.add('hidden');

        document.getElementById(`section-${tabKey}`).classList.remove('hidden');

        if (tabKey === 'matchmaker') {
            renderMatchmakerBoard();
        } else if (tabKey === 'directory') {
            renderEcosystemDirectory();
        }
    }


    // ==================== RECRUITMENT MATCHMAKER BOARD (Image 6) ====================
    
    // Toggle creation form
    document.getElementById('btn-open-matchmaker-form').addEventListener('click', () => {
        const box = document.getElementById('matchmaker-form-box');
        box.classList.toggle('hidden');
    });

    document.getElementById('btn-cancel-mm').addEventListener('click', () => {
        document.getElementById('matchmaker-form-box').classList.add('hidden');
    });

    // Create Matchmaker post
    document.getElementById('btn-submit-mm').addEventListener('click', () => {
        const type = document.getElementById('mm-type').value;
        const ground = document.getElementById('mm-ground').value.trim() || 'Open Ground';
        const date = document.getElementById('mm-date').value || '2026-06-01';
        const time = document.getElementById('mm-time').value || '10:00';
        const desc = document.getElementById('mm-desc').value.trim() || 'Urgent match recruitment!';

        let authorName = 'Guest Organiser';
        let authorTeam = 'N/A';
        
        if (myProfileId) {
            const p = players.find(x => x.id === myProfileId);
            if (p) {
                authorName = p.name;
                authorTeam = p.team;
            }
        }

        const newPost = {
            id: 'post-' + Date.now(),
            type: type,
            author: authorName,
            teamName: authorTeam,
            ground: ground,
            date: date,
            time: time,
            desc: desc,
            contact: '+91 99000 88888',
            timeAgo: 'Just now'
        };

        recruitmentPosts.unshift(newPost);
        
        // Reset and hide
        document.getElementById('mm-desc').value = '';
        document.getElementById('matchmaker-form-box').classList.add('hidden');

        saveDataToStorage();
        broadcastUpdate();
        renderMatchmakerBoard();
    });

    function renderMatchmakerBoard() {
        const list = document.getElementById('matchmaker-posts-list');
        list.innerHTML = '';

        recruitmentPosts.forEach(post => {
            const card = document.createElement('div');
            card.className = "p-4 glass-card rounded-xl border border-white/5 space-y-2 relative";
            
            const badgeColor = post.type === 'Opponent' ? 'bg-secondary/20 text-secondary' : 'bg-yellow-500/20 text-yellow-400';
            
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}">${post.type} Request</span>
                        <h4 class="text-xs font-bold text-white mt-1.5">${post.author}'s Team (${post.teamName})</h4>
                    </div>
                    <span class="text-[8px] text-on-surface-variant">${post.timeAgo}</span>
                </div>
                <p class="text-xs text-on-surface-variant">${post.desc}</p>
                <div class="flex items-center justify-between pt-1 text-[10px] text-on-surface-variant font-bold">
                    <span class="flex items-center gap-0.5"><span class="material-symbols-outlined text-xs">calendar_month</span> ${post.date} | ${post.time}</span>
                    <span class="flex items-center gap-0.5"><span class="material-symbols-outlined text-xs">stadium</span> ${post.ground}</span>
                    <button class="px-3 py-1 bg-white/5 hover:bg-white/15 text-white border border-white/10 rounded-lg text-[9px] font-bold tracking-wider btn-contact-matchmaker" data-contact="${post.contact}" data-author="${post.author}">CONTACT</button>
                </div>
            `;
            list.appendChild(card);
        });

        // Bind Contact Prompts
        document.querySelectorAll('.btn-contact-matchmaker').forEach(btn => {
            btn.addEventListener('click', () => {
                const contact = btn.getAttribute('data-contact');
                const author = btn.getAttribute('data-author');
                alert(`Call or WhatsApp ${author} directly at: ${contact}`);
            });
        });
    }


    // ==================== LOCAL ECOSYSTEM CONNECTIONS DIRECTORY (Image 3) ====================
    function renderEcosystemDirectory() {
        // Clear drawer
        document.getElementById('directory-drawer').classList.add('hidden');
    }

    // Directory Category bindings
    document.querySelectorAll('.directory-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-cat');
            openDirectoryCategory(cat);
        });
    });

    document.getElementById('btn-close-directory-drawer').addEventListener('click', () => {
        document.getElementById('directory-drawer').classList.add('hidden');
    });

    function openDirectoryCategory(categoryKey) {
        const drawer = document.getElementById('directory-drawer');
        const title = document.getElementById('directory-drawer-title');
        const list = document.getElementById('directory-drawer-list');

        title.innerText = categoryKey.toUpperCase() + " directory listings";
        list.innerHTML = '';

        const items = directoryDatabase[categoryKey] || [];
        
        if (items.length === 0) {
            list.innerHTML = '<div class="text-center text-xs py-4 text-on-surface-variant">No listings registered.</div>';
        } else {
            items.forEach(item => {
                const row = document.createElement('div');
                row.className = "p-2.5 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center mb-1";
                
                let details = '';
                if (item.experience) details += `Exp: ${item.experience} | `;
                if (item.grade) details += item.grade;
                if (item.location) details += item.location;
                if (item.type) details += item.type;
                if (item.specialization) details += item.specialization;

                row.innerHTML = `
                    <div>
                        <div class="font-bold text-white">${item.name}</div>
                        <div class="text-[9px] text-on-surface-variant">${details}</div>
                    </div>
                    <button class="px-2.5 py-1 bg-secondary text-on-secondary-fixed font-bold rounded text-[9px] btn-directory-call" data-name="${item.name}" data-phone="${item.contact}">Call</button>
                `;
                list.appendChild(row);
            });
        }

        drawer.classList.remove('hidden');

        // Bind Call actions
        document.querySelectorAll('.btn-directory-call').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-name');
                const phone = btn.getAttribute('data-phone');
                alert(`Calling ${name} at: ${phone}`);
            });
        });
    }


    // ==================== TOURNAMENT VIEWS LOGIC (STANDINGS & LEADERBOARD) ====================
    let activeTournSubTab = 'list';
    let activeMatchFilter = 'all';

    document.getElementById('btn-tourn-list').addEventListener('click', () => {
        switchTournamentSubTab('list');
    });
    document.getElementById('btn-tourn-matches').addEventListener('click', () => {
        switchTournamentSubTab('matches');
    });
    document.getElementById('btn-tourn-points').addEventListener('click', () => {
        switchTournamentSubTab('points');
    });
    document.getElementById('btn-tourn-mvp').addEventListener('click', () => {
        switchTournamentSubTab('mvp');
    });

    function switchTournamentSubTab(tabKey) {
        activeTournSubTab = tabKey;
        
        // Update tabs styling
        document.querySelectorAll('#section-tourneys button').forEach(btn => {
            if (btn.id === `btn-tourn-${tabKey}`) {
                btn.className = "flex-1 py-1.5 rounded bg-secondary text-on-secondary-fixed";
            } else {
                btn.className = "flex-1 py-1.5 rounded text-on-surface-variant hover:text-white transition-all";
            }
        });

        renderTournamentContent();
    }

    function renderTournamentContent() {
        const box = document.getElementById('player-tournament-content-box');
        box.innerHTML = '';

        if (activeTournSubTab === 'list') {
            // Render active leagues list
            if (tournaments.length === 0) {
                box.innerHTML = '<div class="text-xs text-on-surface-variant italic text-center py-8">No tournaments hosted.</div>';
            } else {
                tournaments.forEach(t => {
                    const card = document.createElement('div');
                    card.className = "p-3 glass-card rounded-xl border border-white/5 flex justify-between items-center";
                    card.innerHTML = `
                        <div>
                            <h4 class="text-xs font-bold text-white">${t.name}</h4>
                            <span class="text-[9px] text-secondary">Organiser: ${t.hostName}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-[10px] bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full font-bold">${t.teams} Teams</span>
                            <span class="block text-[8px] text-on-surface-variant mt-1">Starts: ${t.startDate}</span>
                        </div>
                    `;
                    box.appendChild(card);
                });
            }
        } else if (activeTournSubTab === 'matches') {
            // Render filter pills
            const filterContainer = document.createElement('div');
            filterContainer.className = "flex gap-2 mb-3 bg-white/5 p-1 rounded-lg border border-white/5 text-[9px] font-bold";
            
            const filters = ['all', 'live', 'upcoming', 'completed'];
            filters.forEach(f => {
                const btn = document.createElement('button');
                btn.className = `flex-1 py-1 rounded transition-all ${activeMatchFilter === f ? 'bg-secondary text-on-secondary-fixed' : 'text-on-surface-variant hover:text-white'}`;
                btn.innerText = f.toUpperCase();
                btn.addEventListener('click', () => {
                    activeMatchFilter = f;
                    renderTournamentContent();
                });
                filterContainer.appendChild(btn);
            });
            box.appendChild(filterContainer);

            // Filter matches
            let filteredMatches = matches;
            if (activeMatchFilter !== 'all') {
                filteredMatches = matches.filter(m => m.status.toLowerCase() === activeMatchFilter);
            }

            if (filteredMatches.length === 0) {
                const empty = document.createElement('div');
                empty.className = "text-xs text-on-surface-variant italic text-center py-8";
                empty.innerText = `No ${activeMatchFilter} matches found.`;
                box.appendChild(empty);
            } else {
                filteredMatches.forEach(match => {
                    const card = document.createElement('div');
                    card.className = "p-3.5 glass-card rounded-xl border border-white/5 space-y-2 relative hover:border-secondary/30 transition-all";
                    
                    let badgeColor = 'bg-white/10 text-white';
                    let statusLabel = match.status;
                    if (match.status === 'LIVE') {
                        badgeColor = 'bg-green-500/20 text-green-400 live-pulse border border-green-500/30';
                        statusLabel = 'LIVE NOW';
                    } else if (match.status === 'UPCOMING') {
                        badgeColor = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
                    } else if (match.status === 'COMPLETED') {
                        badgeColor = 'bg-red-500/20 text-red-400 border border-red-500/30';
                    }

                    // Format date/time
                    const dateTimeStr = match.date ? `${match.date} at ${match.time}` : 'Scheduled';

                    let scoreSection = '';
                    if (match.status === 'LIVE' || match.status === 'COMPLETED') {
                        scoreSection = `
                            <div class="flex justify-between items-center text-xs font-black text-white mt-1">
                                <span>${match.teamA}</span>
                                <span>${match.scoreA}/${match.wicketsA} <span class="text-[10px] font-normal text-on-surface-variant">(${match.oversA} Ov)</span></span>
                            </div>
                        `;
                    } else {
                        scoreSection = `
                            <div class="flex justify-between items-center text-xs font-black text-white mt-1">
                                <span>${match.teamA}</span>
                                <span class="text-[10px] font-normal text-on-surface-variant">VS</span>
                                <span>${match.teamB}</span>
                            </div>
                        `;
                    }

                    card.innerHTML = `
                        <div class="flex justify-between items-center text-[9px] font-bold">
                            <span class="text-secondary tracking-wider uppercase">${match.tournamentName || 'Monsoon League Cup'}</span>
                            <span class="px-2 py-0.5 rounded-full ${badgeColor}">${statusLabel}</span>
                        </div>
                        ${scoreSection}
                        <div class="text-[10px] text-yellow-400 font-bold flex justify-between items-center">
                            <span>${match.result || 'Match scheduled'}</span>
                            <span class="text-[9px] text-on-surface-variant font-normal">${dateTimeStr}</span>
                        </div>
                    `;
                    box.appendChild(card);
                });
            }
        } else if (activeTournSubTab === 'points') {
            // Standings Points Table (Image 1)
            const wrapper = document.createElement('div');
            wrapper.className = "overflow-x-auto rounded-xl border border-white/5";
            wrapper.innerHTML = `
                <table class="cric-table text-[10px]">
                    <thead>
                        <tr class="bg-white/5">
                            <th>Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>L</th>
                            <th>NRR</th>
                            <th>Pts</th>
                        </tr>
                    </thead>
                    <tbody id="standings-table-body">
                        <!-- Dynamic Standings Rows -->
                    </tbody>
                </table>
            `;
            box.appendChild(wrapper);

            const tbody = document.getElementById('standings-table-body');
            tbody.innerHTML = '';
            
            if (tournaments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center italic text-on-surface-variant py-8">Standings will calculate when tournaments start.</td></tr>';
            } else {
                // Dynamic standings compilations
                const standings = {};
                
                // Initialize default teams
                const defaultTeamsList = ['Mumbai Stormers', 'Pune Titans', 'Aravalli CC', 'Gujarat XI'];
                defaultTeamsList.forEach(tName => {
                    standings[tName] = {
                        name: tName, played: 0, won: 0, lost: 0,
                        runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0,
                        pts: 0, nrrVal: 0, nrr: '0.00'
                    };
                });

                // Add any other teams found in matches
                matches.forEach(m => {
                    if (m.teamA && !standings[m.teamA]) {
                        standings[m.teamA] = { name: m.teamA, played: 0, won: 0, lost: 0, runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0, pts: 0, nrrVal: 0, nrr: '0.00' };
                    }
                    if (m.teamB && !standings[m.teamB]) {
                        standings[m.teamB] = { name: m.teamB, played: 0, won: 0, lost: 0, runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0, pts: 0, nrrVal: 0, nrr: '0.00' };
                    }
                });

                const getOversDecimal = (oversStr) => {
                    if (!oversStr) return 0;
                    const parts = oversStr.toString().split('.');
                    const overs = parseInt(parts[0]) || 0;
                    const balls = parts.length > 1 ? parseInt(parts[1]) || 0 : 0;
                    return overs + (balls / 6);
                };

                matches.forEach(m => {
                    if (m.status === 'COMPLETED') {
                        const tA = m.teamA;
                        const tB = m.teamB;

                        standings[tA].played += 1;
                        standings[tB].played += 1;

                        const sA = m.scoreA || 0;
                        const sB = m.scoreB || 0;
                        const decOA = getOversDecimal(m.oversA);
                        const decOB = getOversDecimal(m.oversB);

                        // Accumulate runs/overs for NRR
                        standings[tA].runsScored += sA;
                        standings[tA].oversFaced += decOA || 5.0; // Fallback to 5 overs quota if 0
                        standings[tA].runsConceded += sB;
                        standings[tA].oversBowled += decOB || 5.0;

                        standings[tB].runsScored += sB;
                        standings[tB].oversFaced += decOB || 5.0;
                        standings[tB].runsConceded += sA;
                        standings[tB].oversBowled += decOA || 5.0;

                        if (sA > sB) {
                            standings[tA].won += 1;
                            standings[tA].pts += 2;
                            standings[tB].lost += 1;
                        } else if (sB > sA) {
                            standings[tB].won += 1;
                            standings[tB].pts += 2;
                            standings[tA].lost += 1;
                        } else {
                            standings[tA].pts += 1;
                            standings[tB].pts += 1;
                        }
                    }
                });

                // Finalize NRR and sort
                const standingsList = Object.values(standings);
                standingsList.forEach(t => {
                    const rateScored = t.oversFaced > 0 ? (t.runsScored / t.oversFaced) : 0;
                    const rateConceded = t.oversBowled > 0 ? (t.runsConceded / t.oversBowled) : 0;
                    t.nrrVal = rateScored - rateConceded;
                    if (t.nrrVal > 0) {
                        t.nrr = "+" + t.nrrVal.toFixed(2);
                    } else if (t.nrrVal < 0) {
                        t.nrr = t.nrrVal.toFixed(2);
                    } else {
                        t.nrr = "0.00";
                    }
                });

                standingsList.sort((a, b) => {
                    if (b.pts !== a.pts) return b.pts - a.pts;
                    return b.nrrVal - a.nrrVal;
                });

                standingsList.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="font-bold text-white">${row.name}</td>
                        <td>${row.played}</td>
                        <td>${row.won}</td>
                        <td>${row.lost}</td>
                        <td class="font-mono">${row.nrr}</td>
                        <td class="font-bold text-secondary">${row.pts}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } else if (activeTournSubTab === 'mvp') {
            // MVP League Leaderboards sorted dynamically (Image 5)
            const wrapper = document.createElement('div');
            wrapper.className = "space-y-4";
            wrapper.innerHTML = `
                <div class="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <h5 class="text-[10px] text-secondary font-black uppercase mb-2">Top Batsmen</h5>
                    <div id="mvp-batsmen-list" class="space-y-2 text-xs"></div>
                </div>
                <div class="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <h5 class="text-[10px] text-secondary font-black uppercase mb-2">Top Bowlers</h5>
                    <div id="mvp-bowlers-list" class="space-y-2 text-xs"></div>
                </div>
            `;
            box.appendChild(wrapper);

            const batList = document.getElementById('mvp-batsmen-list');
            const bowlList = document.getElementById('mvp-bowlers-list');

            // Sort pool players by runs
            const topBatsmen = [...players].sort((a, b) => b.stats.runs - a.stats.runs).slice(0, 3);
            // Sort pool players by wickets
            const topBowlers = [...players].sort((a, b) => b.stats.wickets - a.stats.wickets).slice(0, 3);

            topBatsmen.forEach((p, index) => {
                const line = document.createElement('div');
                line.className = "flex justify-between items-center py-1 border-b border-white/5 last:border-0";
                line.innerHTML = `
                    <span>#${index+1} <span class="font-bold text-white">${p.name}</span> (${p.team})</span>
                    <span class="font-mono text-secondary font-bold">${p.stats.runs} Runs</span>
                `;
                batList.appendChild(line);
            });

            topBowlers.forEach((p, index) => {
                const line = document.createElement('div');
                line.className = "flex justify-between items-center py-1 border-b border-white/5 last:border-0";
                line.innerHTML = `
                    <span>#${index+1} <span class="font-bold text-white">${p.name}</span> (${p.team})</span>
                    <span class="font-mono text-secondary font-bold">${p.stats.wickets} Wkts</span>
                `;
                bowlList.appendChild(line);
            });
        }
    }


    // ==================== PUBLIC SCORES VIEW CONTROLLER ====================
    function renderPublicView() {
        if (!activeMatch || activeMatch.status === 'SETUP') {
            document.getElementById('public-team-names').innerText = "Waiting for setup...";
            document.getElementById('public-toss-display').innerText = "Toss results will show here.";
            document.getElementById('public-score-runs').innerText = "0";
            document.getElementById('public-score-wickets').innerText = "0";
            document.getElementById('public-score-overs').innerText = "0.0";
            document.getElementById('public-score-crr').innerText = "0.00";
            document.getElementById('public-score-extras').innerText = "0";
            document.getElementById('public-target-runs').innerText = "N/A";
            document.getElementById('public-projected-score').innerText = "0";
            document.getElementById('public-match-status').innerText = "INACTIVE";

            document.getElementById('public-strike-name').innerText = "Batsman 1";
            document.getElementById('public-strike-runs').innerText = "0";
            document.getElementById('public-strike-balls').innerText = "0";
            document.getElementById('public-strike-fours').innerText = "0";
            document.getElementById('public-strike-sixes').innerText = "0";

            document.getElementById('public-nonstrike-name').innerText = "Batsman 2";
            document.getElementById('public-nonstrike-runs').innerText = "0";
            document.getElementById('public-nonstrike-balls').innerText = "0";
            document.getElementById('public-nonstrike-fours').innerText = "0";
            document.getElementById('public-nonstrike-sixes').innerText = "0";

            document.getElementById('public-bowler-name').innerText = "Bowler 1";
            document.getElementById('public-bowler-runs').innerText = "0";
            document.getElementById('public-bowler-wkts').innerText = "0";
            document.getElementById('public-bowler-overs').innerText = "0.0";
            document.getElementById('public-bowler-wickets-icons').innerHTML = '';

            document.getElementById('public-over-balls').innerHTML = '<span class="text-xs text-on-surface-variant italic">Waiting...</span>';
            document.getElementById('public-commentary-list').innerHTML = '<div class="text-on-surface-variant italic text-center py-12">Waiting for delivery logs.</div>';
            return;
        }

        document.getElementById('public-team-names').innerText = activeMatch.teamA + " Innings vs " + activeMatch.teamB;
        document.getElementById('public-toss-display').innerText = activeMatch.tossDetails;
        document.getElementById('public-score-runs').innerText = activeMatch.score;
        document.getElementById('public-score-wickets').innerText = activeMatch.wickets;
        document.getElementById('public-score-total-overs').innerText = activeMatch.oversLimit;
        
        const overs = Math.floor(activeMatch.balls / 6);
        const balls = activeMatch.balls % 6;
        document.getElementById('public-score-overs').innerText = overs + "." + balls;

        const totalOversFraction = activeMatch.balls / 6;
        const crr = totalOversFraction > 0 ? (activeMatch.score / totalOversFraction).toFixed(2) : '0.00';
        document.getElementById('public-score-crr').innerText = crr;
        document.getElementById('public-score-extras').innerText = activeMatch.extras;

        const proj = Math.round(parseFloat(crr) * activeMatch.oversLimit);
        document.getElementById('public-projected-score').innerText = `${proj} (at ${crr} RPO)`;

        if (activeMatch.status === 'COMPLETED') {
            document.getElementById('public-match-status').innerText = "COMPLETED";
            document.getElementById('public-match-status').className = "px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-bold uppercase tracking-wider";
        } else {
            document.getElementById('public-match-status').innerText = "LIVE MATCH";
            document.getElementById('public-match-status').className = "px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold uppercase tracking-wider live-pulse";
        }

        // Batsmen
        document.getElementById('public-strike-name').innerText = activeMatch.striker.name + "*";
        document.getElementById('public-strike-runs').innerText = activeMatch.striker.runs;
        document.getElementById('public-strike-balls').innerText = activeMatch.striker.balls;
        document.getElementById('public-strike-fours').innerText = activeMatch.striker.fours;
        document.getElementById('public-strike-sixes').innerText = activeMatch.striker.sixes;

        document.getElementById('public-nonstrike-name').innerText = activeMatch.nonStriker.name;
        document.getElementById('public-nonstrike-runs').innerText = activeMatch.nonStriker.runs;
        document.getElementById('public-nonstrike-balls').innerText = activeMatch.nonStriker.balls;
        document.getElementById('public-nonstrike-fours').innerText = activeMatch.nonStriker.fours;
        document.getElementById('public-nonstrike-sixes').innerText = activeMatch.nonStriker.sixes;

        // Bowler & Wicket Icons (Image 4)
        document.getElementById('public-bowler-name').innerText = activeMatch.bowler.name;
        document.getElementById('public-bowler-runs').innerText = activeMatch.bowler.runs;
        document.getElementById('public-bowler-wkts').innerText = activeMatch.bowler.wickets;

        const wicIconsPublic = document.getElementById('public-bowler-wickets-icons');
        wicIconsPublic.innerHTML = '';
        for (let w = 0; w < activeMatch.bowler.wickets; w++) {
            wicIconsPublic.innerHTML += '<span class="material-symbols-outlined text-xs" style="font-variation-settings: \'FILL\' 1">sports_cricket</span>';
        }

        const bOvers = Math.floor(activeMatch.bowler.balls / 6);
        const bBalls = activeMatch.bowler.balls % 6;
        document.getElementById('public-bowler-overs').innerText = bOvers + "." + bBalls;

        // Recent deliveries
        const recentList = document.getElementById('public-over-balls');
        recentList.innerHTML = '';
        if (activeMatch.recentBalls.length === 0) {
            recentList.innerHTML = '<span class="text-xs text-on-surface-variant italic">Waiting...</span>';
        } else {
            activeMatch.recentBalls.forEach(ball => {
                const node = document.createElement('span');
                let style = 'bg-white/10 text-white';
                if (ball === '4') style = 'bg-green-500/20 text-green-400 font-bold border border-green-500/30';
                if (ball === '6') style = 'bg-green-500/35 text-green-400 font-black border border-green-400/40';
                if (ball === 'W') style = 'bg-red-500/30 text-red-400 font-bold border border-red-500/30';
                if (ball.includes('Wd') || ball.includes('Nb')) style = 'bg-yellow-500/20 text-yellow-400';
                
                node.className = `px-2.5 py-1 rounded-lg text-xs ${style}`;
                node.innerText = ball;
                recentList.appendChild(node);
            });
        }

        // Commentary list
        const commentaryList = document.getElementById('public-commentary-list');
        commentaryList.innerHTML = '';
        activeMatch.commentary.slice().reverse().forEach(log => {
            const line = document.createElement('div');
            line.className = "py-2 border-b border-white/5 last:border-0";
            if (log.includes('OUT') || log.includes('Wicket') || log.includes('retired')) {
                line.className += " text-red-400 font-bold";
            } else if (log.includes('boundary') || log.includes('FOUR') || log.includes('SIX')) {
                line.className += " text-green-400";
            }
            line.innerText = log;
            commentaryList.appendChild(line);
        });
    }


    // ==================== TOURNAMENT HOST PANEL CONTROLLER ====================
    function renderHostView() {
        document.getElementById('toggle-lock-public').checked = chatSettings.publicLocked;
        document.getElementById('toggle-lock-private').checked = chatSettings.privateLocked;

        const hostLog = document.getElementById('host-tournaments-log');
        hostLog.innerHTML = '';
        
        if (tournaments.length === 0) {
            hostLog.innerHTML = '<div class="text-xs text-on-surface-variant italic text-center py-8">No tournaments hosted.</div>';
        } else {
            tournaments.forEach(t => {
                const card = document.createElement('div');
                card.className = "p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center";
                card.innerHTML = `
                    <div>
                        <div class="text-sm font-bold text-white">${t.name}</div>
                        <div class="text-[10px] text-on-surface-variant">Host Admin: ${t.hostName}</div>
                    </div>
                    <div class="text-right">
                        <span class="text-xs bg-secondary/25 text-secondary px-2.5 py-1 rounded-full font-bold">${t.teams} Teams</span>
                        <div class="text-[9px] text-on-surface-variant mt-1">Start Date: ${t.startDate}</div>
                    </div>
                `;
                hostLog.appendChild(card);
            });
        }

        // Populate tournament schedule selector
        const tourneySelect = document.getElementById('host-match-tourney');
        tourneySelect.innerHTML = '';
        tournaments.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.text = t.name;
            tourneySelect.appendChild(opt);
        });
    }

    document.getElementById('btn-host-create').addEventListener('click', () => {
        const name = document.getElementById('host-tourney-name').value.trim();
        const teams = parseInt(document.getElementById('host-tourney-teams').value) || 8;
        const sDate = document.getElementById('host-tourney-date').value || '2026-06-01';

        let hostName = 'Host Admin';
        if (myProfileId) {
            const myProfile = players.find(p => p.id === myProfileId);
            if (myProfile) hostName = myProfile.name;
        }

        if (!name) {
            alert("Please enter a Tournament Name.");
            return;
        }

        const newTourney = {
            id: 'tourney-' + Date.now(),
            name: name,
            hostName: hostName,
            teams: teams,
            startDate: sDate
        };

        tournaments.push(newTourney);
        document.getElementById('host-tourney-name').value = '';
        
        saveDataToStorage();
        broadcastUpdate();
        renderHostView();
    });

    document.getElementById('btn-host-announce').addEventListener('click', () => {
        const text = document.getElementById('host-announcement-text').value.trim();
        if (!text) {
            alert("Please enter details to broadcast.");
            return;
        }

        let hostName = 'Host Admin';
        if (myProfileId) {
            const myProfile = players.find(p => p.id === myProfileId);
            if (myProfile) hostName = myProfile.name;
        }

        announcements.push(`[${hostName}]: ${text}`);
        document.getElementById('host-announcement-text').value = '';

        saveDataToStorage();
        broadcastUpdate();
        alert("Broadcast posted!");
    });

    document.getElementById('btn-host-schedule').addEventListener('click', () => {
        const tourneyId = document.getElementById('host-match-tourney').value;
        const tourney = tournaments.find(t => t.id === tourneyId);
        const teamA = document.getElementById('host-match-teama').value.trim();
        const teamB = document.getElementById('host-match-teamb').value.trim();
        const mDate = document.getElementById('host-match-date').value || new Date().toISOString().split('T')[0];
        const mTime = document.getElementById('host-match-time').value || '12:00';

        if (!teamA || !teamB) {
            alert("Please enter both Team A and Team B names.");
            return;
        }

        const newMatch = {
            id: 'match-' + Date.now(),
            tournamentId: tourneyId,
            tournamentName: tourney ? tourney.name : 'Monsoon League Cup',
            teamA: teamA,
            teamB: teamB,
            status: 'UPCOMING',
            date: mDate,
            time: mTime,
            scoreA: 0,
            wicketsA: 0,
            oversA: '0.0',
            scoreB: 0,
            wicketsB: 0,
            oversB: '0.0',
            result: 'Match scheduled'
        };

        matches.push(newMatch);
        
        // Clear fields
        document.getElementById('host-match-teama').value = '';
        document.getElementById('host-match-teamb').value = '';
        document.getElementById('host-match-date').value = '';
        document.getElementById('host-match-time').value = '';

        saveDataToStorage();
        broadcastUpdate();
        alert("Match scheduled successfully!");
    });

    document.getElementById('toggle-lock-public').addEventListener('change', (e) => {
        chatSettings.publicLocked = e.target.checked;
        saveDataToStorage();
        broadcastUpdate();
    });

    document.getElementById('toggle-lock-private').addEventListener('change', (e) => {
        chatSettings.privateLocked = e.target.checked;
        saveDataToStorage();
        broadcastUpdate();
    });


    // ==================== PLAYER VIEW & REGISTRATION ENGINE ====================
    function renderPlayerView() {
        const regCard = document.getElementById('player-registration-card');
        const dashContent = document.getElementById('player-dashboard-content');

        if (!myProfileId) {
            regCard.classList.remove('hidden');
            dashContent.classList.add('hidden');
        } else {
            const p = players.find(x => x.id === myProfileId);
            if (!p) {
                myProfileId = null;
                saveDataToStorage();
                regCard.classList.remove('hidden');
                dashContent.classList.add('hidden');
                return;
            }

            regCard.classList.add('hidden');
            dashContent.classList.remove('hidden');

            document.getElementById('dash-player-name').innerText = p.name;
            document.getElementById('dash-player-team').innerText = `Team: ${p.team}`;
            document.getElementById('dash-player-age').innerText = p.age;
            document.getElementById('dash-player-bat').innerText = p.batStyle;
            document.getElementById('dash-player-bowl').innerText = p.bowlStyle;

            document.getElementById('stat-matches').innerText = p.stats.matches;
            document.getElementById('stat-innings').innerText = `${p.stats.innings} innings`;
            document.getElementById('stat-runs').innerText = p.stats.runs;
            document.getElementById('stat-wickets').innerText = p.stats.wickets;
            
            const battingAvg = p.stats.innings > 0 ? (p.stats.runs / p.stats.innings).toFixed(1) : '0.0';
            document.getElementById('stat-avg').innerText = battingAvg;
            
            document.getElementById('stat-sr').innerText = p.stats.sr.toFixed(1);
            document.getElementById('stat-fours').innerText = p.stats.fours;
            document.getElementById('stat-sixes').innerText = p.stats.sixes;

            if (activePlayerSubTab === 'insights') {
                loadPlayerCricInsights();
            } else if (activePlayerSubTab === 'compare') {
                loadPlayerComparisonPanel();
            } else if (activePlayerSubTab === 'faceoff') {
                loadPlayerFaceOffPanel();
            }

            // Live Match Widget for Player
            const liveWidget = document.getElementById('player-live-match-widget');
            if (activeMatch && activeMatch.status === 'LIVE') {
                const isStriker = activeMatch.striker.id === myProfileId;
                const isNonStriker = activeMatch.nonStriker.id === myProfileId;
                const isBowler = activeMatch.bowler.id === myProfileId;

                if (isStriker || isNonStriker || isBowler) {
                    liveWidget.classList.remove('hidden');
                    
                    const batBox = document.getElementById('live-player-batting-stats');
                    const bowlBox = document.getElementById('live-player-bowling-stats');
                    const divider = document.getElementById('live-player-divider');

                    if (isStriker || isNonStriker) {
                        batBox.classList.remove('hidden');
                        bowlBox.classList.add('hidden');
                        if (divider) divider.classList.add('hidden');

                        const batData = isStriker ? activeMatch.striker : activeMatch.nonStriker;
                        document.getElementById('live-player-runs').innerText = batData.runs;
                        document.getElementById('live-player-balls').innerText = batData.balls;
                        document.getElementById('live-player-fours').innerText = batData.fours;
                        document.getElementById('live-player-sixes').innerText = batData.sixes;
                    } else if (isBowler) {
                        batBox.classList.add('hidden');
                        bowlBox.classList.remove('hidden');
                        if (divider) divider.classList.add('hidden');

                        const bowlData = activeMatch.bowler;
                        document.getElementById('live-player-wkts').innerText = bowlData.wickets;
                        document.getElementById('live-player-bowled-runs').innerText = bowlData.runs;
                        
                        const overs = Math.floor(bowlData.balls / 6);
                        const balls = bowlData.balls % 6;
                        document.getElementById('live-player-overs-count').innerText = `${overs}.${balls}`;
                    }
                } else {
                    liveWidget.classList.add('hidden');
                }
            } else {
                liveWidget.classList.add('hidden');
            }

            // Display latest announcement
            const announceBox = document.getElementById('player-announcement-box');
            if (announceBox) {
                if (announcements.length > 0) {
                    announceBox.innerText = announcements[announcements.length - 1];
                } else {
                    announceBox.innerText = "No announcements posted yet.";
                }
            }

            // Render communities chat messages
            renderChatMessages();
        }
    }

    // Player Portal Event Listeners
    document.getElementById('btn-submit-registration').addEventListener('click', () => {
        const name = document.getElementById('reg-player-name').value.trim();
        const age = parseInt(document.getElementById('reg-player-age').value) || 25;
        const batStyle = document.getElementById('reg-player-batting').value;
        const bowlStyle = document.getElementById('reg-player-bowling').value;
        const teamName = document.getElementById('reg-player-team').value.trim() || 'Mumbai Warriors';

        if (!name) {
            alert('Please enter your full name to register.');
            return;
        }

        const newId = 'p-' + Date.now();
        const newPlayer = {
            id: newId,
            name: name,
            age: age,
            team: teamName,
            batStyle: batStyle,
            bowlStyle: bowlStyle,
            stats: {
                matches: 0,
                innings: 0,
                runs: 0,
                wickets: 0,
                avg: 0.0,
                sr: 0.0,
                fours: 0,
                sixes: 0
            },
            inningsHistory: []
        };

        players.push(newPlayer);
        myProfileId = newId;

        saveDataToStorage();
        broadcastUpdate();
        renderPlayerView();
        alert('Player Profile Registered Successfully!');
    });

    document.getElementById('btn-reset-profile').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your profile? This will delete your local profile.')) {
            if (myProfileId && !['p-rohit', 'p-virat', 'p-bumrah', 'p-hardik'].includes(myProfileId)) {
                players = players.filter(p => p.id !== myProfileId);
            }
            myProfileId = null;
            saveDataToStorage();
            broadcastUpdate();
            renderPlayerView();
        }
    });

    // Switch to Public Chat Room
    document.getElementById('btn-chat-public').addEventListener('click', () => {
        currentChatRoom = 'public';
        document.getElementById('btn-chat-public').className = "px-3 py-1 text-xs font-bold rounded-lg bg-secondary text-on-secondary-fixed transition-all";
        document.getElementById('btn-chat-private').className = "px-3 py-1 text-xs font-bold rounded-lg text-on-surface-variant hover:text-white transition-all";
        renderChatMessages();
    });

    // Switch to Private Chat Room
    document.getElementById('btn-chat-private').addEventListener('click', () => {
        currentChatRoom = 'private';
        document.getElementById('btn-chat-private').className = "px-3 py-1 text-xs font-bold rounded-lg bg-secondary text-on-secondary-fixed transition-all";
        document.getElementById('btn-chat-public').className = "px-3 py-1 text-xs font-bold rounded-lg text-on-surface-variant hover:text-white transition-all";
        renderChatMessages();
    });

    // Send Chat Button Listener
    document.getElementById('btn-send-chat').addEventListener('click', () => {
        sendChatMessage();
    });

    // Send Chat via Enter Key
    document.getElementById('chat-message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });

    // Umpire Manual Swap Strike Click Listener
    document.getElementById('btn-swap-striker').addEventListener('click', () => {
        if (!activeMatch || activeMatch.status !== 'LIVE') return;
        saveMatchStateToHistory();
        swapBatsmenStrike();
        activeMatch.commentary.push(`Umpire manually swapped strike. ${activeMatch.striker.name} is now on strike.`);
        saveDataToStorage();
        broadcastUpdate();
        updateUmpireScoreboard();
    });

    // Umpire Undo Ball click listener
    document.getElementById('btn-undo-ball').addEventListener('click', () => {
        if (!activeMatch || activeMatch.status !== 'LIVE') return;
        if (matchHistoryStack.length === 0) {
            alert("No actions to undo!");
            return;
        }
        const snapshot = matchHistoryStack.pop();
        activeMatch = snapshot.activeMatch;
        players = snapshot.players;
        completedMatches = snapshot.completedMatches;
        
        saveDataToStorage();
        broadcastUpdate();
        updateUmpireScoreboard();
    });

    // Next Over click listener
    document.getElementById('btn-start-next-over').addEventListener('click', () => {
        const nextId = document.getElementById('umpire-next-bowler-select').value;
        const nextBowler = players.find(p => p.id === nextId);

        if (!nextBowler) {
            alert("Please select the next bowler.");
            return;
        }

        saveMatchStateToHistory();

        // Commit bowler overs stats
        commitIndividualStats(activeMatch.bowler.id, 0, 0, 0, 0, activeMatch.bowler.balls, activeMatch.bowler.runs, activeMatch.bowler.wickets, 0);

        activeMatch.bowler = { id: nextBowler.id, name: nextBowler.name, runs: 0, wickets: 0, balls: 0 };
        swapBatsmenStrike();
        activeMatch.recentBalls = [];
        document.getElementById('umpire-over-helper').classList.add('hidden');

        activeMatch.commentary.push(`New over started. ${nextBowler.name} comes to bowl.`);
        
        saveDataToStorage();
        broadcastUpdate();
        updateUmpireScoreboard();
    });

    // Wicket Modal Trigger and Cancel Bindings
    document.getElementById('btn-umpire-wicket').addEventListener('click', () => {
        if (!activeMatch || activeMatch.status !== 'LIVE') return;
        
        const helper = document.getElementById('umpire-wicket-helper');
        helper.classList.remove('hidden');

        const incomingSelect = document.getElementById('umpire-incoming-batsman-select');
        incomingSelect.innerHTML = '';
        
        const available = players.filter(p => !activeMatch.currentBatsmen.includes(p.id));
        available.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.text = `${p.name} (${p.team})`;
            incomingSelect.appendChild(opt);
        });

        // Autocomplete search suggestion for incoming batsman
        const searchInput = document.getElementById('umpire-incoming-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.oninput = () => {
                const query = searchInput.value.toLowerCase();
                incomingSelect.innerHTML = '';
                available.forEach(p => {
                    if (p.name.toLowerCase().includes(query) || p.team.toLowerCase().includes(query)) {
                        const opt = document.createElement('option');
                        opt.value = p.id;
                        opt.text = `${p.name} (${p.team})`;
                        incomingSelect.appendChild(opt);
                    }
                });
            };
        }
    });

    document.getElementById('btn-cancel-wicket').addEventListener('click', () => {
        document.getElementById('umpire-wicket-helper').classList.add('hidden');
    });



    // System Reset Event Listener
    document.getElementById('btn-system-reset').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all system data to zero? This will delete all user registrations, completed matches, recruitment posts, and reset default player statistics to zero.")) {
            players = [
                { id: 'p-rohit', name: 'Rohit Sharma', age: 37, team: 'India', batStyle: 'Right-Handed', bowlStyle: 'Right-arm Offbreak', stats: { matches: 0, innings: 0, runs: 0, wickets: 0, avg: 0.0, sr: 0.0, fours: 0, sixes: 0 }, inningsHistory: [] },
                { id: 'p-virat', name: 'Virat Kohli', age: 35, team: 'India', batStyle: 'Right-Handed', bowlStyle: 'None', stats: { matches: 0, innings: 0, runs: 0, wickets: 0, avg: 0.0, sr: 0.0, fours: 0, sixes: 0 }, inningsHistory: [] },
                { id: 'p-bumrah', name: 'Jasprit Bumrah', age: 30, team: 'India', batStyle: 'Right-Handed', bowlStyle: 'Right-arm Fast', stats: { matches: 0, innings: 0, runs: 0, wickets: 0, avg: 0.0, sr: 0.0, fours: 0, sixes: 0 }, inningsHistory: [] },
                { id: 'p-hardik', name: 'Hardik Pandya', age: 30, team: 'India', batStyle: 'Right-Handed', bowlStyle: 'Right-arm Fast', stats: { matches: 0, innings: 0, runs: 0, wickets: 0, avg: 0.0, sr: 0.0, fours: 0, sixes: 0 }, inningsHistory: [] }
            ];
            
            myProfileId = null;
            activeMatch = { status: 'SETUP' };
            tournaments = [];
            announcements = [];
            chats = [];
            chatSettings = { publicLocked: false, privateLocked: false };
            completedMatches = [];
            recruitmentPosts = [];
            matches = [];
            h2h = {};

            saveDataToStorage();
            broadcastUpdate();
            renderActiveView();
            alert("All application data has been reset to zero. Start fresh!");
        }
    });


    // ==================== INITIALIZATION BOOT ====================
    loadDataFromStorage();
    
    // Bind all dynamic sub-tabs inside player view initialization
    switchPlayerSubTab('lifetime');
    switchBentoTab('tourneys');
    switchTournamentSubTab('list');

    const initHash = location.hash ? location.hash.replace('#', '') : '';
    if (views[initHash]) {
        switchView(initHash);
    } else {
        switchView('landing');
    }

});
