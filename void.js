const canvas = document.getElementById("void-canvas");
const ctx = canvas.getContext("2d");

let particles = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

function initParticles() {
    particles = [];
    const count = 180; // More particles = denser void

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * 3 + 0.5,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.4 + 0.1
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.globalAlpha = 0.2 * (3 - p.z); // subtle depth
        ctx.arc(p.x, p.y, p.size * (3 - p.z), 0, Math.PI * 2);
        ctx.fill();

        // movement
        p.y += p.speed * p.z;
        if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(draw);
}

initParticles();
draw();
