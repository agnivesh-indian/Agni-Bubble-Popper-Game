document.addEventListener('DOMContentLoaded', () => {
    const bubbleContainer = document.getElementById('bubble-container');
    const popSound = document.getElementById('pop-sound');
    const soundToggle = document.getElementById('sound-toggle');

    let soundEnabled = true;

    // --- Sound Toggle ---
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = `Sound: ${soundEnabled ? 'ON' : 'OFF'}`;
        if (soundEnabled) {
            popSound.muted = false;
        } else {
            popSound.muted = true;
        }
    });

    // --- Bubble Creation ---
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        // Randomize bubble properties
        const size = Math.random() * 80 + 20; // 20px to 100px
        const color = `hsl(${Math.random() * 360}, 100%, 75%)`;
        const animationDuration = Math.random() * 5 + 8; // 8s to 13s

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.background = `radial-gradient(circle at 65% 15%, white 1px, ${color} 80%, rgba(255,255,255,0) 100%)`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDuration = `${animationDuration}s, 2s`;

        bubbleContainer.appendChild(bubble);

        // Event listener for popping
        bubble.addEventListener('click', () => popBubble(bubble));
        bubble.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent click event from firing too
            popBubble(bubble);
        });

        // Remove bubble when it floats off-screen
        setTimeout(() => {
            if (!bubble.classList.contains('popped')) {
                bubble.remove();
            }
        }, animationDuration * 1000);
    }

    // --- Bubble Popping ---
    function popBubble(bubble) {
        if (bubble.classList.contains('popped')) return;

        bubble.classList.add('popped');

        // Play sound
        if (soundEnabled) {
            popSound.currentTime = 0;
            popSound.play();
        }
        
        // Create floating text
        createPopText(bubble);

        // Remove bubble after animation
        setTimeout(() => {
            bubble.remove();
        }, 300);
    }

    // --- Floating Text ---
    function createPopText(bubble) {
        const popText = document.createElement('span');
        popText.classList.add('pop-text');
        popText.textContent = '+Pop!';
        
        const rect = bubble.getBoundingClientRect();
        popText.style.left = `${rect.left + rect.width / 2 - 20}px`;
        popText.style.top = `${rect.top + rect.height / 2 - 15}px`;

        document.body.appendChild(popText);

        setTimeout(() => {
            popText.remove();
        }, 1000);
    }

    // --- Game Loop ---
    setInterval(createBubble, 500); // Create a new bubble every 0.5 seconds
});
