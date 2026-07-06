document.addEventListener('DOMContentLoaded', () => {
    
    const RA_USER = "madafue";
    const RA_KEY = "TJxfOxwT4uX2kCCaJ9LAPzYJz3t3HQxI";
    
    // Update this occasionally for accurate Top %
    const ESTIMATED_TOTAL_USERS = 151820; 

    // ---DATA STORAGE ---
    let allMasteries = [];

    // --- DOM ELEMENTS ---
    const dom = {
        username: document.getElementById('ra-username'),
        points: document.getElementById('ra-points'),
        rank: document.getElementById('ra-rank'),
        masteryCount: document.getElementById('ra-mastery-count'),
        avatar: document.getElementById('ra-avatar'),
        lastGame: document.getElementById('ra-last-game'),
        lastGameTitle: document.getElementById('ra-last-game-title'),
        statusContainer: document.getElementById('ra-status-container'),
        grid: document.getElementById('ra-game-grid'),
        beatenGrid: document.getElementById('ra-beaten-grid'), // NEW HOOK
        awardsGrid: document.getElementById('ra-awards-grid'), 
        sortSelect: document.getElementById('sort-select')
    };

    async function fetchData(endpoint, params = {}) {
        const urlParams = new URLSearchParams({
            z: RA_USER, y: RA_KEY, ...params
        });
        const url = `https://retroachievements.org/API/${endpoint}.php?${urlParams.toString()}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("RA Fetch Error:", error);
            return null;
        }
    }

    async function loadProfile() {
        const data = await fetchData('API_GetUserSummary', { u: RA_USER });
        if (!data) {
            dom.username.textContent = "Error loading data.";
            return;
        }
        dom.username.textContent = data.User;
        
        // Stacked Points Display
        const standardPoints = parseInt(data.TotalPoints).toLocaleString();
        const retroPoints = parseInt(data.TotalTruePoints).toLocaleString();
        dom.points.innerHTML = `${standardPoints} <span style="display: block; font-size: 0.5em; margin-top: 0.4rem; color: var(--color-accent);">${retroPoints} RP</span>`;
        
        // Rank and Top %
        const userRank = parseInt(data.Rank);
        const topPercent = ((userRank / ESTIMATED_TOTAL_USERS) * 100).toFixed(2);
        dom.rank.innerHTML = `#${userRank.toLocaleString()} <span style="font-size: 0.5em; color: #aaa; display: block; margin-top: 0.2rem;">of ~${ESTIMATED_TOTAL_USERS.toLocaleString()} (Top ${topPercent}%)</span>`;
        
        dom.avatar.src = `https://media.retroachievements.org${data.UserPic}`;
        
        // Status Box Injection
        if (data.LastGameID) {
            const statusText = data.RichPresenceMsg ? data.RichPresenceMsg : "Active";
            dom.lastGame.textContent = statusText;
            dom.statusContainer.style.display = 'block'; 
        } 
    }

    // NEW: Fetches the Title and Console Name of your most recent game
    async function loadRecentGame() {
        const recentGames = await fetchData('API_GetUserRecentlyPlayedGames', { u: RA_USER, c: 1 });
        
        if (recentGames && recentGames.length > 0 && dom.lastGameTitle) {
            const game = recentGames[0];
            // Injects the Title and the Console Name in gray text next to it
            dom.lastGameTitle.innerHTML = `${game.Title} <span style="color: #aaa; font-size: 0.8em; margin-left: 4px;">[${game.ConsoleName}]</span>`;
        } else if (dom.lastGameTitle) {
            dom.lastGameTitle.textContent = "Unknown Game";
        }
    }

    async function loadMasteries() {
        const data = await fetchData('API_GetUserCompletedGames', { u: RA_USER });
        if (!data || !Array.isArray(data)) return;

        const seenGames = new Set();
        
        // Add "index" here to track the original array order
        allMasteries = data.filter(game => {
            if (parseFloat(game.PctWon) < 1.0) return false;
            if (seenGames.has(game.GameID)) return false;
            seenGames.add(game.GameID);
            return true;
        }).map((game, index) => {
            return {
                id: game.GameID,
                title: game.Title,
                date: '0', 
                icon: game.GameIcon || game.ImageIcon,
                hardcore: game.HardcoreMode == '1',
                wallOrder: index // Save your RA Profile arrangement!
            };
        });

        dom.masteryCount.textContent = allMasteries.length;
    }

    // REWRITTEN: Filters badges by their AwardType
    async function loadAwards() {
        if (!dom.awardsGrid || !dom.beatenGrid) return;
        
        const data = await fetchData('API_GetUserAwards', { u: RA_USER });
        let awardsList = data?.VisibleUserAwards || [];
        
        const masteredGameIDs = new Set(allMasteries.map(m => m.id));

        // ======== THE FIX: INJECT DATES INTO MASTERIES ========
        allMasteries.forEach(mastery => {
            // Find the award badge that matches this Game ID
            const masteryBadge = awardsList.find(a => 
                a.AwardData == mastery.id && 
                a.AwardType && 
                (a.AwardType.includes('Mastery') || a.AwardType.includes('Completion') || a.AwardType.includes('Beaten'))
            );
            if (masteryBadge && masteryBadge.AwardedAt) {
                mastery.date = masteryBadge.AwardedAt; // e.g. "2024-11-04 15:30:00"
            }
        });

        // NOW we trigger the sort and render the masteries grid!
        handleSort();
        // ======================================================

        const eventAwards = awardsList.filter(a => a.AwardType && a.AwardType.includes('Event'));
        
        const beatenAwards = awardsList.filter(a => {
            const isBeaten = a.AwardType && a.AwardType.includes('Beaten');
            const isNotMastered = !masteredGameIDs.has(a.AwardData);
            return isBeaten && isNotMastered;
        });

        // 1. Render Event Awards
        dom.awardsGrid.innerHTML = '';
        if (eventAwards.length === 0) {
            dom.awardsGrid.innerHTML = '<p style="color: #aaa; font-family: var(--font-body);">No event awards found.</p>';
        } else {
            eventAwards.forEach(award => {
                const div = document.createElement('div');
                div.className = 'game-item'; 
                const img = document.createElement('img');
                img.src = `https://media.retroachievements.org${award.ImageIcon}`;
                img.alt = award.Title || 'Event Award';
                img.title = `${award.Title}\nType: ${award.AwardType}`;
                div.appendChild(img);
                dom.awardsGrid.appendChild(div);
            });
        }

        // 2. Render Beaten Games
        dom.beatenGrid.innerHTML = '';
        if (beatenAwards.length === 0) {
            dom.beatenGrid.innerHTML = '<p style="color: #aaa; font-family: var(--font-body);">No beaten games found.</p>';
        } else {
            beatenAwards.forEach(award => {
                const div = document.createElement('div');
                div.className = 'game-item'; 
                const img = document.createElement('img');
                img.src = `https://media.retroachievements.org${award.ImageIcon}`;
                img.alt = award.Title || 'Beaten Game';
                img.title = `${award.Title}\nType: ${award.AwardType}`;
                div.appendChild(img);
                dom.beatenGrid.appendChild(div);
            });
        }
    }

    function renderGrid(gamesList) {
        dom.grid.innerHTML = '';

        gamesList.forEach(game => {
            const link = document.createElement('a');
            link.href = `https://retroachievements.org/game/${game.id}`;
            link.target = "_blank";
            link.className = 'game-item';
            
            const img = document.createElement('img');
            img.src = `https://media.retroachievements.org${game.icon}`;
            img.alt = game.title;
            
            let dateStr = "Unknown Date";
            if (game.date !== '0') {
                // FIXED: Removed the .replace() hack so ISO dates parse properly!
                const dateObj = new Date(game.date); 
                if (!isNaN(dateObj)) dateStr = dateObj.toLocaleDateString();
            }
            
            const mode = game.hardcore ? ' (Hardcore)' : '';
            img.title = `${game.title}${mode}\nMastered: ${dateStr}`; 
            
            link.appendChild(img);
            dom.grid.appendChild(link);
        });
    }

    function handleSort() {
        const sortType = dom.sortSelect.value;
        let sortedGames = [...allMasteries];

        if (sortType === 'default') {
            sortedGames.sort((a, b) => b.date.localeCompare(a.date));
        } 
        else if (sortType === 'oldest') {
            sortedGames.sort((a, b) => a.date.localeCompare(b.date));
        } 
        else if (sortType === 'alpha') {
            sortedGames.sort((a, b) => a.title.localeCompare(b.title));
        }
        else if (sortType === 'priority') {
            // Define your custom arrangement here!
            // The script will place these at the top in this exact sequence.
            const priorities = [
                'Super Mario 64',
                'Super Mario Sunshine',
                'Super Mario Galaxy',
                'Mike Tyson\'s Punch-Out!!',
                'Doc Louis\'s Punch-Out!!',
                'Pokémon Yellow Version: Special Pikachu Edition',
                'Pokémon Rumble',
                'Pokémon Rumble [Subset: Professor Oak Challenge]',
                'Pajama Sam: Don\'t Fear the Dark',
                'Rick Astley: The Game',
                'Golden Balls',
                'Who Wants to Be a Millionaire',
                'Who Wants to Be a Millionaire: 1st Edition',
                'Who Wants to Be a Millionaire: Junior',
                'Flappy Bird',
                'Flapee Bird',
                'Flappy',
                'Private Idol Disc Vol. 1: Kinoshita Yuu',
                'Private Idol Disc Vol. 2: Uchiyama Miki',
                'Private Idol Disc Vol. 3: Oshima Akemi',
                'Shaq-Fu',
                'The Preservation Project',
                'NES Control Deck Test Cartridge',
                'Mario Kart XXL',
                'Fruit Ninja',
                'Persona 4',
                'Persona 5 Pocket Edition',
                'Ping-Pong Diplomacy Advance',
                'Wordle',
                'A 20 Second Platformer',
                'Big Burger',
                'Retro Quiz Tower: JAM Edition',
                'Claw Express',
                'Bubble Wrap DS',
                'Microsoft Windows 98',
                'MilioNESy',
                'Venetian Blinds',
                'Petals Around the Rose',
                'Rex Run',
                'Racer',
                'Arduboy Says',
                'Hangman',
                'Undertale Gameboy Demake',
                'Holidate',
                'Stonk Simulator',
                'The Social Distance Game',
                'There\'s Nothing to Do in This Town',
                'Cookie Clicker',
                'Office Combat',
                '2048',
                '2048',
                'Tiny 2048',
                'Air Hockey',
                'Katamari!',
                'Planetarian: Chiisa na Hoshi no Yume',
                'Pachinko Sexy Reaction',
                'Lights!',
                'Totally Not Sumo',
                'Snake',
                'Wooloo\'s Run Away',
                'gjpg',
                'Pongemon',
                'Pac-It',
                'P-Type',
                'Deep Forest',
                'Z.A.P.',
                'Retro Quiz Tower: JAM Edition',
                'Hamburger in Space!',
                'WLOKU',
                'Sokoban',
                'The Haunted Zone',
                'Sonic Arena',
                'Raster',
                'Snakes and Ladders',
                'Tetris26',
                'Five Nights at Freddy\'s',
                'Zoop Zoop Bee Adventures 7',
                'It\'s Corn!',
                '137E0 Action 1 Steak',
                'Fisher-Price: Perfect Fit',
                'CrazyBus',
                'Reels of Fortune',
                'Solitaire',
                'Touhou',
                'Dora the Explorer: Dora Saves the Mermaids',
                'Thomas & Friends: Hero of the Rails',
                'Learning with the PooYoos: Episode 1',
                'Learning with the PooYoos: Episode 2',
                'Learning with the PooYoos: Episode 3',


            ];
            
            sortedGames.sort((a, b) => {
                // Check if either game matches a keyword in your priorities list
                const aIndex = priorities.findIndex(p => a.title.includes(p));
                const bIndex = priorities.findIndex(p => b.title.includes(p));

                const aIsFavorite = aIndex !== -1;
                const bIsFavorite = bIndex !== -1;

                // 1. If A is a favorite and B is not, A goes first
                if (aIsFavorite && !bIsFavorite) return -1; 
                
                // 2. If B is a favorite and A is not, B goes first
                if (!aIsFavorite && bIsFavorite) return 1;  
                
                // 3. If BOTH are favorites, sort them by their position in your priorities array
                if (aIsFavorite && bIsFavorite) {
                    if (aIndex !== bIndex) return aIndex - bIndex;
                }

                // 4. If neither are favorites (or they match the same series), sort alphabetically
                return a.title.localeCompare(b.title); 
            });
        }

        renderGrid(sortedGames);
    }

    if (dom.sortSelect) {
        dom.sortSelect.addEventListener('change', handleSort);
    }

    // Fire the independent API calls
    loadProfile();
    loadRecentGame(); 

    // AWAIT the masteries FIRST, so the awards filter has the data it needs!
    async function initGamesAndAwards() {
        await loadMasteries();
        await loadAwards();
    }
    
    initGamesAndAwards();

});