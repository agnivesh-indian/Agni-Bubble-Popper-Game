document.addEventListener('DOMContentLoaded', () => {
    const bubbleContainer = document.getElementById('bubble-container');
    const gameContainer = document.querySelector('.game-container');
    const popSound = document.getElementById('pop-sound');
    const soundToggle = document.getElementById('sound-toggle');

    let soundEnabled = true;
    let bubbles = [];
    let lastTime = 0;

    // --- Sound Toggle ---
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = `Sound: ${soundEnabled ? 'ON' : 'OFF'}`;
        popSound.muted = !soundEnabled;
    });

    // --- Bubble Class ---
    class Bubble {
        constructor() {
            this.element = document.createElement('div');
            this.element.classList.add('bubble');

            const size = Math.random() * 60 + 20; // 20px to 80px
            this.size = size;
            this.element.style.width = `${size}px`;
            this.element.style.height = `${size}px`;
            
            this.x = Math.random() * (gameContainer.offsetWidth - size);
            this.y = gameContainer.offsetHeight + size;
            
            this.speed = Math.random() * 100 + 50; // pixels per second
            this.wobbleX = (Math.random() - 0.5) * 40;
            this.wobbleSpeed = (Math.random() - 0.5) * 0.02;

            const hue = Math.random() * 360;
            this.element.style.background = `radial-gradient(circle at 65% 15%, white 1px, hsla(${hue}, 100%, 85%, 0.7) 15%, hsl(${hue}, 100%, 75%) 80%, transparent 100%)`;

            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            bubbleContainer.appendChild(this.element);

            this.element.addEventListener('click', () => this.pop());
            this.element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.pop();
            });
        }

        update(dt) {
            this.y -= this.speed * dt;
            const wobbleAmount = Math.sin(this.y * this.wobbleSpeed) * this.wobbleX;
            this.element.style.transform = `translate(${this.x + wobbleAmount}px, ${this.y}px)`;
        }

        pop() {
            if (this.popped) return;
            this.popped = true;

            if (soundEnabled) {
                popSound.currentTime = 0;
                popSound.play().catch(e => { /* Ignore play error if user hasn't interacted */ });
            }

            createPopText(this.x + this.size / 2, this.y + this.size / 2);

            this.element.classList.add('popped');
            setTimeout(() => {
                this.element.remove();
            }, 300);

            const index = bubbles.indexOf(this);
            if (index > -1) {
                bubbles.splice(index, 1);
            }
        }
    }
    
    function createPopText(x, y) {
        const popText = document.createElement('span');
        popText.classList.add('pop-text');
        popText.textContent = '+Pop!';
        
        popText.style.left = `${x}px`;
        popText.style.top = `${y}px`;
        popText.style.transform = 'translate(-50%, -50%)';

        bubbleContainer.appendChild(popText);

        setTimeout(() => {
            popText.remove();
        }, 1000);
    }

    function gameLoop(timestamp) {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (dt > 0.1) { // prevent large jumps if tab is inactive
            requestAnimationFrame(gameLoop);
            return;
        }

        // Update and remove bubbles
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const bubble = bubbles[i];
            bubble.update(dt);
            if (bubble.y < -bubble.size) {
                bubble.element.remove();
                bubbles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(gameLoop);
    }

    function start() {
        setInterval(() => {
            if (document.hasFocus() && bubbles.length < 50) { // Limit bubbles
                bubbles.push(new Bubble());
            }
        }, 300); // Slower spawn rate

        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        bubbles.forEach(bubble => {
            bubble.element.remove();
        });
        bubbles = [];
    });

    start();
});