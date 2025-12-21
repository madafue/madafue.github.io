document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURATION ---
    const RA_USER = "madafue";
    const RA_KEY = "TJxfOxwT4uX2kCCaJ9LAPzYJz3t3HQxI";
    
    // --- GLOBAL DATA STORAGE ---
    let allMasteries = []; // This will hold our clean list of games

    // --- DOM ELEMENTS ---
    const dom = {
        username: document.getElementById('ra-username'),
        points: document.getElementById('ra-points'),
        rank: document.getElementById('ra-rank'),
        masteryCount: document.getElementById('ra-mastery-count'),
        avatar: document.getElementById('ra-avatar'),
        lastGame: document.getElementById('ra-last-game'),
        grid: document.getElementById('ra-game-grid'),
        sortSelect: document.getElementById('sort-select') // The new dropdown
    };

    // --- HELPER: FETCH DATA ---
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

    // --- 1. LOAD USER PROFILE ---
    async function loadProfile() {
        const data = await fetchData('API_GetUserSummary', { u: RA_USER });
        if (!data) {
            dom.username.textContent = "Error loading data.";
            return;
        }
        dom.username.textContent = data.User;
        dom.points.textContent = parseInt(data.TotalPoints).toLocaleString();
        dom.rank.textContent = "#" + data.Rank;
        dom.avatar.src = `https://media.retroachievements.org${data.UserPic}`;
        if (data.LastGameID) dom.lastGame.textContent = "Active"; 
    }

    // --- 2. LOAD MASTERIES (Data Logic) ---
    async function loadMasteries() {
        const data = await fetchData('API_GetUserCompletedGames', { u: RA_USER });
        if (!data || !Array.isArray(data)) return;

        const seenGames = new Set();
        
        // Filter and process data into our global array
        allMasteries = data.filter(game => {
            if (parseFloat(game.PctWon) < 1.0) return false;
            if (seenGames.has(game.GameID)) return false;
            seenGames.add(game.GameID);
            return true;
        }).map(game => {
            // Clean up the object for easier use later
            return {
                id: game.GameID,
                title: game.Title,
                // Prefer Hardcore date, fallback to standard, fallback to '0'
                date: game.HardcoreAchieved || game.Awarded || '0', 
                icon: game.GameIcon || game.ImageIcon,
                hardcore: game.HardcoreMode == '1'
            };
        });

        dom.masteryCount.textContent = allMasteries.length;

        // Initial Render (Default Sort)
        renderGrid(allMasteries);
    }

    // --- 3. RENDER GRID (Display Logic) ---
    function renderGrid(gamesList) {
        dom.grid.innerHTML = ''; // Clear current grid

        gamesList.forEach(game => {
            const link = document.createElement('a');
            link.href = `https://retroachievements.org/game/${game.id}`;
            link.target = "_blank";
            link.className = 'game-item';
            
            const img = document.createElement('img');
            img.src = `https://media.retroachievements.org${game.icon}`;
            img.alt = game.title;
            
            // Format date nicely
            const dateObj = new Date(game.date);
            const dateStr = dateObj.toLocaleDateString();
            const mode = game.hardcore ? ' (Hardcore)' : '';
            
            img.title = `${game.title}${mode}\nMastered: ${dateStr}`; 
            
            link.appendChild(img);
            dom.grid.appendChild(link);
        });
    }

    // --- 4. SORTING LOGIC ---
    function handleSort() {
        const sortType = dom.sortSelect.value;
        
        // Create a COPY of the array so we don't mess up the original order
        let sortedGames = [...allMasteries];

        if (sortType === 'default') {
            // API usually sends most recent first, but let's ensure it by Date Descending
            sortedGames.sort((a, b) => new Date(b.date) - new Date(a.date));
        } 
        else if (sortType === 'oldest') {
            // Date Ascending
            sortedGames.sort((a, b) => new Date(a.date) - new Date(b.date));
        } 
        else if (sortType === 'alpha') {
            // Alphabetical (Good for grouping Series!)
            sortedGames.sort((a, b) => a.title.localeCompare(b.title));
        }
        else if (sortType === 'priority') {
            // Custom Priority Logic
            const priorities = ['Mario', 'Zelda', 'Metroid']; // Add your favorites here
            
            sortedGames.sort((a, b) => {
                // Check if titles contain priority keywords
                const aPriority = priorities.some(p => a.title.includes(p));
                const bPriority = priorities.some(p => b.title.includes(p));

                if (aPriority && !bPriority) return -1; // a comes first
                if (!aPriority && bPriority) return 1;  // b comes first
                return a.title.localeCompare(b.title);  // otherwise sort alpha
            });
        }

        renderGrid(sortedGames);
    }

    // --- START & EVENT LISTENERS ---
    if (dom.sortSelect) {
        dom.sortSelect.addEventListener('change', handleSort);
    }

    loadProfile();
    loadMasteries();

});