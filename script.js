document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interactive elements
    initElusiveButton();
    initPuzzleGame();
    initChaoticKeyboard();
    initSuspiciousCaptcha();
    initRestartButton();
});

// Elusive button that moves away from cursor
function initElusiveButton() {
    const button = document.getElementById('elusive-button');
    const welcomeSection = document.getElementById('welcome-section');
    const puzzleSection = document.getElementById('puzzle-section');
    
    let clickAttempts = 0;
    
    button.addEventListener('mouseover', (e) => {
        // Move button in a random direction
        const x = Math.random() * 100 - 50;
        const y = Math.random() * 100 - 50;
        
        // Keep button within visible area
        const buttonRect = button.getBoundingClientRect();
        const parentRect = button.parentElement.getBoundingClientRect();
        
        const maxX = parentRect.width - buttonRect.width;
        const maxY = parentRect.height - buttonRect.height;
        
        const newX = Math.min(Math.max(0, buttonRect.left - parentRect.left + x), maxX);
        const newY = Math.min(Math.max(0, buttonRect.top - parentRect.top + y), maxY);
        
        button.style.position = 'absolute';
        button.style.left = `${newX}px`;
        button.style.top = `${newY}px`;
        
        clickAttempts++;
        
        // After 5 attempts, make the button catchable
        if (clickAttempts >= 5) {
            button.style.transition = 'none';
        }
    });
    
    button.addEventListener('click', () => {
        welcomeSection.classList.add('hidden');
        puzzleSection.classList.remove('hidden');
    });
}

// Volume puzzle functionality
function initPuzzleGame() {
    const puzzleSection = document.getElementById('puzzle-section');
    const textSection = document.getElementById('text-section');
    const puzzleNext = document.getElementById('puzzle-next');
    const catapultArm = document.querySelector('.catapult-arm');
    const catapultBall = document.querySelector('.catapult-ball');
    const launchButton = document.getElementById('catapult-launch');
    const volumeLevel = document.querySelector('.volume-level');
    const volumeBar = document.querySelector('.volume-bar');
    const targetMarker = document.querySelector('.target-marker');
    const trajectoryLine = document.querySelector('.trajectory-line');
    
    let power = 0;
    let powerInterval;
    let volume = 0;
    let attempts = 0;
    let targetVolume = Math.floor(Math.random() * 81) + 10; // 10-90%
    
    // Set target marker position
    if (targetMarker) {
        targetMarker.style.left = `${targetVolume}%`;
    }
    
    // Start charging power when button is held down
    launchButton.addEventListener('mousedown', startCharging);
    launchButton.addEventListener('touchstart', startCharging);
    
    // Release and launch when button is released
    launchButton.addEventListener('mouseup', launch);
    launchButton.addEventListener('touchend', launch);
    launchButton.addEventListener('mouseleave', launch);
    
    function startCharging(e) {
        e.preventDefault();
        power = 0;
        
        // Animate the arm pulling back
        powerInterval = setInterval(() => {
            power += 1;
            if (power > 90) power = 90;
            
            // Pull back the catapult arm (negative angle)
            const angle = -power;
            catapultArm.style.transform = `rotate(${angle}deg)`;
            
            // Update trajectory line if it exists
            if (trajectoryLine) {
                trajectoryLine.style.height = `${power}px`;
                trajectoryLine.style.transform = `rotate(${angle}deg)`;
            }
        }, 30);
    }
    
    function launch() {
        if (!powerInterval) return;
        
        clearInterval(powerInterval);
        powerInterval = null;
        
        // Calculate power based on angle (-90 degrees = max power, 0 degrees = min power)
        const angle = parseFloat(catapultArm.style.transform.replace('rotate(', '').replace('deg)', ''));
        const powerFactor = Math.abs(angle) / 90;
        
        // Add some randomness to make it challenging
        const randomFactor = Math.random() * 0.2 - 0.1; // -0.1 to +0.1
        volume = Math.min(100, Math.max(0, Math.round((powerFactor + randomFactor) * 100)));
        
        // Animate ball
        catapultBall.classList.add('flying');
        
        // Calculate landing position based on volume percentage
        const barRect = volumeBar.getBoundingClientRect();
        const landingPosition = (volume / 100) * barRect.width;
        
        // Calculate trajectory to land at the correct position
        const distance = landingPosition;
        const height = -150 - (powerFactor * 50); // Higher power = higher arc
        
        // Launch the ball
        catapultBall.style.transform = `translate(${distance}px, ${height}px)`;
        
        // Update volume display after ball lands
        setTimeout(() => {
            volumeLevel.style.width = `${volume}%`;
            attempts++;
            
            // Show next button if close to target or after multiple attempts
            if (Math.abs(volume - targetVolume) <= 2 || attempts >= 5) {
                puzzleNext.classList.remove('hidden');
            }
            
            // Reset for another attempt
            setTimeout(() => {
                catapultArm.style.transform = 'rotate(0deg)';
                catapultBall.classList.remove('flying');
                catapultBall.style.transform = '';
                if (trajectoryLine) {
                    trajectoryLine.style.height = '0';
                }
            }, 1000);
        }, 500);
    }
    
    puzzleNext.addEventListener('click', () => {
        puzzleSection.classList.add('hidden');
        textSection.classList.remove('hidden');
    });
}

// Chaotic keyboard with rearranging keys
function initChaoticKeyboard() {
    const keyboardContainer = document.querySelector('.chaotic-keyboard');
    const textInput = document.getElementById('chaotic-input');
    const textNext = document.getElementById('text-next');
    const textSection = document.getElementById('text-section');
    const captchaSection = document.getElementById('captcha-section');
    
    const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    
    // Create keyboard
    keys.forEach(key => {
        const keyElement = document.createElement('div');
        keyElement.classList.add('key');
        keyElement.textContent = key;
        keyboardContainer.appendChild(keyElement);
        
        keyElement.addEventListener('click', () => {
            // Add the key to the input
            textInput.value += key;
            
            // Randomly rearrange keyboard
            if (Math.random() > 0.5) {
                shuffleKeyboard();
            }
            
            // Show next button when input has at least 5 characters
            if (textInput.value.length >= 5) {
                textNext.classList.remove('hidden');
            }
        });
    });
    
    // Shuffle keyboard initially
    shuffleKeyboard();
    
    function shuffleKeyboard() {
        const keyElements = Array.from(keyboardContainer.children);
        keyElements.forEach(key => {
            keyboardContainer.removeChild(key);
        });
        
        // Fisher-Yates shuffle
        for (let i = keyElements.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [keyElements[i], keyElements[j]] = [keyElements[j], keyElements[i]];
        }
        
        keyElements.forEach(key => {
            keyboardContainer.appendChild(key);
        });
    }
    
    // Prevent normal keyboard input and replace with random characters
    textInput.addEventListener('keydown', (e) => {
        e.preventDefault();
        
        if (e.key === 'Backspace') {
            textInput.value = textInput.value.slice(0, -1);
            return;
        }
        
        if (e.key.length === 1) {
            // 30% chance to type a random character instead
            if (Math.random() < 0.3) {
                const randomKey = keys[Math.floor(Math.random() * keys.length)];
                textInput.value += randomKey;
            } else {
                textInput.value += e.key.toUpperCase();
            }
            
            // Randomly rearrange keyboard
            if (Math.random() > 0.7) {
                shuffleKeyboard();
            }
            
            // Show next button when input has at least 5 characters
            if (textInput.value.length >= 5) {
                textNext.classList.remove('hidden');
            }
        }
    });
    
    textNext.addEventListener('click', () => {
        textSection.classList.add('hidden');
        captchaSection.classList.remove('hidden');
    });
}

// Suspicious CAPTCHA
function initSuspiciousCaptcha() {
    const captchaContainer = document.querySelector('.captcha-container');
    const captchaNext = document.getElementById('captcha-next');
    const captchaSection = document.getElementById('captcha-section');
    const finalSection = document.getElementById('final-section');
    
    const colors = [
        '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
        '#536DFE', '#448AFF', '#40C4FF', '#18FFFF',
        '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41'
    ];
    
    // Create 9 "suspicious" images
    for (let i = 0; i < 9; i++) {
        const imageElement = document.createElement('div');
        imageElement.classList.add('captcha-image');
        
        // Create a random pattern
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        
        // Set a gradient background
        imageElement.style.background = `linear-gradient(${Math.random() * 360}deg, ${color1}, ${color2})`;
        
        // Add a random shape
        const shape = Math.floor(Math.random() * 3);
        if (shape === 0) {
            // Circle
            imageElement.style.borderRadius = '50%';
        } else if (shape === 1) {
            // Triangle (using pseudo-element)
            imageElement.style.position = 'relative';
            imageElement.style.overflow = 'hidden';
            
            const pseudoElement = document.createElement('div');
            pseudoElement.style.position = 'absolute';
            pseudoElement.style.width = '100%';
            pseudoElement.style.height = '100%';
            pseudoElement.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            pseudoElement.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
            pseudoElement.style.opacity = '0.7';
            
            imageElement.appendChild(pseudoElement);
        }
        
        captchaContainer.appendChild(imageElement);
        
        // Toggle selection on click
        imageElement.addEventListener('click', () => {
            imageElement.classList.toggle('selected');
            
            // Check if at least 3 images are selected
            const selectedImages = document.querySelectorAll('.captcha-image.selected');
            if (selectedImages.length >= 3) {
                captchaNext.classList.remove('hidden');
            } else {
                captchaNext.classList.add('hidden');
            }
        });
    }
    
    captchaNext.addEventListener('click', () => {
        captchaSection.classList.add('hidden');
        finalSection.classList.remove('hidden');
    });
}

// Restart button
function initRestartButton() {
    const restartButton = document.getElementById('restart-button');
    const finalSection = document.getElementById('final-section');
    const welcomeSection = document.getElementById('welcome-section');
    
    restartButton.addEventListener('click', () => {
        // Reset all sections
        finalSection.classList.add('hidden');
        welcomeSection.classList.remove('hidden');
        
        // Reset input values
        document.getElementById('chaotic-input').value = '';
        
        // Unselect all captcha images
        document.querySelectorAll('.captcha-image.selected').forEach(img => {
            img.classList.remove('selected');
        });
        
        // Hide all next buttons
        document.querySelectorAll('.neal-button.hidden').forEach(btn => {
            btn.classList.add('hidden');
        });
        
        // Reset volume
        document.querySelector('.volume-level').style.width = '50%';
        document.querySelector('.volume-value').textContent = '50%';
    });
}