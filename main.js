/**
 * The Portfolio Shift - Main JavaScript
 * Dynamic Typography, Particles, Per-Character Animations
 */

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const body = document.body;

    // ===== Split Text into Characters =====
    function splitText() {
        document.querySelectorAll('.mega-text').forEach(el => {
            const html = el.innerHTML;
            // Don't re-split if already done
            if (el.querySelector('.char')) return;

            let result = '';
            let charIndex = 0;

            // Process HTML preserving tags
            const temp = document.createElement('div');
            temp.innerHTML = html;

            function processNode(node) {
                if (node.nodeType === 3) { // Text node
                    const text = node.textContent;
                    let chars = '';
                    for (let i = 0; i < text.length; i++) {
                        const c = text[i];
                        if (c === ' ') {
                            chars += ' ';
                        } else if (c !== '\n') {
                            const delay = charIndex * 0.05;
                            const randX = (Math.random() - 0.5) * 20;
                            const randY = (Math.random() - 0.5) * 20;
                            const randR = (Math.random() - 0.5) * 10;
                            chars += `<span class="char" style="--i:${charIndex};--rx:${randX}px;--ry:${randY}px;--rr:${randR}deg;animation-delay:${delay}s">${c}</span>`;
                            charIndex++;
                        }
                    }
                    return chars;
                } else if (node.nodeType === 1) { // Element node
                    const tag = node.tagName.toLowerCase();
                    const classes = node.className ? ` class="${node.className}"` : '';
                    let content = '';
                    node.childNodes.forEach(child => {
                        content += processNode(child);
                    });
                    if (tag === 'br') return '<br>';
                    return `<${tag}${classes}>${content}</${tag}>`;
                }
                return '';
            }

            temp.childNodes.forEach(node => {
                result += processNode(node);
            });

            el.innerHTML = result;
        });
    }

    splitText();

    // ===== Hugo-Style Tick Text Animation =====
    const tickChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';

    function initTickText() {
        document.querySelectorAll('.tick-text').forEach(el => {
            const originalText = el.getAttribute('data-text') || el.textContent;
            el.setAttribute('data-text', originalText);

            // Start the loop
            tickTextLoop(el, originalText);
        });
    }

    function tickTextLoop(el, originalText) {
        const duration = 2000; // Animation duration
        const pause = 3000;    // Pause before next loop
        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;

            if (progress < 1) {
                // Scramble phase then resolve
                let newText = '';
                for (let i = 0; i < originalText.length; i++) {
                    const charProgress = progress * originalText.length;
                    if (i < charProgress - 1) {
                        // Resolved character
                        newText += originalText[i];
                    } else if (i < charProgress) {
                        // Scrambling character
                        newText += tickChars[Math.floor(Math.random() * tickChars.length)];
                    } else {
                        // Random character
                        newText += tickChars[Math.floor(Math.random() * tickChars.length)];
                    }
                }
                el.textContent = newText;
                requestAnimationFrame(animate);
            } else {
                // Show original text
                el.textContent = originalText;
                // Wait and restart
                setTimeout(() => {
                    startTime = null;
                    requestAnimationFrame(animate);
                }, pause);
            }
        }

        requestAnimationFrame(animate);
    }

    // Initialize after a short delay
    setTimeout(initTickText, 500);

    // ===== Slot Machine Number Animation =====
    const slotNumbers = [5, 10, 20, 30, 50, 75, 100, 3, 8, 15, 25, 40, 60, 80];

    function initSlotNumbers() {
        document.querySelectorAll('.slot-number').forEach(el => {
            slotNumberLoop(el);
        });
    }

    function slotNumberLoop(el) {
        const spinDuration = 1500; // How long to spin
        const pauseDuration = 2500; // Pause showing final number
        let startTime = null;
        let finalNumber = slotNumbers[Math.floor(Math.random() * slotNumbers.length)];

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            if (elapsed < spinDuration) {
                // Spinning phase - show random numbers
                const speed = Math.max(50, 150 - (elapsed / spinDuration) * 100); // Slow down
                if (elapsed % speed < 20) {
                    el.textContent = slotNumbers[Math.floor(Math.random() * slotNumbers.length)];
                }
                requestAnimationFrame(animate);
            } else {
                // Show final number
                el.textContent = finalNumber;
                // Wait and restart
                setTimeout(() => {
                    startTime = null;
                    finalNumber = slotNumbers[Math.floor(Math.random() * slotNumbers.length)];
                    requestAnimationFrame(animate);
                }, pauseDuration);
            }
        }

        requestAnimationFrame(animate);
    }

    // Initialize slot numbers
    setTimeout(initSlotNumbers, 500);

    // ===== Falling File Icons System (for FOLDER slide) =====
    class FallingIconsSystem {
        constructor(container) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.container = container;
            this.icons = [];
            this.isRunning = false;

            this.canvas.classList.add('falling-icons-canvas');
            this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';
            container.appendChild(this.canvas);
            this.resize();

            // Icon types: simple shapes
            this.iconTypes = ['doc', 'doc', 'doc', 'folder', 'image', 'doc'];

            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            this.canvas.width = this.container.offsetWidth;
            this.canvas.height = this.container.offsetHeight;

            // Get actual text element position for collision
            const textEl = this.container.querySelector('.mega-text');
            if (textEl) {
                const rect = textEl.getBoundingClientRect();
                const containerRect = this.container.getBoundingClientRect();
                this.textZone = {
                    x: rect.left - containerRect.left,
                    y: rect.top - containerRect.top,
                    width: rect.width,
                    height: rect.height
                };
            } else {
                this.textZone = {
                    x: this.canvas.width * 0.2,
                    y: this.canvas.height * 0.25,
                    width: this.canvas.width * 0.6,
                    height: this.canvas.height * 0.5
                };
            }
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.icons = [];
            this.resize(); // Refresh text zone
            this.spawnInterval = setInterval(() => this.spawnIcon(), 50); // Balanced performance
            this.animate();
        }

        stop() {
            this.isRunning = false;
            clearInterval(this.spawnInterval);
            this.icons = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        spawnIcon() {
            if (this.icons.length > 100) return; // Optimized for performance

            this.icons.push({
                x: Math.random() * this.canvas.width,
                y: -20,
                vy: 1 + Math.random() * 2,
                vx: (Math.random() - 0.5) * 2,
                gravity: 0.2 + Math.random() * 0.15,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                size: 8 + Math.random() * 10,
                type: this.iconTypes[Math.floor(Math.random() * this.iconTypes.length)],
                opacity: 0.5 + Math.random() * 0.4,
                bounced: false
            });
        }

        drawIcon(ctx, type, size) {
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;

            if (type === 'doc') {
                // Document with folded corner
                ctx.beginPath();
                ctx.moveTo(-size / 2, -size / 2);
                ctx.lineTo(size / 4, -size / 2);
                ctx.lineTo(size / 2, -size / 4);
                ctx.lineTo(size / 2, size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(size / 4, -size / 2);
                ctx.lineTo(size / 4, -size / 4);
                ctx.lineTo(size / 2, -size / 4);
                ctx.stroke();
            } else if (type === 'folder') {
                ctx.beginPath();
                ctx.moveTo(-size / 2, -size / 3);
                ctx.lineTo(-size / 4, -size / 2);
                ctx.lineTo(size / 4, -size / 2);
                ctx.lineTo(size / 4, -size / 3);
                ctx.lineTo(size / 2, -size / 3);
                ctx.lineTo(size / 2, size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (type === 'image') {
                ctx.strokeRect(-size / 2, -size / 2, size, size);
                ctx.fillRect(-size / 2, -size / 2, size, size);
                ctx.beginPath();
                ctx.moveTo(-size / 3, size / 4);
                ctx.lineTo(0, -size / 4);
                ctx.lineTo(size / 3, size / 4);
                ctx.stroke();
            }
        }

        animate() {
            if (!this.isRunning) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.icons = this.icons.filter(icon => {
                // Apply gravity
                icon.vy += icon.gravity;
                icon.y += icon.vy;
                icon.x += icon.vx;
                icon.rotation += icon.rotationSpeed;

                // Collision with text zone - check if entering text area from above
                const tz = this.textZone;
                if (!icon.bounced &&
                    icon.x > tz.x - 20 &&
                    icon.x < tz.x + tz.width + 20 &&
                    icon.y > tz.y - 10 &&
                    icon.y < tz.y + tz.height) {
                    // Bounce effect - reverse with energy loss
                    icon.vy = -Math.abs(icon.vy) * (0.3 + Math.random() * 0.3);
                    icon.vx += (Math.random() - 0.5) * 6;
                    icon.rotationSpeed *= 2;
                    icon.bounced = true;
                }

                // Draw icon
                this.ctx.save();
                this.ctx.translate(icon.x, icon.y);
                this.ctx.rotate(icon.rotation);
                this.ctx.globalAlpha = icon.opacity;
                this.drawIcon(this.ctx, icon.type, icon.size);
                this.ctx.restore();

                // Remove if off screen
                return icon.y < this.canvas.height + 30;
            });

            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize falling icons for FOLDER slide (slide-5)
    let folderIconsSystem = null;

    // ===== Cursor Flock System (Boids) for START slide =====
    class CursorFlockSystem {
        constructor(container) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.container = container;
            this.boids = [];
            this.isRunning = false;
            this.mouse = { x: -1000, y: -1000 };

            this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;';
            container.appendChild(this.canvas);
            this.resize();

            this._onMouse = (e) => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            };

            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            this.canvas.width = this.container.offsetWidth;
            this.canvas.height = this.container.offsetHeight;
        }

        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.resize();

            const count = 480;
            this.boids = [];
            for (let i = 0; i < count; i++) {
                this.boids.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    size: 10 + Math.random() * 8
                });
            }

            document.addEventListener('mousemove', this._onMouse);
            this.animate();
        }

        stop() {
            this.isRunning = false;
            this.boids = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            document.removeEventListener('mousemove', this._onMouse);
        }

        animate() {
            if (!this.isRunning) return;
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;
            ctx.clearRect(0, 0, w, h);

            const boids = this.boids;
            const mouse = this.mouse;
            const maxSpeed = 8;
            const perception = 60;

            for (let i = 0; i < boids.length; i++) {
                const b = boids[i];
                let sepX = 0, sepY = 0, sepCount = 0;
                let aliX = 0, aliY = 0, aliCount = 0;
                let cohX = 0, cohY = 0, cohCount = 0;

                for (let j = 0; j < boids.length; j++) {
                    if (i === j) continue;
                    const o = boids[j];
                    const dx = o.x - b.x;
                    const dy = o.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < perception) {
                        aliX += o.vx; aliY += o.vy; aliCount++;
                        cohX += o.x; cohY += o.y; cohCount++;
                        if (dist < 22) {
                            sepX -= dx / dist; sepY -= dy / dist; sepCount++;
                        }
                    }
                }

                let ax = 0, ay = 0;

                if (aliCount > 0) {
                    ax += (aliX / aliCount - b.vx) * 0.06;
                    ay += (aliY / aliCount - b.vy) * 0.06;
                }
                if (cohCount > 0) {
                    ax += (cohX / cohCount - b.x) * 0.003;
                    ay += (cohY / cohCount - b.y) * 0.003;
                }
                if (sepCount > 0) {
                    ax += (sepX / sepCount) * 1.0;
                    ay += (sepY / sepCount) * 1.0;
                }

                // Mouse attraction
                const mdx = mouse.x - b.x;
                const mdy = mouse.y - b.y;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mDist < 500 && mDist > 0) {
                    ax += (mdx / mDist) * 0.5;
                    ay += (mdy / mDist) * 0.5;
                }

                b.vx += ax; b.vy += ay;

                const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                if (spd > maxSpeed) {
                    b.vx = (b.vx / spd) * maxSpeed;
                    b.vy = (b.vy / spd) * maxSpeed;
                }

                b.x += b.vx; b.y += b.vy;

                if (b.x < -20) b.x = w + 20;
                if (b.x > w + 20) b.x = -20;
                if (b.y < -20) b.y = h + 20;
                if (b.y > h + 20) b.y = -20;

                // Draw mouse pointer (no rotation - always upright)
                const s = b.size;

                ctx.save();
                ctx.translate(b.x, b.y);

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, s * 1.4);
                ctx.lineTo(s * 0.3, s * 1.05);
                ctx.lineTo(s * 0.55, s * 1.55);
                ctx.lineTo(s * 0.75, s * 1.4);
                ctx.lineTo(s * 0.45, s * 0.9);
                ctx.lineTo(s * 0.95, s * 0.9);
                ctx.closePath();

                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(10,10,10,0.7)';
                ctx.lineWidth = 1.2;
                ctx.lineJoin = 'round';
                ctx.stroke();

                ctx.restore();
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    let cursorFlockSystem = null;

    // ===== Enhanced Particle System Template =====
    // Shapes: circle, square, triangle, circleOutline, squareOutline, triangleOutline
    // Physics: float, gravity, rise, drift, orbit, pulse
    class ParticleSystem {
        constructor(container) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.container = container;
            this.particles = [];
            this.isRunning = false;

            this.canvas.classList.add('particle-canvas');
            container.appendChild(this.canvas);
            this.resize();

            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            this.canvas.width = this.container.offsetWidth;
            this.canvas.height = this.container.offsetHeight;
        }

        // Main start method with full configuration
        start(config = {}) {
            if (this.isRunning) return;
            this.isRunning = true;

            // Default configuration
            this.config = {
                shape: config.shape || 'circle',      // circle, square, triangle, circleOutline, squareOutline, triangleOutline
                physics: config.physics || 'float',    // float, gravity, rise, drift, orbit, pulse
                color: config.color || 'white',        // white, black, yellow
                count: config.count || 30,
                sizeMin: config.sizeMin || 2,
                sizeMax: config.sizeMax || 6,
                speed: config.speed || 1,
                showCoords: config.showCoords || false  // Show X,Y coordinates on particles
            };

            this.particles = [];
            for (let i = 0; i < this.config.count; i++) {
                this.particles.push(this.createParticle());
            }

            this.animate();
        }

        stop() {
            this.isRunning = false;
            this.particles = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        createParticle() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            const cfg = this.config;

            // Color mapping
            let colorRGB;
            switch (cfg.color) {
                case 'black': colorRGB = '10,10,10'; break;
                case 'yellow': colorRGB = '255,214,0'; break;
                default: colorRGB = '255,255,255';
            }

            let p = {
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * (cfg.sizeMax - cfg.sizeMin) + cfg.sizeMin,
                speedX: (Math.random() - 0.5) * 2 * cfg.speed,
                speedY: (Math.random() - 0.5) * 2 * cfg.speed,
                opacity: Math.random() * 0.5 + 0.3,
                colorRGB: colorRGB,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                hasCoords: cfg.showCoords && Math.random() < 0.15  // 15% chance to show coords
            };

            // Physics-specific initialization
            switch (cfg.physics) {
                case 'gravity':
                    p.y = -10 - Math.random() * 100;
                    p.speedY = Math.random() * 2 + 1;
                    p.speedX = (Math.random() - 0.5) * 0.5;
                    p.acceleration = 0.02 + Math.random() * 0.03;
                    break;
                case 'rise':
                    p.y = h + 10 + Math.random() * 100;
                    p.speedY = -(Math.random() * 1.5 + 0.5);
                    p.speedX = (Math.random() - 0.5) * 0.3;
                    break;
                case 'drift':
                    p.speedX = (Math.random() * 0.5 + 0.2) * cfg.speed;
                    p.speedY = (Math.random() - 0.5) * 0.2;
                    p.wave = Math.random() * Math.PI * 2;
                    p.waveSpeed = Math.random() * 0.02 + 0.01;
                    p.waveAmp = Math.random() * 30 + 10;
                    break;
                case 'orbit':
                    p.centerX = w / 2;
                    p.centerY = h / 2;
                    p.radius = Math.random() * 200 + 100;
                    p.angle = Math.random() * Math.PI * 2;
                    p.angleSpeed = (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1);
                    break;
                case 'pulse':
                    p.baseOpacity = p.opacity;
                    p.pulseSpeed = Math.random() * 0.05 + 0.02;
                    p.pulsePhase = Math.random() * Math.PI * 2;
                    break;
            }

            return p;
        }

        animate() {
            if (!this.isRunning) return;

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const cfg = this.config;

            this.particles.forEach((p, i) => {
                // Physics update
                switch (cfg.physics) {
                    case 'gravity':
                        p.speedY += p.acceleration;
                        p.x += p.speedX;
                        p.y += p.speedY;
                        if (p.y > this.canvas.height + 20) {
                            this.particles[i] = this.createParticle();
                        }
                        break;
                    case 'rise':
                        p.x += p.speedX;
                        p.y += p.speedY;
                        if (p.y < -20) {
                            this.particles[i] = this.createParticle();
                        }
                        break;
                    case 'drift':
                        p.wave += p.waveSpeed;
                        p.x += p.speedX;
                        p.y += Math.sin(p.wave) * 0.5;
                        if (p.x > this.canvas.width + 20) {
                            p.x = -10;
                            p.y = Math.random() * this.canvas.height;
                        }
                        break;
                    case 'orbit':
                        p.angle += p.angleSpeed;
                        p.x = p.centerX + Math.cos(p.angle) * p.radius;
                        p.y = p.centerY + Math.sin(p.angle) * p.radius;
                        break;
                    case 'pulse':
                        p.pulsePhase += p.pulseSpeed;
                        p.opacity = p.baseOpacity + Math.sin(p.pulsePhase) * 0.2;
                        p.x += p.speedX * 0.3;
                        p.y += p.speedY * 0.3;
                        // Wrap around
                        if (p.x < 0) p.x = this.canvas.width;
                        if (p.x > this.canvas.width) p.x = 0;
                        if (p.y < 0) p.y = this.canvas.height;
                        if (p.y > this.canvas.height) p.y = 0;
                        break;
                    default: // float
                        p.x += p.speedX;
                        p.y += p.speedY;
                        if (p.x < 0) p.x = this.canvas.width;
                        if (p.x > this.canvas.width) p.x = 0;
                        if (p.y < 0) p.y = this.canvas.height;
                        if (p.y > this.canvas.height) p.y = 0;
                }

                // Rotation update for shapes
                p.rotation += p.rotationSpeed;

                // Draw particle based on shape
                this.drawParticle(p, cfg.shape);
            });

            requestAnimationFrame(() => this.animate());
        }

        drawParticle(p, shape) {
            const ctx = this.ctx;
            const fillColor = `rgba(${p.colorRGB},${p.opacity})`;
            const strokeColor = `rgba(${p.colorRGB},${p.opacity})`;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            switch (shape) {
                case 'square':
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    break;
                case 'squareOutline':
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    break;
                case 'triangle':
                    ctx.fillStyle = fillColor;
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size);
                    ctx.lineTo(p.size * 0.866, p.size * 0.5);
                    ctx.lineTo(-p.size * 0.866, p.size * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'triangleOutline':
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size);
                    ctx.lineTo(p.size * 0.866, p.size * 0.5);
                    ctx.lineTo(-p.size * 0.866, p.size * 0.5);
                    ctx.closePath();
                    ctx.stroke();
                    break;
                case 'circleOutline':
                    ctx.strokeStyle = strokeColor;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                default: // circle
                    ctx.fillStyle = fillColor;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
            }

            // Draw coordinates if enabled
            if (p.hasCoords) {
                ctx.rotate(-p.rotation); // Reset rotation for text
                ctx.font = '8px monospace';
                ctx.fillStyle = `rgba(${p.colorRGB},0.6)`;
                ctx.fillText(`${Math.round(p.x)},${Math.round(p.y)}`, p.size + 3, 3);
            }

            ctx.restore();
        }
    }

    // ===== Particle Configurations per Slide =====
    // Template: { shape, physics, color, count, sizeMin, sizeMax, speed }
    const particleConfigs = {
        'slide-0': { shape: 'circle', physics: 'float', color: 'white', count: 25, sizeMin: 1, sizeMax: 3 },
        'slide-1': { shape: 'square', physics: 'gravity', color: 'white', count: 40, sizeMin: 1, sizeMax: 3 },
        'slide-2': { shape: 'triangle', physics: 'gravity', color: 'white', count: 50, speed: 0.8, sizeMin: 1, sizeMax: 3 },
        'slide-3': { shape: 'circleOutline', physics: 'rise', color: 'white', count: 35, sizeMin: 2, sizeMax: 6 },
        'slide-4': { shape: 'squareOutline', physics: 'drift', color: 'white', count: 30, sizeMin: 1, sizeMax: 3, showCoords: true },
        'slide-5': { shape: 'square', physics: 'float', color: 'white', count: 25, sizeMin: 1, sizeMax: 3 },
        'slide-6': { shape: 'triangleOutline', physics: 'pulse', color: 'yellow', count: 20, sizeMin: 3, sizeMax: 7 },
        'slide-7': { shape: 'circle', physics: 'drift', color: 'white', count: 30, sizeMin: 1, sizeMax: 3 },
        'slide-8': { shape: 'squareOutline', physics: 'float', color: 'white', count: 25, sizeMin: 1, sizeMax: 3 },
        'slide-9': { shape: 'triangle', physics: 'orbit', color: 'white', count: 20, sizeMin: 2, sizeMax: 5 },
        'slide-10': { shape: 'squareOutline', physics: 'drift', color: 'yellow', count: 20, sizeMin: 2, sizeMax: 5 },
        'slide-11': { shape: 'squareOutline', physics: 'float', color: 'white', count: 15, sizeMin: 1, sizeMax: 3 },
        'slide-12': { shape: 'triangle', physics: 'float', color: 'white', count: 20, sizeMin: 1, sizeMax: 3 },
        'slide-13': { shape: 'square', physics: 'drift', color: 'yellow', count: 25, sizeMin: 1, sizeMax: 2 },
        'slide-14': { shape: 'circleOutline', physics: 'rise', color: 'white', count: 30, sizeMin: 2, sizeMax: 5 },
        'slide-15': { shape: 'circle', physics: 'pulse', color: 'white', count: 15, sizeMin: 1, sizeMax: 3 },
        'slide-16': { shape: 'triangleOutline', physics: 'orbit', color: 'yellow', count: 20, sizeMin: 2, sizeMax: 5 },
        'slide-17': { shape: 'circle', physics: 'rise', color: 'white', count: 25, sizeMin: 1.5, sizeMax: 4 },
        'slide-18': { shape: 'squareOutline', physics: 'float', color: 'white', count: 20, sizeMin: 1, sizeMax: 3 },
        'slide-19': { shape: 'circle', physics: 'rise', color: 'black', count: 30, sizeMin: 1.5, sizeMax: 4 }
    };

    // Create particle system for each slide
    const particleSystems = new Map();

    slides.forEach(slide => {
        const ps = new ParticleSystem(slide);
        particleSystems.set(slide.id, ps);
    });

    // ===== Intersection Observer =====
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const slideId = entry.target.id;
            const ps = particleSystems.get(slideId);

            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Start particles with slide-specific config
                if (ps) {
                    const config = particleConfigs[slideId] || { shape: 'circle', physics: 'float', color: 'white' };
                    ps.start(config);
                }

                // Start falling icons for FOLDER slide (slide-5)
                if (slideId === 'slide-5') {
                    if (!folderIconsSystem) {
                        folderIconsSystem = new FallingIconsSystem(entry.target);
                    }
                    folderIconsSystem.start();
                }

                // Start cursor flock for START slide (slide-19)
                if (slideId === 'slide-19') {
                    if (!cursorFlockSystem) {
                        cursorFlockSystem = new CursorFlockSystem(entry.target);
                    }
                    cursorFlockSystem.start();
                }

                const slideIndex = Array.from(slides).indexOf(entry.target);
                updateActiveDot(slideIndex);

                if (entry.target.classList.contains('slide-yellow')) {
                    body.classList.add('on-yellow');
                } else {
                    body.classList.remove('on-yellow');
                }
            } else {
                // Stop particles when not visible
                if (ps) {
                    ps.stop();
                }
                // Stop falling icons when leaving slide-5
                if (slideId === 'slide-5' && folderIconsSystem) {
                    folderIconsSystem.stop();
                }
                // Stop cursor flock when leaving slide-19
                if (slideId === 'slide-19' && cursorFlockSystem) {
                    cursorFlockSystem.stop();
                }
            }
        });
    }, observerOptions);

    slides.forEach(slide => {
        slideObserver.observe(slide);
    });

    // ===== Update Active Dot =====
    function updateActiveDot(index) {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // ===== Dot Navigation Click =====
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            slides[index].scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ===== Keyboard Navigation =====
    let isScrolling = false;
    let currentSlide = 0;

    document.addEventListener('keydown', (e) => {
        if (isScrolling) return;

        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            navigateSlide(1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            navigateSlide(-1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            slides[0].scrollIntoView({ behavior: 'smooth' });
        } else if (e.key === 'End') {
            e.preventDefault();
            slides[slides.length - 1].scrollIntoView({ behavior: 'smooth' });
        }
    });

    function navigateSlide(direction) {
        slides.forEach((slide, index) => {
            const rect = slide.getBoundingClientRect();
            if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
                currentSlide = index;
            }
        });

        const nextSlide = currentSlide + direction;

        if (nextSlide >= 0 && nextSlide < slides.length) {
            isScrolling = true;
            slides[nextSlide].scrollIntoView({ behavior: 'smooth' });

            setTimeout(() => {
                isScrolling = false;
            }, 800);
        }
    }

    // ===== Mouse Interaction - Parallax Characters =====
    document.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        document.documentElement.style.setProperty('--mouse-x', mouseX);
        document.documentElement.style.setProperty('--mouse-y', mouseY);
    });

    // ===== Prompt Text Stagger Animation =====
    const promptObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const texts = entry.target.querySelectorAll('.prompt-text');
                texts.forEach((text, i) => {
                    setTimeout(() => {
                        text.style.opacity = '1';
                        text.style.transform = 'translateY(0)';
                    }, i * 150 + 300);
                });
            }
        });
    }, { threshold: 0.5 });

    const promptSlide = document.getElementById('slide-15');
    if (promptSlide) promptObserver.observe(promptSlide);

    // ===== Initial State =====
    slides[0].classList.add('visible');
    const initialPs = particleSystems.get('slide-0');
    if (initialPs) initialPs.start(particleConfigs['slide-0']);

    console.log('🚀 Portfolio Shift - 20 Slides Loaded');
    console.log('✨ Shapes: circle, square, triangle + outlines');
    console.log('🎯 Physics: float, gravity, rise, drift, orbit, pulse');
});

