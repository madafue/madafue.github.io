document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('earthbound-bg');
    if (!container) return;

    // Create and inject the canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Lock it to the background
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-999';
    canvas.style.pointerEvents = 'none';
    canvas.style.imageRendering = 'pixelated'; // Keeps it sharp and 8-bit

    // ==========================================
    // TUNE YOUR GRID HERE
    // ==========================================
    const config = {
        scale: 2,          // Pixel chunkiness 
        speed: 0.0005,      // Slightly faster to compensate for the new curve
        zScale: 200,       // Overall depth multiplier
        horizonOffset: 12, // Prevents glitching at the exact center pixel
        falloff: 0.75,     // NEW: 1.0 is a sharp dropoff. Lower numbers (0.5 - 0.8) spread the curve out.
        colWidth: 16,      // Width of the columns
        colorA: '#0d0d0d', // Deep black
        colorB: '#1a1a1a'  // Dark gray
    };

    let width, height;

    function resize() {
        width = Math.ceil(window.innerWidth / config.scale);
        height = Math.ceil(window.innerHeight / config.scale);
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // ==========================================
    // THE PERSPECTIVE RENDER LOOP
    // ==========================================
    function animate(timestamp) {
        const time = timestamp * config.speed;
        const cy = Math.floor(height / 2);

        for (let y = 0; y < height; y++) {
            let dy = y - cy;
            
            if (dy === 0) {
                ctx.fillStyle = config.colorA;
                ctx.fillRect(0, y, width, 1);
                continue;
            }

            // MAGIC MATH FIX 2.0: 
            // By applying a power (falloff) to the distance, we change the shape of the 3D curve.
            // A falloff < 1 makes the transition from "squished" to "flat" much more gradual.
            let depth = config.zScale / Math.pow((Math.abs(dy) + config.horizonOffset), config.falloff);
            
            // Pushing the pattern OUTWARDS
            let textureY = depth + time;

            // Determine row parity
            let rowParity = Math.floor(textureY) % 2;
            if (rowParity < 0) rowParity += 2; 

            // Fill the entire row with Color B first
            ctx.fillStyle = config.colorB;
            ctx.fillRect(0, y, width, 1);

            // Draw the blocks of Color A over top
            ctx.fillStyle = config.colorA;
            
            let startX = rowParity === 0 ? 0 : config.colWidth;
            
            for (let x = startX; x < width; x += config.colWidth * 2) {
                ctx.fillRect(x, y, config.colWidth, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    requestAnimationFrame(animate);
});