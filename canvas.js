/**
 * GitPulse — Starfield & Constellation Network
 * Handles the interactive canvas background
 */

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
const mouseGlow = document.getElementById('mouseGlow');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Configs
const STAR_COUNT = 150;
const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 110;
const MOUSE_GRAVITY_RADIUS = 180;

let stars = [];
let particles = [];
let mouse = { x: null, y: null, active: false };

// Handle resize
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    init();
});

// Mouse tracker
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;

    // Update mouse glow element
    if (mouseGlow) {
        mouseGlow.style.left = `${mouse.x}px`;
        mouseGlow.style.top = `${mouse.y}px`;
        mouseGlow.style.opacity = '1';
    }
});

window.addEventListener('mouseleave', () => {
    mouse.active = false;
    if (mouseGlow) {
        mouseGlow.style.opacity = '0';
    }
});

// Click ripples
window.addEventListener('click', (e) => {
    createBurst(e.clientX, e.clientY, 8);
});

// Base Classes
class Star {
    constructor() {
        this.reset();
        this.y = Math.random() * height; // initial spread
    }

    reset() {
        this.x = Math.random() * width;
        this.y = 0;
        this.size = Math.random() * 1.5;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        // Twinkle
        this.opacity += this.twinkleSpeed * this.twinkleDir;
        if (this.opacity >= 1) {
            this.opacity = 1;
            this.twinkleDir = -1;
        } else if (this.opacity <= 0.2) {
            this.opacity = 0.2;
            this.twinkleDir = 1;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, isBurst = false) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        this.size = Math.random() * 2 + 1;
        
        // Speed & Direction
        const speedMultiplier = isBurst ? 2.5 : 0.4;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * (Math.random() * speedMultiplier + 0.1);
        this.vy = Math.sin(angle) * (Math.random() * speedMultiplier + 0.1);
        
        // Colors
        this.color = Math.random() > 0.4 ? '59, 130, 246' : '0, 255, 255'; // Blue or Cyan
        this.opacity = isBurst ? 1 : Math.random() * 0.5 + 0.2;
        this.life = isBurst ? 1.0 : null; // Burst particles decay
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        // Standard motion
        this.x += this.vx;
        this.y += this.vy;

        // Gravitational pull towards mouse
        if (mouse.active && this.life === null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_GRAVITY_RADIUS) {
                const force = (MOUSE_GRAVITY_RADIUS - dist) / MOUSE_GRAVITY_RADIUS;
                this.x += (dx / dist) * force * 0.8;
                this.y += (dy / dist) * force * 0.8;
            }
        }

        // Screen boundary bounce for ambient particles
        if (this.life === null) {
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        } else {
            // Decay for burst particles
            this.opacity -= this.decay;
            this.size -= 0.05;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
        ctx.fill();

        // Neon Glow for larger particles
        if (this.size > 2) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(${this.color}, 0.5)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        }
    }
}

// Particle Burst
function createBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, true));
    }
}

// Initialize system
function init() {
    stars = [];
    particles = [];

    // Create stars
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
    }

    // Create ambient nodes
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}

// Draw connections
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];

            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECTION_DISTANCE) {
                // Fade out connection based on distance
                const alpha = (1 - (dist / CONNECTION_DISTANCE)) * 0.15;
                ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    // Render stars
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // Draw grid connections
    drawConnections();

    // Render and filter particles
    particles = particles.filter(p => {
        p.update();
        p.draw();

        // Keep ambient particles or surviving burst particles
        if (p.life !== null && p.opacity <= 0) {
            return false;
        }
        return true;
    });

    // Maintain stable ambient count if burst particles were removed
    const ambientCount = particles.filter(p => p.life === null).length;
    if (ambientCount < PARTICLE_COUNT) {
        particles.push(new Particle());
    }

    requestAnimationFrame(animate);
}

// Initialize & Run
init();
animate();

// Export trigger for other scripts
window.triggerCanvasBurst = (x, y, count) => {
    createBurst(x || width/2, y || height/2, count || 12);
};
