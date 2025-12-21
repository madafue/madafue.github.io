let tspTimeout;

window.startTSP = function() {
    const canvas = document.getElementById('tsp-canvas');
    if (!canvas) return;
    if (canvas.offsetWidth === 0) return;

    const ctx = canvas.getContext('2d');

    const cityCount = 30;
    const connectSpeed = 100; 
    const resetDelay = 2000;  
    const cityColor = '#fff';
    const pathColor = '#00ff7f';

    let cities = [];
    let visited = [];
    let currentCityIndex = 0;
    let width, height;

    // Helper to stop any running loop
    function stop() {
        clearTimeout(tspTimeout);
    }

    function resize() {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', () => {
        resize();
        reset();
    });
    
    resize();

    function initCities() {
        cities = [];
        const padding = 20; 
        for (let i = 0; i < cityCount; i++) {
            cities.push({
                x: padding + Math.random() * (width - padding * 2),
                y: padding + Math.random() * (height - padding * 2),
                visited: false,
                id: i
            });
        }
    }

    function findNearest(fromIndex) {
        let nearestIndex = -1;
        let minDist = Infinity;
        for (let i = 0; i < cities.length; i++) {
            if (i === fromIndex || cities[i].visited) continue;
            const dx = cities[i].x - cities[fromIndex].x;
            const dy = cities[i].y - cities[fromIndex].y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < minDist) {
                minDist = dist;
                nearestIndex = i;
            }
        }
        return nearestIndex;
    }

    function draw() {
        // 1. Clear screen (Keep black for retro feel)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        // 2. Draw Paths (The Odyssey's Flight Path)
        if (visited.length > 1) {
            ctx.beginPath();
            // Change color to a "Mario Red" or keep your "Terminal Green"
            // ctx.strokeStyle = '#E60012'; // Mario Red
            ctx.strokeStyle = '#00ff7f'; // Your Retro Green (Recommended for consistency)
            ctx.lineWidth = 2;
            
            const start = cities[visited[0]];
            ctx.moveTo(start.x, start.y);
            
            for (let i = 1; i < visited.length; i++) {
                const city = cities[visited[i]];
                ctx.lineTo(city.x, city.y);
            }
            ctx.stroke();
        }

        // 3. Draw Cities (The Power Moons)
        for (let i = 0; i < cities.length; i++) {
            const city = cities[i];
            
            // Logic: Visited moons turn dull, unvisited are bright Gold
            const moonColor = city.visited ? '#555' : '#FFD700'; // Gold
            const moonSize = 3; // Slightly bigger than before

            ctx.beginPath();
            ctx.fillStyle = moonColor;
            
            // Draw the Moon (Circle)
            ctx.arc(city.x, city.y, moonSize, 0, Math.PI * 2);
            ctx.fill();

            // Optional: Add a little shine/border to make it pop
            if (!city.visited) {
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    function step() {
        cities[currentCityIndex].visited = true;
        visited.push(currentCityIndex);
        draw();

        const nextIndex = findNearest(currentCityIndex);

        if (nextIndex !== -1) {
            currentCityIndex = nextIndex;
            tspTimeout = setTimeout(step, connectSpeed);
        } else {
            // Close the loop visually
            ctx.beginPath();
            ctx.strokeStyle = pathColor;
            ctx.moveTo(cities[currentCityIndex].x, cities[currentCityIndex].y);
            ctx.lineTo(cities[visited[0]].x, cities[visited[0]].y);
            ctx.stroke();
            
            tspTimeout = setTimeout(reset, resetDelay);
        }
    }

    function reset() {
        // --- THE FIX IS HERE ---
        stop(); // Kill any existing "salesmen" before creating a new one!
        // -----------------------
        
        initCities();
        visited = [];
        currentCityIndex = Math.floor(Math.random() * cities.length);
        step();
    }

    reset();
};

document.addEventListener('DOMContentLoaded', () => {
    window.startTSP();
});