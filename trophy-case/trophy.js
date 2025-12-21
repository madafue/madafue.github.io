document.addEventListener('DOMContentLoaded', () => {
    
    const RA_USER = "madafue";
    const RA_KEY = "TJxfOxwT4uX2kCCaJ9LAPzYJz3t3HQxI";
    
    // ---DATA STORAGE ---
    let allMasteries = []; //list of games

    // --- DOM ELEMENTS ---
    const dom = {
        username: document.getElementById('ra-username'),
        points: document.getElementById('ra-points'),
        rank: document.getElementById('ra-rank'),
        masteryCount: document.getElementById('ra-mastery-count'),
        avatar: document.getElementById('ra-avatar'),
        lastGame: document.getElementById('ra-last-game'),
        grid: document.getElementById('ra-game-grid'),
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
        dom.points.textContent = parseInt(data.TotalPoints).toLocaleString();
        dom.rank.textContent = "#" + data.Rank;
        dom.avatar.src = `https://media.retroachievements.org${data.UserPic}`;
        if (data.LastGameID) dom.lastGame.textContent = "Active"; 
    }

    async function loadMasteries() {
        const data = await fetchData('API_GetUserCompletedGames', { u: RA_USER });
        if (!data || !Array.isArray(data)) return;

        const seenGames = new Set();
        
        allMasteries = data.filter(game => {
            if (parseFloat(game.PctWon) < 1.0) return false;
            if (seenGames.has(game.GameID)) return false;
            seenGames.add(game.GameID);
            return true;
        }).map(game => {
   
            return {
                id: game.GameID,
                title: game.Title,
                date: game.HardcoreAchieved || game.Awarded || '0', 
                icon: game.GameIcon || game.ImageIcon,
                hardcore: game.HardcoreMode == '1'
            };
        });

        dom.masteryCount.textContent = allMasteries.length;

        renderGrid(allMasteries);
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
            
            const dateObj = new Date(game.date);
            const dateStr = dateObj.toLocaleDateString();
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
            sortedGames.sort((a, b) => new Date(b.date) - new Date(a.date));
        } 
        else if (sortType === 'oldest') {
            sortedGames.sort((a, b) => new Date(a.date) - new Date(b.date));
        } 
        else if (sortType === 'alpha') {
            sortedGames.sort((a, b) => a.title.localeCompare(b.title));
        }
        else if (sortType === 'priority') {
            const priorities = ['Mario', 'Zelda', 'Metroid'];
            
            sortedGames.sort((a, b) => {
                const aPriority = priorities.some(p => a.title.includes(p));
                const bPriority = priorities.some(p => b.title.includes(p));

                if (aPriority && !bPriority) return -1; 
                if (!aPriority && bPriority) return 1;  
                return a.title.localeCompare(b.title); 
            });
        }

        renderGrid(sortedGames);
    }

    if (dom.sortSelect) {
        dom.sortSelect.addEventListener('change', handleSort);
    }

    loadProfile();
    loadMasteries();

});