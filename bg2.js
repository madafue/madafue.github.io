document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('earthbound-bg');
    if (!container) return;

    // Create and inject the canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-999';
    canvas.style.pointerEvents = 'none';

    let width, height, centerY;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        centerY = height / 2;
    }
    window.addEventListener('resize', resize);
    resize();

    // ==========================================
    // TUNE YOUR VECTOR GRID HERE
    // ==========================================
    const config = {
        numLines: 28,        // Total number of lines on screen at once
        speed: 150,          // Z-units traveled per second
        minZ: 10,            // How close to the camera a line gets before respawning
        maxZ: 1500,          // The horizon line (spawn distance)
        focalLength: 10,    // Camera lens width (controls how fast they fly off-screen)
        baseThickness: 1.5,  // Line thickness multiplier
        baseColor: '180, 180, 180' // RGB gray for the lines
    };

    // Initialize our discrete line objects
    let lines = [];
    const zStep = (config.maxZ - config.minZ) / config.numLines;
    for (let i = 0; i < config.numLines; i++) {
        // Space them evenly in 3D space to start
        lines.push({ z: config.minZ + i * zStep });
    }

    let lastTime = 0;

    // ==========================================
    // THE 3D VECTOR RENDER LOOP
    // ==========================================
    function animate(timestamp) {
        // Calculate delta time so speed is consistent regardless of monitor refresh rate
        const dt = (timestamp - lastTime) / 1000 || 0;
        lastTime = timestamp;

        // Fill deep black background
        ctx.fillStyle = '#080808';
        ctx.fillRect(0, 0, width, height);

        // Optional: Add a subtle glow to mimic the neon vibe of the GIF
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${config.baseColor}, 0.3)`;

        // Process and draw each line
        lines.forEach(line => {
            // 1. Move line closer to the camera
            line.z -= config.speed * dt;

            // 2. Recycle the line back to the horizon if it hits the camera
            if (line.z <= config.minZ) {
                line.z += (config.maxZ - config.minZ);
            }

            // 3. Project 3D depth to 2D screen space
            const yOffset = (height * config.focalLength) / line.z;

            // 4. Calculate Opacity (The Fade In/Out Effect)
            let opacity = 1;
            
            // Fade in slowly as it spawns at the horizon
            const horizonFadeDist = 600;
            if (line.z > config.maxZ - horizonFadeDist) {
                opacity = (config.maxZ - line.z) / horizonFadeDist;
            }
            
            // Fade out quickly right before it hits the edges of the screen
            const cameraFadeDist = 80;
            if (line.z < config.minZ + cameraFadeDist) {
                opacity = Math.min(opacity, (line.z - config.minZ) / cameraFadeDist);
            }

            // Lock opacity between 0 and 1 to prevent rendering bugs
            opacity = Math.max(0, Math.min(1, opacity));

            // 5. Calculate Thickness (Lines get thicker as they get closer)
            // We cap it so it doesn't get ridiculously massive at the edges
            const thickness = Math.min(6, config.baseThickness * (config.maxZ / line.z) * 0.3);

            // 6. Draw the lines if they are visible
            if (opacity > 0.01) {
                ctx.strokeStyle = `rgba(${config.baseColor}, ${opacity})`;
                ctx.lineWidth = thickness;
                
                // Draw Bottom Floor Line
                ctx.beginPath();
                ctx.moveTo(0, centerY + yOffset);
                ctx.lineTo(width, centerY + yOffset);
                ctx.stroke();

                // Draw Top Ceiling Line
                ctx.beginPath();
                ctx.moveTo(0, centerY - yOffset);
                ctx.lineTo(width, centerY - yOffset);
                ctx.stroke();
            }
        });

        requestAnimationFrame(animate);
    }

    // Kickstart the loop
    requestAnimationFrame(animate);
});