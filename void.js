const canvas = document.getElementById("void-canvas");
const ctx = canvas.getContext("2d");

let stars = [];
let comets = [];
let lastTime = performance.now();
let pointer = { x: 0, y: 0, tx: 0, ty: 0 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

window.addEventListener('mousemove', (e) => {
    pointer.tx = (e.clientX - canvas.width / 2) / canvas.width;
    pointer.ty = (e.clientY - canvas.height / 2) / canvas.height;
});

function rand(min, max) { return Math.random() * (max - min) + min; }

function initStars() {
    stars = [];
    // Layered density: small, medium, large
    const small = 320;
    const medium = 80;
    const large = 18;
    for (let i = 0; i < small; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: rand(0.5, 1.2),
            speed: rand(0.02, 0.08),
            layer: 0,
            twinkle: rand(0.002, 0.007),
            phase: Math.random() * Math.PI * 2,
            parallax: rand(0.08, 0.18),
        });
    }
    for (let i = 0; i < medium; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: rand(1.2, 2.6),
            speed: rand(0.06, 0.16),
            layer: 1,
            twinkle: rand(0.003, 0.009),
            phase: Math.random() * Math.PI * 2,
            parallax: rand(0.18, 0.36),
        });
    }
    for (let i = 0; i < large; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: rand(2.6, 5.5),
            speed: rand(0.14, 0.28),
            layer: 2,
            twinkle: rand(0.004, 0.01),
            phase: Math.random() * Math.PI * 2,
            parallax: rand(0.32, 0.6),
            color: `hsl(${rand(180,280)},70%,${rand(70,95)}%)`
        });
    }
}

function spawnComet() {
    const speed = rand(8, 16);
    const angle = rand(-0.2, 0.2) - 0.6;
    comets.push({
        x: rand(0, canvas.width),
        y: -20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 2,
        life: rand(700, 1400),
        age: 0,
        length: rand(80, 160)
    });
}

function drawStar(p, t) {
    // Twinkle alpha
    const alpha = 0.65 + Math.abs(Math.sin(p.phase + t * p.twinkle)) * 0.35;
    ctx.save();
    const glow = p.size * (p.layer === 0 ? 10 : p.layer === 1 ? 16 : 24);
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.fillStyle = p.color || `rgba(255,255,255,${alpha})`;
    ctx.shadowColor = p.color || `rgba(200,220,255,${alpha})`;
    ctx.shadowBlur = glow;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawComet(c) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * c.length, c.y - c.vy * c.length);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(120,200,255,0.18)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x - c.vx * c.length, c.y - c.vy * c.length);
    ctx.stroke();
    // Head
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.shadowColor = 'rgba(120,200,255,0.9)';
    ctx.shadowBlur = 38;
    ctx.arc(c.x, c.y, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawBlackHole() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const outerRadius = Math.min(canvas.width, canvas.height) * 0.18;
    const innerRadius = Math.min(canvas.width, canvas.height) * 0.06;
    // Outer glow
    for (let i = 0; i < 18; i++) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius + i * 4, 0, Math.PI * 2);
        ctx.globalAlpha = 0.08 - i * 0.004;
        ctx.strokeStyle = `hsl(${280 + i * 2}, 80%, 60%)`;
        ctx.lineWidth = 8 - i * 0.3;
        ctx.stroke();
        ctx.restore();
    }
    // Accretion disk (swirl)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 32) {
        ctx.save();
        ctx.beginPath();
        const r = outerRadius * (1 + 0.08 * Math.sin(performance.now() * 0.001 + a * 6));
        ctx.arc(cx, cy, r, a, a + Math.PI / 16);
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = `hsl(${320 + Math.sin(a) * 40}, 90%, 70%)`;
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();
    }
    // Event horizon
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "black";
    ctx.shadowColor = "#e040c0";
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();
}

function update(dt) {
    const t = performance.now() * 0.001;
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    for (let p of stars) {
        p.x += pointer.x * p.parallax * dt * 0.02;
        p.y += pointer.y * p.parallax * dt * 0.02;
        p.y += p.speed * dt;
        p.phase += p.twinkle * dt;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        if (p.x < -40) { p.x = canvas.width + 40; }
        if (p.x > canvas.width + 40) { p.x = -40; }
    }
    for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx * (dt * 0.06);
        c.y += c.vy * (dt * 0.06);
        c.age += dt;
        if (c.age > c.life || c.x < -200 || c.x > canvas.width + 200 || c.y > canvas.height + 200) {
            comets.splice(i, 1);
        }
    }
    if (Math.random() < 0.005) spawnComet();
}

function draw() {
    const now = performance.now();
    const dt = Math.min(now - lastTime, 60);
    lastTime = now;
    update(dt);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,20,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBlackHole(); // Draw black hole first
    ctx.save();
    const shiftX = pointer.x * 20;
    const shiftY = pointer.y * 14;
    ctx.translate(shiftX, shiftY);
    for (let p of stars) drawStar(p, now * 0.001);
    for (let c of comets) drawComet(c);
    ctx.restore();
    requestAnimationFrame(draw);
}

initStars();
draw();
