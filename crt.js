document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('crt-overlay');
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // This overlay must cover the entire viewport and sit above everything
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '9999'; 
    canvas.style.pointerEvents = 'none'; // CRITICAL: Allows user to click buttons underneath

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Very faint black
        for (let i = 0; i < canvas.height; i += 4) {
            ctx.fillRect(0, i, canvas.width, 2);
        }

        // 2. Draw Vignette (Darkens the edges)
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 1.5
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)'); // Darker edges
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resize);
    resize();
});