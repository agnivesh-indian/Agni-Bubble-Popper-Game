document.addEventListener('DOMContentLoaded', () => {
    const bubbleContainer = document.getElementById('bubble-container');
    const gameContainer = document.querySelector('.game-container');
    const popSound = document.getElementById('pop-sound');
    const soundToggle = document.getElementById('sound-toggle');
    const scoreDisplay = document.querySelector('.score');
    const instructionsPopup = document.getElementById('instructions-popup');
    const startGameBtn = document.getElementById('start-game-btn');
    const closeGameBtn = document.getElementById('close-game-btn');

    let soundEnabled = true;
    let bubbles = [];
    let lastTime = 0;
    let score = 0;
    let gameInterval;
    let gameHasStarted = false;

    // --- Button Event Listeners ---
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = `Sound: ${soundEnabled ? 'ON' : 'OFF'}`;
        popSound.muted = !soundEnabled;
    });

    closeGameBtn.addEventListener('click', () => {
        window.history.back();
    });

    // --- Score ---
    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    // --- Floating Object Class ---
    class FloatingObject {
        constructor(type = 'bubble') {
            this.element = document.createElement('div');
            this.element.classList.add('bubble');
            this.type = type;

            const size = Math.random() * 60 + 20;
            this.size = size;
            this.element.style.width = `${size}px`;
            this.element.style.height = `${size}px`;
            
            this.x = Math.random() * (gameContainer.offsetWidth - size);
            this.y = gameContainer.offsetHeight + size;
            
            this.speed = Math.random() * 100 + 50;
            this.wobbleX = (Math.random() - 0.5) * 40;
            this.wobbleSpeed = (Math.random() - 0.5) * 0.02;

            if (this.type === 'bubble') {
                const hue = Math.random() * 360;
                this.element.style.background = `radial-gradient(circle at 65% 15%, white 1px, hsla(${hue}, 100%, 85%, 0.7) 15%, hsl(${hue}, 100%, 75%) 80%, transparent 100%)`;
            } else {
                this.element.classList.add('cross');
            }

            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            bubbleContainer.appendChild(this.element);

            const popHandler = (e) => {
                e.preventDefault();
                this.pop();
            };

            this.element.addEventListener('click', popHandler);
            this.element.addEventListener('touchstart', popHandler);
        }

        update(dt) {
            this.y -= this.speed * dt;
            const wobbleAmount = Math.sin(this.y * this.wobbleSpeed) * this.wobbleX;
            this.element.style.transform = `translate(${this.x + wobbleAmount}px, ${this.y}px)`;
        }

        pop() {
            if (this.popped) return;
            this.popped = true;

            const points = Math.max(1, Math.floor(10 - this.size / 10));

            if (this.type === 'bubble') {
                updateScore(points);
                createPopText(`+${points}`, this.x + this.size / 2, this.y + this.size / 2, false);
            } else {
                updateScore(-points);
                createPopText(`-${points}`, this.x + this.size / 2, this.y + this.size / 2, true);
            }

            if (soundEnabled) {
                popSound.currentTime = 0;
                popSound.play().catch(e => { /* Ignore play error */ });
            }

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
    
    function createPopText(text, x, y, isPenalty) {
        const popText = document.createElement('span');
        popText.classList.add('pop-text');
        popText.textContent = text;
        if (isPenalty) {
            popText.style.color = '#ff8a80';
        }
        
        popText.style.left = `${x}px`;
        popText.style.top = `${y}px`;
        popText.style.transform = 'translate(-50%, -50%)';

        bubbleContainer.appendChild(popText);

        setTimeout(() => {
            popText.remove();
        }, 1000);
    }

    function gameLoop(timestamp) {
        // Keep the loop running, even if the game hasn't started
        requestAnimationFrame(gameLoop);

        // If the game hasn't started, do nothing further in this frame.
        if (!gameHasStarted) return;

        if (!lastTime) lastTime = timestamp;
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (dt > 0.1) { // prevent large jumps if tab is inactive
            return;
        }

        for (let i = bubbles.length - 1; i >= 0; i--) {
            const bubble = bubbles[i];
            bubble.update(dt);
            if (bubble.y < -bubble.size) {
                bubble.element.remove();
                bubbles.splice(i, 1);
            }
        }
    }

    function startGame() {
        if (gameHasStarted) return;
        gameHasStarted = true;

        instructionsPopup.classList.add('hidden');
        
        // Pre-load sound on first user interaction, then pause it.
        popSound.play().catch(e => { /* Autoplay was prevented */ });
        popSound.pause();

        gameInterval = setInterval(() => {
            if (document.hasFocus() && bubbles.length < 50) {
                const type = Math.random() < 0.15 ? 'cross' : 'bubble';
                bubbles.push(new FloatingObject(type));
            }
        }, 300);
    }

    // Start game on button click or touch
    startGameBtn.addEventListener('click', startGame);
    startGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });

    window.addEventListener('resize', () => {
        if (gameInterval) {
            bubbles.forEach(bubble => bubble.element.remove());
            bubbles = [];
        }
    });

    // Start the animation loop, it will be idle until the game starts.
    requestAnimationFrame(gameLoop);
});