// Bitcoin Defender - Main Game JavaScript
// A retro space shooter game with Bitcoin educational elements

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 7; // Increased from 5 for better responsiveness
const BULLET_SPEED = 10; // Increased from 7 for faster bullets
const ENEMY_SPEED_MIN = 1.5; // Slightly increased for better challenge
const ENEMY_SPEED_MAX = 3.5; // Slightly increased for better challenge
const POWERUP_SPEED = 2.5; // Slightly increased
const SPAWN_RATE = 60; // Frames between enemy spawns
const POWERUP_SPAWN_RATE = 300; // Frames between powerup spawns
const SHOOTING_INTERVAL = 10; // Reduced from 30 for much faster shooting
const SHOOTING_INTERVAL_POWERED = 5; // Reduced from 12 for lightning powerup

// Game variables
let canvas, ctx;
let gameActive = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let level = 1;
let frameCount = 0;
let levelFrameCount = 0;
let highScore = localStorage.getItem('bitcoinDefenderHighScore') || 0;
let soundEnabled = true;
let isMobileDevice = false;
let lastShootTime = 0;

// Game objects
let player = {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
    speed: PLAYER_SPEED,
    isInvincible: false,
    invincibilityTime: 0
};

let bullets = [];
let enemies = [];
let powerups = [];
let explosions = [];

// Touch tracking for smoother mobile controls
let touchStartX = 0;
let touchMoveX = 0;
let isTouching = false;
let isShooting = false;

// Power-up effects
let powerupEffects = {
    lightningNetwork: {
        active: false,
        duration: 0,
        maxDuration: 300 // 5 seconds at 60fps
    },
    miningRig: {
        active: false,
        duration: 0,
        maxDuration: 180 // 3 seconds at 60fps
    },
    satoshiWisdom: {
        active: false,
        duration: 0,
        maxDuration: 600 // 10 seconds at 60fps
    },
    nodeBooster: {
        active: false,
        duration: 0,
        maxDuration: 420 // 7 seconds at 60fps
    }
};

// Game assets
const assets = {
    player: new Image(),
    bullet: new Image(),
    enemies: {
        inflation: new Image(),
        fud: new Image(),
        bank: new Image(),
        regulation: new Image(),
        altcoin: new Image()
    },
    powerups: {
        lightning: new Image(),
        hardware: new Image(),
        mining: new Image(),
        satoshi: new Image(),
        node: new Image()
    },
    background: new Image()
};

// Educational content
const bitcoinFacts = [
    "Bitcoin has a fixed supply of 21 million coins, making it scarce like gold.",
    "Bitcoin transactions are verified by a decentralized network of computers around the world.",
    "The smallest unit of Bitcoin is called a 'satoshi' - there are 100 million satoshis in 1 Bitcoin.",
    "Bitcoin's blockchain is a public ledger that records all transactions transparently.",
    "Bitcoin was created in 2009 as a response to the financial crisis."
];

const enemyFacts = {
    inflation: "Inflation devalues fiat currency over time, while Bitcoin has a fixed supply.",
    fud: "Don't let FUD (Fear, Uncertainty, Doubt) affect your Bitcoin decisions.",
    bank: "Bitcoin removes the need for centralized financial institutions.",
    regulation: "Bitcoin operates globally despite varying regulations.",
    altcoin: "Bitcoin was the first cryptocurrency and remains the most secure."
};

const powerupFacts = {
    lightning: "Lightning Network enables fast Bitcoin transactions with minimal fees.",
    hardware: "Hardware wallets are the most secure way to store Bitcoin.",
    mining: "Mining secures the Bitcoin network through proof-of-work.",
    satoshi: "Satoshi Nakamoto created Bitcoin in 2009.",
    node: "Running a node helps decentralize the Bitcoin network."
};

// Initialize game
function init() {
    // Set up canvas
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Load assets
    assets.player.src = 'assets/bitcoin_ship.png';
    assets.bullet.src = 'assets/blockchain_bullet.png';
    assets.enemies.inflation.src = 'assets/inflation_monster.png';
    assets.enemies.fud.src = 'assets/fud_cloud.png';
    assets.enemies.bank.src = 'assets/bank_enemy.png';
    assets.enemies.regulation.src = 'assets/regulation_barrier.png';
    assets.enemies.altcoin.src = 'assets/altcoin_enemy.png';
    assets.powerups.lightning.src = 'assets/lightning_powerup.png';
    assets.powerups.hardware.src = 'assets/hardware_wallet.png';
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize player position
    resetPlayer();
    
    // Show start screen
    showScreen('start-screen');
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Button controls
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('continue-button').addEventListener('click', continueToNextLevel);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    document.getElementById('resume-button').addEventListener('click', togglePause);
    document.getElementById('restart-button').addEventListener('click', restartGame);
    document.getElementById('restart-button-end').addEventListener('click', restartGame);
    document.getElementById('restart-button-victory').addEventListener('click', restartGame);
    document.getElementById('menu-button-end').addEventListener('click', goToMainMenu);
    document.getElementById('menu-button-victory').addEventListener('click', goToMainMenu);
    document.getElementById('sound-toggle').addEventListener('change', toggleSound);
    
    // Mobile controls
    setupMobileControls();
    
    // Check if device is mobile
    checkMobileDevice();
    
    // Window resize
    window.addEventListener('resize', handleResize);
    handleResize();
}

// Handle keyboard input
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    ' ': false // Spacebar
};

function handleKeyDown(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
}

// Mobile controls setup - improved for better responsiveness
function setupMobileControls() {
    const moveLeft = document.getElementById('move-left');
    const moveRight = document.getElementById('move-right');
    const shootButton = document.getElementById('shoot-button');
    
    // Touch events for movement with improved tracking
    moveLeft.addEventListener('touchstart', (e) => { 
        keys.ArrowLeft = true; 
        touchStartX = e.touches[0].clientX;
        isTouching = true;
        e.preventDefault();
    });
    
    moveLeft.addEventListener('touchend', () => { 
        keys.ArrowLeft = false; 
        isTouching = false;
    });
    
    moveRight.addEventListener('touchstart', (e) => { 
        keys.ArrowRight = true; 
        touchStartX = e.touches[0].clientX;
        isTouching = true;
        e.preventDefault();
    });
    
    moveRight.addEventListener('touchend', () => { 
        keys.ArrowRight = false; 
        isTouching = false;
    });
    
    // Continuous shooting for mobile
    shootButton.addEventListener('touchstart', (e) => { 
        isShooting = true;
        e.preventDefault();
    });
    
    shootButton.addEventListener('touchend', () => { 
        isShooting = false;
    });
    
    // Add touch move for smoother control
    document.addEventListener('touchmove', (e) => {
        if (isTouching) {
            touchMoveX = e.touches[0].clientX;
            // Determine direction based on touch movement
            if (touchMoveX < touchStartX - 10) {
                keys.ArrowLeft = true;
                keys.ArrowRight = false;
            } else if (touchMoveX > touchStartX + 10) {
                keys.ArrowRight = true;
                keys.ArrowLeft = false;
            }
            e.preventDefault();
        }
    }, { passive: false });
}

// Check if device is mobile
function checkMobileDevice() {
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileDevice) {
        document.getElementById('mobile-controls').classList.remove('hidden');
        // Adjust game settings for mobile
        player.speed = PLAYER_SPEED * 1.2; // Slightly faster movement on mobile
    }
}

// Handle window resize
function handleResize() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Maintain aspect ratio
    let canvasWidth = CANVAS_WIDTH;
    let canvasHeight = CANVAS_HEIGHT;
    
    if (containerWidth / containerHeight < CANVAS_WIDTH / CANVAS_HEIGHT) {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth * (CANVAS_HEIGHT / CANVAS_WIDTH);
    } else {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * (CANVAS_WIDTH / CANVAS_HEIGHT);
    }
    
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
}

// Start the game
function startGame() {
    resetGame();
    showScreen('game-screen');
    gameActive = true;
    gamePaused = false;
    gameLoop();
}

// Reset game state
function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    frameCount = 0;
    levelFrameCount = 0;
    bullets = [];
    enemies = [];
    powerups = [];
    explosions = [];
    resetPlayer();
    resetPowerups();
    updateUI();
}

// Reset player position
function resetPlayer() {
    player.x = CANVAS_WIDTH / 2 - player.width / 2;
    player.y = CANVAS_HEIGHT - player.height - 20;
    player.isInvincible = false;
    player.invincibilityTime = 0;
}

// Reset powerup effects
function resetPowerups() {
    for (const effect in powerupEffects) {
        powerupEffects[effect].active = false;
        powerupEffects[effect].duration = 0;
    }
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('level').textContent = `Level: ${level}`;
    
    // Update lives display
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const lifeElement = document.createElement('div');
        lifeElement.className = 'life';
        livesContainer.appendChild(lifeElement);
    }
}

// Show a specific screen
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
    
    document.getElementById(screenId).classList.remove('hidden');
    
    // Special handling for specific screens
    if (screenId === 'level-screen') {
        document.getElementById('level-num').textContent = level;
        document.getElementById('bitcoin-fact').textContent = bitcoinFacts[level - 1] || bitcoinFacts[0];
    } else if (screenId === 'game-over-screen') {
        document.getElementById('final-score').textContent = `Score: ${score}`;
        document.getElementById('high-score').textContent = `High Score: ${highScore}`;
    } else if (screenId === 'victory-screen') {
        document.getElementById('victory-score').textContent = `Score: ${score}`;
    } else if (screenId === 'pause-screen') {
        // Show a random Bitcoin fact in the pause screen
        const randomFact = bitcoinFacts[Math.floor(Math.random() * bitcoinFacts.length)];
        document.getElementById('pause-fact').textContent = randomFact;
    }
}

// Toggle pause state
function togglePause() {
    gamePaused = !gamePaused;
    if (gamePaused) {
        showScreen('pause-screen');
    } else {
        showScreen('game-screen');
        gameLoop();
    }
}

// Toggle sound
function toggleSound(e) {
    soundEnabled = e.target.checked;
}

// Restart the game
function restartGame() {
    resetGame();
    showScreen('game-screen');
    gameActive = true;
    gamePaused = false;
    gameLoop();
}

// Go to main menu
function goToMainMenu() {
    gameActive = false;
    showScreen('start-screen');
}

// Continue to next level
function continueToNextLevel() {
    level++;
    levelFrameCount = 0;
    bullets = [];
    enemies = [];
    powerups = [];
    explosions = [];
    resetPlayer();
    resetPowerups();
    updateUI();
    showScreen('game-screen');
    gameActive = true;
}

// Main game loop
function gameLoop() {
    if (!gameActive) return;
    if (gamePaused) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game state
    updatePlayer();
    updateBullets();
    updateEnemies();
    updatePowerups();
    updateExplosions();
    checkCollisions();
    
    // Draw everything
    drawBackground();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPowerups();
    drawExplosions();
    drawEffects();
    
    // Check level completion
    checkLevelCompletion();
    
    // Increment frame counters
    frameCount++;
    levelFrameCount++;
    
    // Spawn enemies and powerups
    if (frameCount % Math.max(5, SPAWN_RATE - level * 5) === 0) {
        spawnEnemy();
    }
    
    if (frameCount % POWERUP_SPAWN_RATE === 0) {
        spawnPowerup();
    }
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Update player position
function updatePlayer() {
    // Handle keyboard input
    if (keys.ArrowLeft) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight) {
        player.x += player.speed;
    }
    
    // Keep player within bounds
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x > CANVAS_WIDTH - player.width) {
        player.x = CANVAS_WIDTH - player.width;
    }
    
    // Handle shooting - much faster now
    const currentTime = Date.now();
    const shootingDelay = powerupEffects.lightningNetwork.active ? SHOOTING_INTERVAL_POWERED : SHOOTING_INTERVAL;
    
    if ((keys[' '] || isShooting) && currentTime - lastShootTime > shootingDelay) {
        shootBullet();
        lastShootTime = currentTime;
    }
    
    // Update invincibility
    if (player.isInvincible) {
        player.invincibilityTime--;
        if (player.invincibilityTime <= 0) {
            player.isInvincible = false;
        }
    }
    
    // Update powerup durations
    for (const effect in powerupEffects) {
        if (powerupEffects[effect].active) {
            powerupEffects[effect].duration--;
            if (powerupEffects[effect].duration <= 0) {
                powerupEffects[effect].active = false;
            }
        }
    }
}

// Shoot a bullet
function shootBullet() {
    if (powerupEffects.nodeBooster.active) {
        // Spread shot (3 bullets)
        bullets.push({
            x: player.x + player.width / 2 - 8,
            y: player.y,
            width: 16,
            height: 32,
            speed: BULLET_SPEED,
            angle: -0.2
        });
        
        bullets.push({
            x: player.x + player.width / 2 - 8,
            y: player.y,
            width: 16,
            height: 32,
            speed: BULLET_SPEED,
            angle: 0
        });
        
        bullets.push({
            x: player.x + player.width / 2 - 8,
            y: player.y,
            width: 16,
            height: 32,
            speed: BULLET_SPEED,
            angle: 0.2
        });
    } else {
        // Single bullet
        bullets.push({
            x: player.x + player.width / 2 - 8,
            y: player.y,
            width: 16,
            height: 32,
            speed: BULLET_SPEED,
            angle: 0
        });
    }
    
    // Play sound
    if (soundEnabled) {
        // Sound effect would be played here
    }
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Move bullet
        bullet.x += Math.sin(bullet.angle) * bullet.speed;
        bullet.y -= Math.cos(bullet.angle) * bullet.speed;
        
        // Remove bullets that are off-screen
        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
        }
    }
}

// Spawn an enemy
function spawnEnemy() {
    const enemyTypes = ['inflation', 'fud', 'bank', 'regulation', 'altcoin'];
    let availableTypes = [];
    
    // Determine which enemy types are available based on level
    if (level >= 1) availableTypes.push('inflation');
    if (level >= 2) availableTypes.push('fud');
    if (level >= 3) availableTypes.push('bank');
    if (level >= 4) availableTypes.push('regulation');
    if (level >= 5) availableTypes.push('altcoin');
    
    // If no types are available, use the first one
    if (availableTypes.length === 0) {
        availableTypes.push(enemyTypes[0]);
    }
    
    // Select a random enemy type from available types
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    // Create enemy object
    const enemy = {
        x: Math.random() * (CANVAS_WIDTH - 64),
        y: -64,
        width: 64,
        height: 64,
        type: type,
        health: getEnemyHealth(type),
        speed: ENEMY_SPEED_MIN + Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN) + (level - 1) * 0.2,
        movementPattern: getEnemyMovementPattern(type)
    };
    
    enemies.push(enemy);
}

// Get enemy health based on type
function getEnemyHealth(type) {
    switch (type) {
        case 'inflation':
            return 2;
        case 'fud':
            return 1;
        case 'bank':
            return 3;
        case 'regulation':
            return 4;
        case 'altcoin':
            return 2;
        default:
            return 2;
    }
}

// Get enemy movement pattern based on type
function getEnemyMovementPattern(type) {
    switch (type) {
        case 'inflation':
            return 'straight';
        case 'fud':
            return 'zigzag';
        case 'bank':
            return 'straight';
        case 'regulation':
            return 'straight';
        case 'altcoin':
            return 'zigzag';
        default:
            return 'straight';
    }
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move enemy based on movement pattern
        if (enemy.movementPattern === 'zigzag') {
            enemy.x += Math.sin(frameCount * 0.05) * 2;
        }
        
        enemy.y += enemy.speed;
        
        // Remove enemies that are off-screen
        if (enemy.y > CANVAS_HEIGHT) {
            enemies.splice(i, 1);
            // Player loses points when enemy escapes
            score = Math.max(0, score - 10);
            updateUI();
        }
    }
}

// Spawn a powerup
function spawnPowerup() {
    const powerupTypes = ['lightning', 'hardware'];
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    
    const powerup = {
        x: Math.random() * (CANVAS_WIDTH - 32),
        y: -32,
        width: 32,
        height: 32,
        type: type,
        speed: POWERUP_SPEED
    };
    
    powerups.push(powerup);
}

// Update powerups
function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        powerup.y += powerup.speed;
        
        // Remove powerups that are off-screen
        if (powerup.y > CANVAS_HEIGHT) {
            powerups.splice(i, 1);
        }
    }
}

// Create explosion
function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        size: 1,
        maxSize: 30,
        growthRate: 1.5
    });
}

// Update explosions
function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        
        explosion.size += explosion.growthRate;
        
        if (explosion.size >= explosion.maxSize) {
            explosions.splice(i, 1);
        }
    }
}

// Check collisions
function checkCollisions() {
    // Check bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            
            if (checkCollision(bullet, enemy)) {
                // Reduce enemy health
                enemy.health--;
                
                // Remove bullet
                bullets.splice(i, 1);
                
                // If enemy is destroyed
                if (enemy.health <= 0) {
                    // Add score
                    score += getEnemyScore(enemy.type);
                    updateUI();
                    
                    // Create explosion
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    
                    // Remove enemy
                    enemies.splice(j, 1);
                    
                    // Show enemy fact
                    showEnemyFact(enemy.type);
                }
                
                // Break out of inner loop since bullet is removed
                break;
            }
        }
    }
    
    // Check player-enemy collisions
    if (!player.isInvincible) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            
            if (checkCollision(player, enemy)) {
                // Player loses a life
                lives--;
                updateUI();
                
                // Create explosion
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                
                // Remove enemy
                enemies.splice(i, 1);
                
                // Make player invincible for a short time
                player.isInvincible = true;
                player.invincibilityTime = 120;
                
                // Check game over
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    // Check player-powerup collisions
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        if (checkCollision(player, powerup)) {
            // Apply powerup effect
            applyPowerup(powerup.type);
            
            // Remove powerup
            powerups.splice(i, 1);
            
            // Show powerup fact
            showPowerupFact(powerup.type);
        }
    }
}

// Check if two objects are colliding
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Get score value for enemy type
function getEnemyScore(type) {
    switch (type) {
        case 'inflation':
            return 20;
        case 'fud':
            return 10;
        case 'bank':
            return 30;
        case 'regulation':
            return 40;
        case 'altcoin':
            return 25;
        default:
            return 10;
    }
}

// Apply powerup effect
function applyPowerup(type) {
    switch (type) {
        case 'lightning':
            powerupEffects.lightningNetwork.active = true;
            powerupEffects.lightningNetwork.duration = powerupEffects.lightningNetwork.maxDuration;
            break;
        case 'hardware':
            // Gain an extra life
            lives = Math.min(lives + 1, 5);
            updateUI();
            break;
        case 'mining':
            powerupEffects.miningRig.active = true;
            powerupEffects.miningRig.duration = powerupEffects.miningRig.maxDuration;
            break;
        case 'satoshi':
            powerupEffects.satoshiWisdom.active = true;
            powerupEffects.satoshiWisdom.duration = powerupEffects.satoshiWisdom.maxDuration;
            break;
        case 'node':
            powerupEffects.nodeBooster.active = true;
            powerupEffects.nodeBooster.duration = powerupEffects.nodeBooster.maxDuration;
            break;
    }
    
    // Add score for collecting powerup
    score += 50;
    updateUI();
}

// Show enemy fact
function showEnemyFact(type) {
    if (Math.random() < 0.2) { // 20% chance to show a fact
        const fact = enemyFacts[type] || "Bitcoin is a decentralized digital currency.";
        showPopup(fact);
    }
}

// Show powerup fact
function showPowerupFact(type) {
    const fact = powerupFacts[type] || "Bitcoin is a decentralized digital currency.";
    showPopup(fact);
}

// Show popup with text
function showPopup(text) {
    const popup = document.getElementById('popup');
    popup.textContent = text;
    popup.classList.remove('hidden');
    
    // Hide popup after a few seconds
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 3000);
}

// Check level completion
function checkLevelCompletion() {
    if (levelFrameCount >= LEVEL_DURATION) {
        if (level < 5) {
            // Show level completion screen
            showScreen('level-screen');
            gameActive = false;
        } else {
            // Show victory screen
            gameVictory();
        }
    }
}

// Game over
function gameOver() {
    gameActive = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('bitcoinDefenderHighScore', highScore);
    }
    
    showScreen('game-over-screen');
}

// Game victory
function gameVictory() {
    gameActive = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('bitcoinDefenderHighScore', highScore);
    }
    
    showScreen('victory-screen');
}

// Draw background
function drawBackground() {
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 100; i++) {
        const x = (Math.sin(i * 0.1 + frameCount * 0.001) * 0.5 + 0.5) * canvas.width;
        const y = (i / 100 * canvas.height + frameCount * 0.2) % canvas.height;
        const size = Math.random() * 2 + 1;
        ctx.fillRect(x, y, size, size);
    }
}

// Draw player
function drawPlayer() {
    // Draw player with blinking effect when invincible
    if (!player.isInvincible || Math.floor(frameCount / 5) % 2 === 0) {
        ctx.drawImage(assets.player, player.x, player.y, player.width, player.height);
    }
    
    // Draw power-up effects
    if (powerupEffects.lightningNetwork.active) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    if (powerupEffects.nodeBooster.active) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw bullets
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.save();
        ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
        ctx.rotate(bullet.angle);
        ctx.drawImage(assets.bullet, -bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
        ctx.restore();
    });
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        const enemyImage = assets.enemies[enemy.type];
        if (enemyImage) {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });
}

// Draw powerups
function drawPowerups() {
    powerups.forEach(powerup => {
        const powerupImage = assets.powerups[powerup.type];
        if (powerupImage) {
            ctx.drawImage(powerupImage, powerup.x, powerup.y, powerup.width, powerup.height);
        }
    });
}

// Draw explosions
function drawExplosions() {
    explosions.forEach(explosion => {
        const gradient = ctx.createRadialGradient(
            explosion.x, explosion.y, 0,
            explosion.x, explosion.y, explosion.size
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 128, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw effects
function drawEffects() {
    // Draw level progress bar
    const progressWidth = (levelFrameCount / LEVEL_DURATION) * canvas.width;
    ctx.fillStyle = '#f7931a';
    ctx.fillRect(0, 0, progressWidth, 5);
}

// Initialize the game when the page loads
window.addEventListener('load', init);
