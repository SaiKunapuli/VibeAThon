document.addEventListener('DOMContentLoaded', () => {
    // Initialize all interactive elements
    initElusiveButton();
    initPuzzleGame();
    initChaoticKeyboard();
    initSuspiciousCaptcha();
    initRestartButton();
    
    // Add visual distractions
    initVisualDistractions();
    
    // Add annoying popups
    initAnnoyingPopups();
    
    // Start auto-popup timer
    setInterval(() => {
        showRandomPopup();
    }, 15000); // Show a popup every 15 seconds
});

// Elusive button that moves away from cursor
function initElusiveButton() {
    const button = document.getElementById('elusive-button');
    const welcomeSection = document.getElementById('welcome-section');
    const puzzleSection = document.getElementById('puzzle-section');
    
    // Make button text change randomly
    const buttonTexts = [
        "Start",
        "Click Me",
        "Try Again",
        "Almost There",
        "Not Here",
        "Too Slow",
        "Keep Trying",
        "So Close",
        "Nope",
        "Wrong Spot"
    ];
    
    // Change button text randomly
    setInterval(() => {
        button.textContent = buttonTexts[Math.floor(Math.random() * buttonTexts.length)];
    }, 1500);
    
    // Create decoy buttons that disappear when hovered
    for (let i = 0; i < 5; i++) {
        const decoyButton = document.createElement('button');
        decoyButton.classList.add('neal-button', 'decoy-button');
        decoyButton.textContent = "Start";
        decoyButton.style.position = 'absolute';
        decoyButton.style.left = `${Math.random() * 80}%`;
        decoyButton.style.top = `${Math.random() * 80}%`;
        decoyButton.style.zIndex = '5';
        welcomeSection.appendChild(decoyButton);
        
        decoyButton.addEventListener('mouseover', () => {
            decoyButton.style.opacity = '0';
            setTimeout(() => {
                if (welcomeSection.contains(decoyButton)) {
                    welcomeSection.removeChild(decoyButton);
                }
            }, 500);
        });
    }
    
    let clickAttempts = 0;
    let isButtonCatchable = false;
    
    button.addEventListener('mouseover', (e) => {
        // Don't move if it's finally catchable
        if (isButtonCatchable) return;
        
        // Move button in a random direction with larger movements
        const x = Math.random() * 200 - 100;
        const y = Math.random() * 200 - 100;
        
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
        
        // Sometimes change size
        if (Math.random() > 0.7) {
            const newSize = Math.max(0.5, Math.random() * 1.5);
            button.style.transform = `scale(${newSize})`;
        }
        
        clickAttempts++;
        
        // After 10 attempts, make the button catchable but only 50% of the time
        if (clickAttempts >= 10 && Math.random() > 0.5) {
            isButtonCatchable = true;
            button.style.transition = 'none';
            button.style.border = '2px solid green';
            
            // But make it catchable only for a short time
            setTimeout(() => {
                isButtonCatchable = false;
                button.style.border = '';
            }, 1000);
        }
    });
    
    button.addEventListener('click', () => {
        // 30% chance to not proceed and reset the button
        if (Math.random() > 0.7) {
            // Reset button position
            button.style.left = `${Math.random() * 80}%`;
            button.style.top = `${Math.random() * 80}%`;
            
            // Show message
            const message = document.createElement('div');
            message.textContent = "Nice try! Keep clicking.";
            message.style.position = 'absolute';
            message.style.top = '50%';
            message.style.left = '50%';
            message.style.transform = 'translate(-50%, -50%)';
            message.style.color = 'red';
            message.style.fontWeight = 'bold';
            message.style.fontSize = '24px';
            welcomeSection.appendChild(message);
            
            setTimeout(() => {
                welcomeSection.removeChild(message);
            }, 1500);
        } else {
            welcomeSection.classList.add('hidden');
            puzzleSection.classList.remove('hidden');
        }
    });
    
    // Add CSS for decoy buttons
    const style = document.createElement('style');
    style.textContent = `
        .decoy-button {
            transition: opacity 0.3s;
        }
    `;
    document.head.appendChild(style);
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
    
    // Create score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.classList.add('score-display');
    scoreDisplay.innerHTML = '<span>Score: <span id="score-value">0</span></span> | <span>Rage Meter: <span id="rage-meter">0%</span></span>';
    puzzleSection.insertBefore(scoreDisplay, puzzleSection.firstChild.nextSibling);
    
    // Create frustration messages
    const messageDisplay = document.createElement('div');
    messageDisplay.classList.add('message-display');
    messageDisplay.style.color = '#ff5252';
    messageDisplay.style.fontWeight = 'bold';
    messageDisplay.style.marginBottom = '10px';
    messageDisplay.style.minHeight = '20px';
    puzzleSection.insertBefore(messageDisplay, scoreDisplay.nextSibling);
    
    // Create fake error messages container
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('error-container');
    errorContainer.style.position = 'absolute';
    errorContainer.style.zIndex = '100';
    errorContainer.style.pointerEvents = 'none';
    puzzleSection.appendChild(errorContainer);
    
    let power = 0;
    let powerInterval;
    let volume = 0;
    let attempts = 0;
    let score = 0;
    let rageMeter = 0;
    let targetVolume = Math.floor(Math.random() * 81) + 10; // 10-90%
    let targetShrinkInterval;
    let targetMoveInterval;
    let gravityReversed = false;
    
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
    
    // Add CSS for animations and effects
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translate(0, 0); }
            10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 0); }
            20%, 40%, 60%, 80% { transform: translate(5px, 0); }
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        
        .error-message {
            position: absolute;
            background-color: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            animation: shake 0.5s;
            z-index: 1000;
        }
        
        .target-flash {
            animation: flash 0.2s 3;
        }
        
        .ball-spin {
            animation: spin 0.5s linear infinite;
        }
    `;
    document.head.appendChild(style);
    
    // Show random error message
    function showRandomError() {
        const errors = [
            "Error: Ball trajectory calculation failed",
            "Warning: Physics engine unstable",
            "Error: Target position desynchronized",
            "Warning: Catapult overheating",
            "Error: Volume calibration failed",
            "System warning: Memory leak detected",
            "Error: Ball weight inconsistency",
            "Warning: Target stability compromised",
            "Error: Gravity fluctuation detected"
        ];
        
        const error = document.createElement('div');
        error.classList.add('error-message');
        error.textContent = errors[Math.floor(Math.random() * errors.length)];
        error.style.top = `${Math.random() * 80}%`;
        error.style.left = `${Math.random() * 80}%`;
        errorContainer.appendChild(error);
        
        setTimeout(() => {
            errorContainer.removeChild(error);
        }, 2000 + Math.random() * 1000);
    }
    
    // Toggle gravity direction
    function toggleGravity() {
        gravityReversed = !gravityReversed;
        puzzleSection.style.transform = gravityReversed ? 'rotate(180deg)' : 'rotate(0deg)';
        puzzleSection.style.transition = 'transform 0.5s';
        
        // Show message
        messageDisplay.textContent = gravityReversed ? "Gravity reversed!" : "Gravity normalized!";
        messageDisplay.style.color = gravityReversed ? '#00ff00' : '#ff5252';
        
        // Reset after a while
        if (gravityReversed) {
            setTimeout(() => {
                puzzleSection.style.transform = 'rotate(0deg)';
                gravityReversed = false;
                messageDisplay.textContent = "Gravity normalized!";
                messageDisplay.style.color = '#ff5252';
            }, 5000);
        }
    }
    
    // Start moving target randomly
    function startMovingTarget() {
        if (targetMoveInterval) clearInterval(targetMoveInterval);
        
        targetMoveInterval = setInterval(() => {
            if (Math.random() > 0.6 && rageMeter > 30) {
                const newTarget = Math.floor(Math.random() * 81) + 10;
                targetMarker.style.left = `${newTarget}%`;
                targetVolume = newTarget;
                
                // Flash the target to distract the player
                targetMarker.classList.add('target-flash');
                targetMarker.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                setTimeout(() => {
                    targetMarker.classList.remove('target-flash');
                    targetMarker.style.backgroundColor = '#ff5252';
                }, 600);
            }
        }, 4000);
    }
    
    // Start moving target
    startMovingTarget();
    
    function startCharging(e) {
        e.preventDefault();
        power = 0;
        
        // Randomly show error at start of charging
        if (Math.random() > 0.8) {
            showRandomError();
        }
        
        // Animate the arm pulling back
        powerInterval = setInterval(() => {
            // Sometimes make power inconsistent
            if (Math.random() > 0.9) {
                power -= Math.random() * 5;
                messageDisplay.textContent = "Power fluctuation detected!";
                messageDisplay.style.animation = 'flash 0.2s';
                setTimeout(() => {
                    messageDisplay.style.animation = '';
                }, 200);
            } else {
                power += 1 + (Math.random() * 0.5);
            }
            
            if (power > 90) power = 90;
            if (power < 0) power = 0;
            
            // Pull back the catapult arm (negative angle)
            const angle = -power;
            catapultArm.style.transform = `rotate(${angle}deg)`;
            
            // Update trajectory line if it exists
            if (trajectoryLine) {
                trajectoryLine.style.height = `${power}px`;
                trajectoryLine.style.transform = `rotate(${angle}deg)`;
                
                // Sometimes make trajectory line flicker
                if (Math.random() > 0.9) {
                    trajectoryLine.style.opacity = Math.random();
                    setTimeout(() => {
                        trajectoryLine.style.opacity = 1;
                    }, 100);
                }
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
        
        // Add significant randomness to make it frustrating
        const randomFactor = Math.random() * 0.6 - 0.3; // -0.3 to +0.3 (more randomness)
        volume = Math.min(100, Math.max(0, Math.round((powerFactor + randomFactor) * 100)));
        
        // Animate ball
        catapultBall.classList.add('flying');
        
        // Sometimes make ball spin
        if (Math.random() > 0.6) {
            catapultBall.classList.add('ball-spin');
        }
        
        // Calculate landing position based on volume percentage
        const barRect = volumeBar.getBoundingClientRect();
        const landingPosition = (volume / 100) * barRect.width;
        
        // Calculate trajectory with horizontal movement to fix straight upwards issue
        const distance = landingPosition;
        const height = -150 - (powerFactor * 50); // Higher power = higher arc
        
        // Add horizontal curve to the trajectory (fixes straight upwards issue)
        const horizontalCurve = Math.random() * 80 - 40; // Random curve between -40px and 40px (more extreme)
        
        // Create a more unpredictable path with cubic-bezier
        const bezierX1 = Math.random() * 0.6 + 0.2;
        const bezierY1 = Math.random() * 0.6;
        const bezierX2 = Math.random() * 0.6 + 0.4;
        const bezierY2 = Math.random() * 0.6 + 0.4;
        catapultBall.style.transition = `transform ${0.4 + Math.random() * 0.6}s cubic-bezier(${bezierX1}, ${bezierY1}, ${bezierX2}, ${bezierY2})`;
        
        // Launch the ball with horizontal curve
        catapultBall.style.transform = `translate(${distance + horizontalCurve}px, ${height}px)`;
        
        // Randomly move the target after launch to increase frustration
        if (Math.random() > 0.5) {
            setTimeout(() => {
                const newTarget = Math.floor(Math.random() * 81) + 10; // 10-90%
                targetMarker.style.left = `${newTarget}%`;
                targetVolume = newTarget;
                messageDisplay.textContent = "Target moved mid-flight!";
            }, 300);
        }
        
        // Randomly reverse gravity during flight
        if (Math.random() > 0.9 && rageMeter > 50) {
            setTimeout(() => {
                toggleGravity();
            }, 200);
        }
        
        // Update volume display after ball lands
        setTimeout(() => {
            // Remove ball spin if applied
            catapultBall.classList.remove('ball-spin');
            
            // Sometimes show incorrect volume to frustrate user
            const displayedVolume = Math.random() > 0.6 ? 
                Math.min(100, Math.max(0, volume + Math.floor(Math.random() * 30) - 15)) : 
                volume;
                
            volumeLevel.style.width = `${displayedVolume}%`;
            attempts++;
            
            // Update score and rage meter
            const difference = Math.abs(volume - targetVolume);
            const scoreElement = document.getElementById('score-value');
            const rageMeterElement = document.getElementById('rage-meter');
            
            // Calculate score change (negative for bad attempts)
            let scoreChange = 0;
            let message = '';
            
            if (difference <= 1) {
                scoreChange = 10;
                message = "Perfect! But don't get used to it...";
                rageMeter = Math.max(0, rageMeter - 5);
                
                // Sometimes don't give points anyway
                if (Math.random() > 0.7) {
                    scoreChange = 0;
                    message = "Perfect hit but no points awarded due to system error!";
                    rageMeter += 15;
                    showRandomError();
                }
            } else if (difference <= 5) {
                scoreChange = 2;
                message = "Close, but not quite there!";
                rageMeter += 5;
            } else if (difference <= 15) {
                scoreChange = -5;
                message = "Not even close! Try harder!";
                rageMeter += 10;
            } else {
                scoreChange = -10;
                message = "Terrible aim! Are you even trying?";
                rageMeter += 15;
                
                // Randomly shrink the target to make it harder
                if (Math.random() > 0.5) {
                    targetMarker.style.width = (parseInt(targetMarker.style.width || '10') - 1) + 'px';
                }
            }
            
            // Apply random penalties
            if (Math.random() > 0.6) { // Increased chance of penalties
                const penalties = [
                    "Oops! Your score was divided by 2 for no reason!",
                    "The game doesn't like you. -15 points!",
                    "Random tax applied: -20% of your score!",
                    "Your aim is getting worse. Next target will be smaller!",
                    "Server lag detected! Score calculation delayed...",
                    "Cosmic rays affected your score! -30%!",
                    "Score overflow error! Resetting to half value."
                ];
                
                const penaltyIndex = Math.floor(Math.random() * penalties.length);
                message = penalties[penaltyIndex];
                
                switch (penaltyIndex) {
                    case 0:
                        score = Math.floor(score / 2);
                        break;
                    case 1:
                        scoreChange -= 15;
                        break;
                    case 2:
                        score = Math.floor(score * 0.8);
                        break;
                    case 3:
                        targetMarker.style.width = '5px';
                        break;
                    case 4:
                        // Delay score update
                        setTimeout(() => {
                            score += scoreChange;
                            score = Math.max(0, score);
                            scoreElement.textContent = score;
                            messageDisplay.textContent = "Score finally updated!";
                        }, 5000);
                        scoreChange = 0; // Don't update now
                        break;
                    case 5:
                        score = Math.floor(score * 0.7);
                        break;
                    case 6:
                        score = Math.floor(score / 2);
                        break;
                }
                
                rageMeter += 10;
            }
            
            // Update score
            score += scoreChange;
            score = Math.max(0, score); // Don't go below 0
            scoreElement.textContent = score;
            
            // Sometimes flip score display
            if (Math.random() > 0.8 && rageMeter > 40) {
                scoreElement.style.transform = 'scaleX(-1)';
                setTimeout(() => {
                    scoreElement.style.transform = 'none';
                }, 2000);
            }
            
            // Update rage meter (capped at 100%)
            rageMeter = Math.min(100, rageMeter);
            rageMeterElement.textContent = rageMeter + '%';
            
            // Display message
            messageDisplay.textContent = message;
            
            // Make target move randomly if rage meter is high
            if (rageMeter > 50 && !targetShrinkInterval) {
                targetShrinkInterval = setInterval(() => {
                    const newTarget = Math.floor(Math.random() * 81) + 10;
                    targetMarker.style.left = `${newTarget}%`;
                    targetVolume = newTarget;
                    
                    // Flash the target to distract the player
                    targetMarker.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                    setTimeout(() => {
                        targetMarker.style.backgroundColor = '#ff5252';
                    }, 200);
                }, 3000);
            }
            
            // Make it harder to win - only show next button after more attempts or if extremely close
            if ((Math.abs(volume - targetVolume) <= 1 && score > 30) || attempts >= 10) {
                // Sometimes hide button again after showing it
                if (Math.random() > 0.7 && !puzzleNext.classList.contains('hidden')) {
                    setTimeout(() => {
                        puzzleNext.classList.add('hidden');
                        messageDisplay.textContent = "Next button disappeared! Try again!";
                        attempts -= 3; // Make them do more attempts
                    }, 1000);
                } else {
                    puzzleNext.classList.remove('hidden');
                    if (targetShrinkInterval) {
                        clearInterval(targetShrinkInterval);
                    }
                }
            }
            
            // Reset for another attempt with delay to frustrate user
            setTimeout(() => {
                catapultArm.style.transform = 'rotate(0deg)';
                catapultBall.classList.remove('flying');
                catapultBall.style.transform = '';
                catapultBall.style.transition = '';
                if (trajectoryLine) {
                    trajectoryLine.style.height = '0';
                }
                
                // Randomly disable the launch button temporarily
                if (Math.random() > 0.6 && rageMeter > 30) { // Increased chance of button jamming
                    launchButton.disabled = true;
                    launchButton.textContent = "Button jammed...";
                    setTimeout(() => {
                        launchButton.disabled = false;
                        launchButton.textContent = "Hold to launch";
                    }, Math.random() * 3000 + 1000); // Longer jam time
                }
                
                // Randomly show error
                if (Math.random() > 0.7) {
                    showRandomError();
                }
            }, Math.random() * 2000 + 800); // Longer random delay between 800ms and 2800ms
        }, 500);
    }
    
    puzzleNext.addEventListener('click', () => {
        // Sometimes don't proceed and just hide the button
        if (Math.random() > 0.7) {
            puzzleNext.classList.add('hidden');
            messageDisplay.textContent = "Just kidding! Try again!";
            attempts -= 2;
            return;
        }
        
        puzzleSection.classList.add('hidden');
        textSection.classList.remove('hidden');
        
        // Clear intervals
        if (targetShrinkInterval) clearInterval(targetShrinkInterval);
        if (targetMoveInterval) clearInterval(targetMoveInterval);
    });
    
    // Randomly show errors occasionally
    setInterval(() => {
        if (Math.random() > 0.8) {
            showRandomError();
        }
    }, 15000);
}

// Chaotic keyboard with rearranging keys
function initChaoticKeyboard() {
    const keyboardContainer = document.querySelector('.chaotic-keyboard');
    const textInput = document.getElementById('chaotic-input');
    const textNext = document.getElementById('text-next');
    const textSection = document.getElementById('text-section');
    const captchaSection = document.getElementById('captcha-section');
    
    // Create container for messages and timers
    const keyboardInfoContainer = document.createElement('div');
    keyboardInfoContainer.id = 'keyboard-info-container';
    keyboardInfoContainer.style.marginBottom = '15px';
    textSection.insertBefore(keyboardInfoContainer, keyboardContainer);
    
    // Create a target text display that changes
    const targetDisplay = document.createElement('div');
    targetDisplay.id = 'target-text';
    targetDisplay.innerHTML = 'Type: <span id="target-word">HELLO</span>';
    targetDisplay.style.marginBottom = '10px';
    targetDisplay.style.fontWeight = 'bold';
    keyboardInfoContainer.appendChild(targetDisplay);
    
    // Create a message display
    const messageDisplay = document.createElement('div');
    messageDisplay.id = 'keyboard-message';
    messageDisplay.style.color = 'red';
    messageDisplay.style.marginBottom = '10px';
    messageDisplay.style.fontWeight = 'bold';
    messageDisplay.style.minHeight = '20px';
    keyboardInfoContainer.appendChild(messageDisplay);
    
    // Create a timer display
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'keyboard-timer';
    timerDisplay.innerHTML = 'Time remaining: <span id="keyboard-time">30</span>s';
    timerDisplay.style.marginBottom = '10px';
    timerDisplay.style.fontWeight = 'bold';
    keyboardInfoContainer.appendChild(timerDisplay);
    
    // List of target words
    const targetWords = ['HELLO', 'WORLD', 'JAVASCRIPT', 'KEYBOARD', 'ANNOYING', 'CAPTCHA', 'PUZZLE', 'BUTTON', 'TYPING', 'FRUSTRATING'];
    let currentTarget = targetWords[0];
    
    // Set up timer
    let timeLeft = 30;
    const timerInterval = setInterval(() => {
        // Randomly change the timer
        if (Math.random() > 0.8) {
            const change = Math.floor(Math.random() * 6) - 3;
            timeLeft += change;
            if (change < 0) {
                messageDisplay.textContent = "Time penalty applied!";
                messageDisplay.style.color = 'red';
            } else if (change > 0) {
                messageDisplay.textContent = "Time bonus granted!";
                messageDisplay.style.color = 'green';
            }
            
            setTimeout(() => {
                messageDisplay.textContent = "";
            }, 1500);
        }
        
        // Randomly change the target word
        if (Math.random() > 0.85) {
            currentTarget = targetWords[Math.floor(Math.random() * targetWords.length)];
            document.getElementById('target-word').textContent = currentTarget;
            messageDisplay.textContent = "Target changed!";
            messageDisplay.style.color = 'orange';
            setTimeout(() => {
                messageDisplay.textContent = "";
            }, 1500);
        }
        
        timeLeft--;
        document.getElementById('keyboard-time').textContent = timeLeft;
        
        // If time runs out, reset everything
        if (timeLeft <= 0) {
            timeLeft = 30;
            textInput.value = '';
            
            // Show message
            messageDisplay.textContent = "Time's up! Starting over...";
            messageDisplay.style.color = 'red';
            
            // Hide next button
            textNext.classList.add('hidden');
            
            // Change target word
            currentTarget = targetWords[Math.floor(Math.random() * targetWords.length)];
            document.getElementById('target-word').textContent = currentTarget;
            
            setTimeout(() => {
                messageDisplay.textContent = "";
            }, 2000);
        }
    }, 1000);
    
    // Add special characters and emojis to make it more confusing
    const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:"<>?~'.split('');
    const emojis = ['😡', '😱', '🤬', '😈', '👹', '💀', '👻', '👽', '🤖', '🎃'];
    
    // Add emojis to the keys
    emojis.forEach(emoji => {
        keys.push(emoji);
    });
    
    // Create keyboard
    keys.forEach(key => {
        const keyElement = document.createElement('div');
        keyElement.classList.add('key');
        keyElement.textContent = key;
        keyboardContainer.appendChild(keyElement);
        
        // Randomly make some keys sticky (need double click)
        if (Math.random() > 0.7) {
            keyElement.dataset.sticky = 'true';
            keyElement.style.backgroundColor = '#ddd';
        }
        
        // Randomly make some keys move on hover
        if (Math.random() > 0.7) {
            keyElement.addEventListener('mouseover', () => {
                if (Math.random() > 0.5) {
                    const x = Math.random() * 50 - 25;
                    const y = Math.random() * 50 - 25;
                    keyElement.style.transform = `translate(${x}px, ${y}px)`;
                    setTimeout(() => {
                        keyElement.style.transform = '';
                    }, 500);
                }
            });
        }
        
        keyElement.addEventListener('click', () => {
            // Check if key is sticky
            if (keyElement.dataset.sticky === 'true') {
                keyElement.dataset.sticky = 'false';
                keyElement.style.backgroundColor = '';
                messageDisplay.textContent = "Key unstuck! Click again to use.";
                messageDisplay.style.color = 'blue';
                setTimeout(() => {
                    messageDisplay.textContent = "";
                }, 1500);
                return;
            }
            
            // Sometimes don't add the key that was clicked
            if (Math.random() > 0.7) {
                const randomKey = keys[Math.floor(Math.random() * keys.length)];
                textInput.value += randomKey;
                messageDisplay.textContent = "Oops! Wrong key pressed!";
                messageDisplay.style.color = 'red';
            } else {
                textInput.value += key;
            }
            
            // Sometimes add extra characters
            if (Math.random() > 0.6) {
                const extraCount = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < extraCount; i++) {
                    const randomKey = keys[Math.floor(Math.random() * keys.length)];
                    textInput.value += randomKey;
                }
                messageDisplay.textContent = "Key bounce detected!";
                messageDisplay.style.color = 'orange';
            }
            
            setTimeout(() => {
                messageDisplay.textContent = "";
            }, 1500);
            
            // Randomly rearrange keyboard
            if (Math.random() > 0.4) { // Increased chance of shuffling
                shuffleKeyboard();
                messageDisplay.textContent = "Keyboard recalibrated!";
                messageDisplay.style.color = 'purple';
                setTimeout(() => {
                    messageDisplay.textContent = "";
                }, 1500);
            }
            
            // Randomly clear input
            if (Math.random() > 0.9) {
                textInput.value = '';
                messageDisplay.textContent = "Input buffer overflow! Cleared.";
                messageDisplay.style.color = 'red';
                setTimeout(() => {
                    messageDisplay.textContent = "";
                }, 1500);
            }
            
            // Check if input matches target
            if (textInput.value.includes(currentTarget)) {
                // Change target and clear input
                currentTarget = targetWords[Math.floor(Math.random() * targetWords.length)];
                document.getElementById('target-word').textContent = currentTarget;
                textInput.value = '';
                messageDisplay.textContent = "Target matched! New target assigned.";
                messageDisplay.style.color = 'green';
                setTimeout(() => {
                    messageDisplay.textContent = "";
                }, 1500);
            }
            
            // Show next button when input has at least 5 characters
            if (textInput.value.length >= 5) {
                // Sometimes hide the button again
                if (Math.random() > 0.8 && !textNext.classList.contains('hidden')) {
                    textNext.classList.add('hidden');
                    messageDisplay.textContent = "Verification failed! Keep typing.";
                    messageDisplay.style.color = 'red';
                    setTimeout(() => {
                        messageDisplay.textContent = "";
                    }, 1500);
                } else {
                    textNext.classList.remove('hidden');
                }
            }
        });
    });
    
    // Add CSS for key animations
    const style = document.createElement('style');
    style.textContent = `
        .key {
            transition: transform 0.3s, background-color 0.3s;
            position: relative;
        }
        
        .key:hover {
            z-index: 10;
        }
        
        @keyframes shake {
            0%, 100% { transform: translate(0, 0); }
            10%, 30%, 50%, 70%, 90% { transform: translate(-2px, 0); }
            20%, 40%, 60%, 80% { transform: translate(2px, 0); }
        }
        
        .shake-keyboard {
            animation: shake 0.5s;
        }
    `;
    document.head.appendChild(style);
    
    // Shuffle keyboard initially
    shuffleKeyboard();
    
    function shuffleKeyboard() {
        keyboardContainer.classList.add('shake-keyboard');
        setTimeout(() => {
            keyboardContainer.classList.remove('shake-keyboard');
        }, 500);
        
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
            // Randomly resize some keys
            if (Math.random() > 0.8) {
                const size = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
                key.style.transform = `scale(${size})`;
            } else {
                key.style.transform = '';
            }
            
            keyboardContainer.appendChild(key);
        });
    }
    
    // Randomly shuffle keyboard at intervals
    setInterval(() => {
        if (Math.random() > 0.7 && !textSection.classList.contains('hidden')) {
            shuffleKeyboard();
            messageDisplay.textContent = "Automatic keyboard recalibration!";
            messageDisplay.style.color = 'purple';
            setTimeout(() => {
                messageDisplay.textContent = "";
            }, 1500);
        }
    }, 5000);
    
    // Prevent normal keyboard input and replace with random characters
    textInput.addEventListener('keydown', (e) => {
        e.preventDefault();
        
        if (e.key === 'Backspace') {
            // Sometimes delete more characters than expected
            if (Math.random() > 0.7) {
                const deleteCount = Math.floor(Math.random() * 5) + 1;
                textInput.value = textInput.value.slice(0, -deleteCount);
                messageDisplay.textContent = "Multiple characters deleted!";
                messageDisplay.style.color = 'orange';
            } else {
                textInput.value = textInput.value.slice(0, -1);
            }
            
            setTimeout(() => {
                messageDisplay.textContent = "";
            }, 1500);
            return;
        }
        
        if (e.key.length === 1) {
            // Add a random character instead
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            textInput.value += randomKey;
            
            // Sometimes add extra characters
            if (Math.random() > 0.6) {
                const extraCount = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < extraCount; i++) {
                    const randomKey = keys[Math.floor(Math.random() * keys.length)];
                    textInput.value += randomKey;
                }
                messageDisplay.textContent = "Key bounce detected!";
                messageDisplay.style.color = 'orange';
                setTimeout(() => {
                    messageDisplay.textContent = "";
                }, 1500);
            }
            
            // Randomly rearrange keyboard
            if (Math.random() > 0.6) {
                shuffleKeyboard();
                messageDisplay.textContent = "Keyboard recalibrated!";
                messageDisplay.style.color = 'purple';
                setTimeout(() => {
                    messageDisplay.textContent = "";
                }, 1500);
            }
            
            // Check if input matches target
            if (textInput.value.includes(currentTarget)) {
                // Change target and clear input
                currentTarget = targetWords[Math.floor(Math.random() * targetWords.length)];
                document.getElementById('target-word').textContent = currentTarget;
                textInput.value = '';
                messageDisplay.textContent = "Target matched! New target assigned.";
                messageDisplay.style.color = 'green';
                setTimeout(() => {
                    messageDisplay.textContent = "";
                }, 1500);
            }
            
            // Show next button when input has at least 5 characters
            if (textInput.value.length >= 5) {
                // Sometimes hide the button again
                if (Math.random() > 0.8 && !textNext.classList.contains('hidden')) {
                    textNext.classList.add('hidden');
                    messageDisplay.textContent = "Verification failed! Keep typing.";
                    messageDisplay.style.color = 'red';
                    setTimeout(() => {
                        messageDisplay.textContent = "";
                    }, 1500);
                } else {
                    textNext.classList.remove('hidden');
                }
            }
        }
    });
    
    // Next button
    textNext.addEventListener('click', () => {
        // Sometimes don't proceed
        if (Math.random() > 0.7) {
            textInput.value = '';
            textNext.classList.add('hidden');
            messageDisplay.textContent = "Session expired! Try again.";
            messageDisplay.style.color = 'red';
            setTimeout(() => {
                messageDisplay.textContent = "";
            }, 1500);
            return;
        }
        
        // Clear interval
        clearInterval(timerInterval);
        
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
    
    // Add instructions that change
    const captchaInstructions = document.createElement('div');
    captchaInstructions.classList.add('captcha-instructions');
    captchaInstructions.innerHTML = '<h3>Select all images that contain a FIRE HYDRANT</h3>';
    captchaInstructions.style.marginBottom = '15px';
    captchaInstructions.style.fontWeight = 'bold';
    captchaInstructions.style.color = '#ff0000';
    captchaSection.insertBefore(captchaInstructions, captchaContainer);
    
    // Create a timer that changes the instructions randomly
    const instructions = [
        'Select all images that contain a FIRE HYDRANT',
        'Select all images that contain a TRAFFIC LIGHT',
        'Select all images that contain a BICYCLE',
        'Select all images that contain a BUS',
        'Select all images that contain a CROSSWALK',
        'Select all images that contain a CAR',
        'Select all images with STAIRS',
        'Select all images with MOUNTAINS',
        'Select all images with SUSPICIOUS ACTIVITY'
    ];
    
    setInterval(() => {
        const newInstruction = instructions[Math.floor(Math.random() * instructions.length)];
        captchaInstructions.innerHTML = `<h3>Select all images that contain a ${newInstruction.split(' ').pop()}</h3>`;
    }, 3000); // Change every 3 seconds
    
    const suspiciousImages = [
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23333"/><text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">Suspicious Image 1</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23f00"/><text x="50" y="50" font-family="Arial" font-size="10" fill="white" text-anchor="middle" dominant-baseline="middle">NOT SUSPICIOUS</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="%230f0"/><text x="50" y="60" font-family="Arial" font-size="10" fill="black" text-anchor="middle" dominant-baseline="middle">Click Me</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2300f"/><text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">DEFINITELY CLICK</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23ff0"/><text x="50" y="50" font-family="Arial" font-size="10" fill="black" text-anchor="middle" dominant-baseline="middle">WARNING</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f"/><text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">DO NOT CLICK</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="%23000" stroke="%23fff" stroke-width="2"/><text x="50" y="50" font-family="Arial" font-size="10" fill="white" text-anchor="middle" dominant-baseline="middle">SYSTEM ERROR</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23f90"/><text x="50" y="50" font-family="Arial" font-size="10" fill="black" text-anchor="middle" dominant-baseline="middle">CLICK 3 TIMES</text></svg>',
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%2309f"/><text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">LOADING...</text></svg>'
    ];
    
    // Clear existing images
    captchaContainer.innerHTML = '';
    
    // Create 9 "suspicious" images
    for (let i = 0; i < 9; i++) {
        const imageElement = document.createElement('div');
        imageElement.classList.add('captcha-image');
        
        // Use SVG images
        const img = document.createElement('img');
        img.src = suspiciousImages[i];
        img.style.width = '100%';
        img.style.height = '100%';
        imageElement.appendChild(img);
        
        captchaContainer.appendChild(imageElement);
        
        // Toggle selection on click
        imageElement.addEventListener('click', () => {
            // Sometimes don't select or unselect randomly
            if (Math.random() > 0.7) {
                // Do nothing or select a different random image
                if (Math.random() > 0.5) {
                    const randomIndex = Math.floor(Math.random() * 9);
                    const randomImage = captchaContainer.children[randomIndex];
                    randomImage.classList.toggle('selected');
                }
            } else {
                imageElement.classList.toggle('selected');
            }
            
            // Check if at least 3 images are selected
            const selectedImages = document.querySelectorAll('.captcha-image.selected');
            
            // Randomly decide if the next button should appear
            if (selectedImages.length >= 3) {
                if (Math.random() > 0.3) {
                    captchaNext.classList.remove('hidden');
                } else {
                    // Sometimes hide the button even if enough are selected
                    captchaNext.classList.add('hidden');
                    
                    // Show a message
                    const errorMsg = document.createElement('div');
                    errorMsg.textContent = "Invalid selection. Please try again.";
                    errorMsg.style.color = 'red';
                    errorMsg.style.marginTop = '10px';
                    errorMsg.style.fontWeight = 'bold';
                    
                    // Remove any existing error messages
                    const existingError = captchaSection.querySelector('.captcha-error');
                    if (existingError) {
                        captchaSection.removeChild(existingError);
                    }
                    
                    errorMsg.classList.add('captcha-error');
                    captchaSection.appendChild(errorMsg);
                    
                    // Unselect all images after a delay
                    setTimeout(() => {
                        document.querySelectorAll('.captcha-image.selected').forEach(img => {
                            img.classList.remove('selected');
                        });
                        
                        // Remove error message
                        if (captchaSection.contains(errorMsg)) {
                            captchaSection.removeChild(errorMsg);
                        }
                    }, 2000);
                }
            } else {
                captchaNext.classList.add('hidden');
            }
        });
        
        // Make images move slightly on hover
        imageElement.addEventListener('mouseover', () => {
            if (Math.random() > 0.5) {
                const x = Math.random() * 10 - 5;
                const y = Math.random() * 10 - 5;
                imageElement.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
        
        imageElement.addEventListener('mouseout', () => {
            imageElement.style.transform = 'translate(0, 0)';
        });
    }
    
    // Sometimes shuffle the images
    setInterval(() => {
        if (Math.random() > 0.7) {
            const images = Array.from(captchaContainer.children);
            captchaContainer.innerHTML = '';
            
            // Fisher-Yates shuffle
            for (let i = images.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [images[i], images[j]] = [images[j], images[i]];
            }
            
            images.forEach(img => {
                captchaContainer.appendChild(img);
            });
        }
    }, 5000);
    
    captchaNext.addEventListener('click', () => {
        // 30% chance to not proceed and reset the captcha
        if (Math.random() > 0.7) {
            // Reset captcha
            document.querySelectorAll('.captcha-image.selected').forEach(img => {
                img.classList.remove('selected');
            });
            
            captchaNext.classList.add('hidden');
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.textContent = "Verification failed. Please try again.";
            errorMsg.style.color = 'red';
            errorMsg.style.marginTop = '10px';
            errorMsg.style.fontWeight = 'bold';
            
            // Remove any existing error messages
            const existingError = captchaSection.querySelector('.captcha-error');
            if (existingError) {
                captchaSection.removeChild(existingError);
            }
            
            errorMsg.classList.add('captcha-error');
            captchaSection.appendChild(errorMsg);
            
            // Remove error message after a delay
            setTimeout(() => {
                if (captchaSection.contains(errorMsg)) {
                    captchaSection.removeChild(errorMsg);
                }
            }, 3000);
        } else {
            captchaSection.classList.add('hidden');
            finalSection.classList.remove('hidden');
        }
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
        if (document.querySelector('.volume-value')) {
            document.querySelector('.volume-value').textContent = '50%';
        }
    });
}

// Visual distractions function
function initVisualDistractions() {
    // Create floating distractions that appear randomly
    const container = document.querySelector('.container');
    
    // Create cursor follower (fake cursor that follows real cursor with delay)
    const fakeCursor = document.createElement('div');
    fakeCursor.classList.add('fake-cursor');
    fakeCursor.style.position = 'absolute';
    fakeCursor.style.width = '20px';
    fakeCursor.style.height = '20px';
    fakeCursor.style.borderRadius = '50%';
    fakeCursor.style.backgroundColor = 'rgba(255, 82, 82, 0.5)';
    fakeCursor.style.pointerEvents = 'none';
    fakeCursor.style.zIndex = '9999';
    fakeCursor.style.transition = 'transform 0.1s linear';
    document.body.appendChild(fakeCursor);
    
    // Create multiple fake cursors for extra annoyance
    for (let i = 0; i < 3; i++) {
        const extraCursor = document.createElement('div');
        extraCursor.classList.add('fake-cursor');
        extraCursor.style.position = 'absolute';
        extraCursor.style.width = '20px';
        extraCursor.style.height = '20px';
        extraCursor.style.borderRadius = '50%';
        extraCursor.style.backgroundColor = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
        extraCursor.style.pointerEvents = 'none';
        extraCursor.style.zIndex = '9999';
        extraCursor.style.transition = 'transform 0.1s linear';
        document.body.appendChild(extraCursor);
        
        document.addEventListener('mousemove', (e) => {
            setTimeout(() => {
                extraCursor.style.transform = `translate(${e.clientX + (Math.random() * 40 - 20)}px, ${e.clientY + (Math.random() * 40 - 20)}px)`;
            }, 100 + (i * 150)); // Different delays for each cursor
        });
    }
    
    // Add CSS for fake notifications and other visual distractions
    const style = document.createElement('style');
    style.textContent = `
        .fake-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: white;
            border-left: 4px solid #ff5252;
            padding: 10px 15px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease, slideOut 0.3s ease 3s forwards;
            max-width: 300px;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); }
            to { transform: translateX(100%); }
        }
        
        .screen-shake {
            animation: shake 0.5s linear;
        }
        
        @keyframes shake {
            0% { transform: translate(0, 0); }
            10% { transform: translate(-5px, -5px); }
            20% { transform: translate(5px, 5px); }
            30% { transform: translate(-5px, 5px); }
            40% { transform: translate(5px, -5px); }
            50% { transform: translate(-5px, 0); }
            60% { transform: translate(5px, 0); }
            70% { transform: translate(0, 5px); }
            80% { transform: translate(0, -5px); }
            90% { transform: translate(-5px, 0); }
            100% { transform: translate(0, 0); }
        }
        
        .violent-shake {
            animation: violent-shake 0.8s linear;
        }
        
        @keyframes violent-shake {
            0%, 100% { transform: translate(0, 0) rotate(0); }
            10% { transform: translate(-10px, -10px) rotate(-5deg); }
            20% { transform: translate(10px, 10px) rotate(5deg); }
            30% { transform: translate(-15px, 5px) rotate(-10deg); }
            40% { transform: translate(15px, -5px) rotate(10deg); }
            50% { transform: translate(-10px, -15px) rotate(-5deg); }
            60% { transform: translate(10px, 15px) rotate(5deg); }
            70% { transform: translate(-15px, 10px) rotate(-10deg); }
            80% { transform: translate(15px, -10px) rotate(10deg); }
            90% { transform: translate(-10px, 5px) rotate(-5deg); }
        }
        
        .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .popup-content {
            background: white;
            padding: 20px;
            border-radius: 5px;
            max-width: 80%;
            position: relative;
            animation: popup-bounce 0.5s;
        }
        
        @keyframes popup-bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-30px);}
            60% {transform: translateY(-15px);}
        }
    `;
    document.head.appendChild(style);
    
    // Track mouse movement for fake cursor
    document.addEventListener('mousemove', (e) => {
        setTimeout(() => {
            fakeCursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        }, 100); // Delayed follow
    });
    
    // Show random fake notifications with increased frequency
    setInterval(() => {
        if (Math.random() > 0.5) { // Increased frequency
            const messages = [
                "Your session will expire in 10 seconds",
                "Update available! Click to install",
                "Your progress is not being saved",
                "Connection unstable. Game may reset",
                "New high score achieved by another player!",
                "Your account has been flagged for suspicious activity",
                "⚠️ VIRUS DETECTED! Click to scan now!",
                "Your browser is outdated. Update required!",
                "⚠️ WARNING: Your data is being tracked",
                "Memory leak detected! Close tabs now!",
                "Internet connection unstable",
                "Battery critically low: 5% remaining"
            ];
            
            const notification = document.createElement('div');
            notification.classList.add('fake-notification');
            notification.textContent = messages[Math.floor(Math.random() * messages.length)];
            document.body.appendChild(notification);
            
            // Random position on screen
            const position = Math.floor(Math.random() * 4);
            if (position === 0) {
                notification.style.bottom = 'auto';
                notification.style.top = '20px';
                notification.style.right = 'auto';
                notification.style.left = `${Math.random() * 60}%`;
            } else if (position === 1) {
                notification.style.bottom = 'auto';
                notification.style.top = `${Math.random() * 60}%`;
                notification.style.right = '20px';
                notification.style.left = 'auto';
            } else if (position === 2) {
                notification.style.bottom = '20px';
                notification.style.top = 'auto';
                notification.style.right = 'auto';
                notification.style.left = `${Math.random() * 60}%`;
            } else {
                notification.style.bottom = 'auto';
                notification.style.top = `${Math.random() * 60}%`;
                notification.style.right = 'auto';
                notification.style.left = '20px';
            }
            
            // Remove after animation completes
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3500);
        }
    }, 5000); // Increased frequency to every 5 seconds
    
    // Random screen shake with increased intensity
    setInterval(() => {
        if (Math.random() > 0.6) { // Increased frequency
            const intensity = Math.random() > 0.7 ? 'violent-shake' : 'screen-shake';
            container.classList.add(intensity);
            setTimeout(() => {
                container.classList.remove(intensity);
            }, 800); // Longer shake duration
        }
    }, 8000); // More frequent shaking
}

// Annoying popups function
function initAnnoyingPopups() {
    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.id = 'popup-container';
    document.body.appendChild(popupContainer);
    
    // Add CSS for popups
    const style = document.createElement('style');
    style.textContent = `
        .annoying-popup {
            position: fixed;
            background: white;
            border: 3px solid #ff0000;
            padding: 20px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            max-width: 80%;
            max-height: 80%;
            overflow: auto;
            animation: popup-bounce 0.5s;
        }
        
        .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ccc;
        }
        
        .popup-title {
            font-weight: bold;
            font-size: 18px;
            color: #ff0000;
        }
        
        .popup-close-btn {
            background: #ff0000;
            color: white;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .popup-close-btn:hover {
            transform: scale(0.9);
        }
        
        .popup-content {
            margin-bottom: 15px;
        }
        
        .popup-buttons {
            display: flex;
            justify-content: space-between;
        }
        
        .popup-btn {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .popup-btn-primary {
            background: #4CAF50;
            color: white;
        }
        
        .popup-btn-secondary {
            background: #f44336;
            color: white;
        }
        
        .moving-popup {
            animation: move-around 5s infinite;
        }
        
        @keyframes move-around {
            0% { transform: translate(0, 0); }
            25% { transform: translate(50px, 20px); }
            50% { transform: translate(0, 40px); }
            75% { transform: translate(-50px, 20px); }
            100% { transform: translate(0, 0); }
        }
    `;
    document.head.appendChild(style);
}

function showRandomPopup() {
    const popups = [
        {
            title: "CONGRATULATIONS!",
            content: "You've won a FREE iPhone 15! Click 'Claim Now' to receive your prize!",
            primaryBtn: "Claim Now",
            secondaryBtn: "No Thanks",
            type: "scam"
        },
        {
            title: "WARNING!",
            content: "Your computer has 39 VIRUSES! Click 'Remove Now' to clean your system!",
            primaryBtn: "Remove Now",
            secondaryBtn: "Ignore (Not Recommended)",
            type: "virus"
        },
        {
            title: "SURVEY",
            content: "Please take a moment to rate your experience. We value your feedback!",
            primaryBtn: "Start Survey",
            secondaryBtn: "Maybe Later",
            type: "survey"
        },
        {
            title: "BROWSER UPDATE REQUIRED",
            content: "Your browser is outdated and poses security risks. Update now to continue safely.",
            primaryBtn: "Update Now",
            secondaryBtn: "Remind Me Later",
            type: "update"
        },
        {
            title: "SUBSCRIPTION EXPIRING",
            content: "Your premium subscription will expire in 24 hours. Renew now to avoid interruption!",
            primaryBtn: "Renew Now",
            secondaryBtn: "Cancel Subscription",
            type: "subscription"
        },
        {
            title: "COOKIE POLICY",
            content: "We use cookies to enhance your experience. Please accept our cookie policy to continue.",
            primaryBtn: "Accept All",
            secondaryBtn: "Customize Settings",
            type: "cookie"
        },
        {
            title: "LIMITED TIME OFFER",
            content: "50% OFF all products for the next 10 minutes! Don't miss out!",
            primaryBtn: "Shop Now",
            secondaryBtn: "No Thanks",
            type: "offer"
        },
        {
            title: "ACCOUNT VERIFICATION",
            content: "For security reasons, please verify your account to continue using our services.",
            primaryBtn: "Verify Now",
            secondaryBtn: "Later",
            type: "verification"
        }
    ];
    
    const selectedPopup = popups[Math.floor(Math.random() * popups.length)];
    
    // Create popup element
    const popup = document.createElement('div');
    popup.classList.add('annoying-popup');
    
    // Random position
    popup.style.top = `${Math.random() * 60 + 10}%`;
    popup.style.left = `${Math.random() * 60 + 10}%`;
    
    // Add moving animation to some popups
    if (Math.random() > 0.7) {
        popup.classList.add('moving-popup');
    }
    
    // Create popup content
    popup.innerHTML = `
        <div class="popup-header">
            <div class="popup-title">${selectedPopup.title}</div>
            <button class="popup-close-btn">✕</button>
        </div>
        <div class="popup-content">${selectedPopup.content}</div>
        <div class="popup-buttons">
            <button class="popup-btn popup-btn-primary">${selectedPopup.primaryBtn}</button>
            <button class="popup-btn popup-btn-secondary">${selectedPopup.secondaryBtn}</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(popup);
    
    // Add event listeners
    const closeBtn = popup.querySelector('.popup-close-btn');
    const primaryBtn = popup.querySelector('.popup-btn-primary');
    const secondaryBtn = popup.querySelector('.popup-btn-secondary');
    
    // Make close button move away from cursor sometimes
    closeBtn.addEventListener('mouseover', (e) => {
        if (Math.random() > 0.5) {
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = `${Math.random() * 100}%`;
            closeBtn.style.left = `${Math.random() * 100}%`;
        }
    });
    
    // Close button functionality
    closeBtn.addEventListener('click', () => {
        // Sometimes don't close, just move the popup
        if (Math.random() > 0.7) {
            popup.style.top = `${Math.random() * 60 + 10}%`;
            popup.style.left = `${Math.random() * 60 + 10}%`;
        } else {
            document.body.removeChild(popup);
            // Sometimes show another popup immediately
            if (Math.random() > 0.5) {
                setTimeout(showRandomPopup, 500);
            }
        }
    });
    
    // Primary button functionality
    primaryBtn.addEventListener('click', () => {
        document.body.removeChild(popup);
        // Show another popup as a "response"
        setTimeout(showRandomPopup, 500);
    });
    
    // Secondary button functionality
    secondaryBtn.addEventListener('click', () => {
        // Sometimes don't close, just move the popup
        if (Math.random() > 0.5) {
            popup.style.top = `${Math.random() * 60 + 10}%`;
            popup.style.left = `${Math.random() * 60 + 10}%`;
            // Change the text to be more insistent
            secondaryBtn.textContent = "PLEASE CLICK " + primaryBtn.textContent;
        } else {
            document.body.removeChild(popup);
        }
    });
    
    // Auto-close after some time (but sometimes show another one)
    setTimeout(() => {
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
            if (Math.random() > 0.7) {
                setTimeout(showRandomPopup, 1000);
            }
        }
    }, 10000);
}