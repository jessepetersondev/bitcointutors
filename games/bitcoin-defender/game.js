// Bitcoin Defender - Main Game JavaScript
// A retro space shooter game with Bitcoin educational elements

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 7; // Increased from 5 for better responsiveness
const BULLET_SPEED = 10; // Increased from 7 for faster bullets
const ENEMY_SPEED_MIN = 1; // Slightly increased for better challenge
const ENEMY_SPEED_MAX = 3; // Slightly increased for better challenge
const POWERUP_SPEED = 2.5; // Slightly increased
const SPAWN_RATE = 60; // Frames between enemy spawns
const POWERUP_SPAWN_RATE = 300; // Frames between powerup spawns
const LEVEL_DURATION = 120 * 60; // 60 seconds at 120fps

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

// Mobile controls setup
function setupMobileControls() {
    const moveLeft = document.getElementById('move-left');
    const moveRight = document.getElementById('move-right');
    const shootButton = document.getElementById('shoot-button');
    
    // Touch events for movement
    moveLeft.addEventListener('touchstart', () => { keys.ArrowLeft = true; });
    moveLeft.addEventListener('touchend', () => { keys.ArrowLeft = false; });
    moveRight.addEventListener('touchstart', () => { keys.ArrowRight = true; });
    moveRight.addEventListener('touchend', () => { keys.ArrowRight = false; });
    
    // Touch events for shooting
    shootButton.addEventListener('touchstart', () => { keys[' '] = true; });
    shootButton.addEventListener('touchend', () => { keys[' '] = false; });
}

// Check if device is mobile
function checkMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobile-controls').classList.remove('hidden');
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
    
    // Handle shooting
    if (keys[' '] && frameCount % (powerupEffects.lightningNetwork.active ? 12 : 30) === 0) {
        shootBullet();
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
        case 'inflation': return 1;
        case 'fud': return 1;
        case 'bank': return 2;
        case 'regulation': return 3;
        case 'altcoin': return 1;
        default: return 1;
    }
}

// Get enemy movement pattern based on type
function getEnemyMovementPattern(type) {
    switch (type) {
        case 'inflation': return 'zigzag';
        case 'fud': return 'horizontal';
        case 'bank': return 'vertical';
        case 'regulation': return 'stationary';
        case 'altcoin': return 'erratic';
        default: return 'vertical';
    }
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move enemy based on movement pattern
        switch (enemy.movementPattern) {
            case 'zigzag':
                enemy.x += Math.sin(frameCount * 0.05) * 2;
                enemy.y += enemy.speed;
                break;
            case 'horizontal':
                enemy.x += Math.sin(frameCount * 0.05) * 4;
                enemy.y += enemy.speed * 0.7;
                break;
            case 'vertical':
                enemy.y += enemy.speed * 0.8;
                break;
            case 'stationary':
                if (frameCount % 60 === 0) {
                    enemy.y += enemy.speed * 5;
                }
                break;
            case 'erratic':
                enemy.x += Math.sin(frameCount * 0.1) * 3;
                enemy.y += Math.cos(frameCount * 0.1) * 2 + enemy.speed * 0.5;
                break;
            default:
                enemy.y += enemy.speed;
        }
        
        // Remove enemies that are off-screen
        if (enemy.y > CANVAS_HEIGHT) {
            enemies.splice(i, 1);
        }
    }
}

// Spawn a powerup
function spawnPowerup() {
    const powerupTypes = ['lightning', 'hardware', 'mining', 'satoshi', 'node'];
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    
    powerups.push({
        x: Math.random() * (CANVAS_WIDTH - 40),
        y: -40,
        width: 40,
        height: 40,
        type: type,
        speed: POWERUP_SPEED
    });
}

// Update powerups
function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        // Move powerup
        powerup.y += powerup.speed;
        
        // Remove powerups that are off-screen
        if (powerup.y > CANVAS_HEIGHT) {
            powerups.splice(i, 1);
        }
    }
}

// Update explosions
function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        
        // Update explosion frame
        explosion.frame++;
        
        // Remove completed explosions
        if (explosion.frame >= explosion.maxFrames) {
            explosions.splice(i, 1);
        }
    }
}

// Check collisions
function checkCollisions() {
    // Bullet-enemy collisions
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
                    const basePoints = getEnemyPoints(enemy.type);
                    const points = powerupEffects.satoshiWisdom.active ? basePoints * 2 : basePoints;
                    score += points;
                    updateUI();
                    
                    // Create explosion
                    createExplosion(enemy.x, enemy.y);
                    
                    // Show educational popup (10% chance)
                    if (Math.random() < 0.1) {
                        showEducationalPopup(enemy.type);
                    }
                    
                    // Remove enemy
                    enemies.splice(j, 1);
                }
                
                // Break since bullet is gone
                break;
            }
        }
    }
    
    // Player-enemy collisions
    if (!player.isInvincible) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            
            if (checkCollision(player, enemy)) {
                // Player loses a life
                lives--;
                updateUI();
                
                // Create explosion
                createExplosion(enemy.x, enemy.y);
                
                // Remove enemy
                enemies.splice(i, 1);
                
                // Make player temporarily invincible
                player.isInvincible = true;
                player.invincibilityTime = 90; // 1.5 seconds at 60fps
                
                // Check game over
                if (lives <= 0) {
                    gameOver();
                }
                
                break;
            }
        }
    }
    
    // Player-powerup collisions
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        if (checkCollision(player, powerup)) {
            // Apply powerup effect
            applyPowerup(powerup.type);
            
            // Add score
            score += 50;
            updateUI();
            
            // Remove powerup
            powerups.splice(i, 1);
        }
    }
}

// Check if two objects are colliding
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Get points for destroying an enemy
function getEnemyPoints(type) {
    switch (type) {
        case 'inflation': return 10;
        case 'fud': return 15;
        case 'bank': return 25;
        case 'regulation': return 40;
        case 'altcoin': return 20;
        default: return 10;
    }
}

// Create an explosion
function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        frame: 0,
        maxFrames: 10
    });
    
    // Play sound
    if (soundEnabled) {
        // Sound effect would be played here
    }
}

// Apply powerup effect
function applyPowerup(type) {
    switch (type) {
        case 'lightning':
            powerupEffects.lightningNetwork.active = true;
            powerupEffects.lightningNetwork.duration = powerupEffects.lightningNetwork.maxDuration;
            showEducationalPopup('lightning');
            break;
        case 'hardware':
            lives = Math.min(lives + 1, 5);
            updateUI();
            showEducationalPopup('hardware');
            break;
        case 'mining':
            powerupEffects.miningRig.active = true;
            powerupEffects.miningRig.duration = powerupEffects.miningRig.maxDuration;
            player.isInvincible = true;
            player.invincibilityTime = powerupEffects.miningRig.maxDuration;
            showEducationalPopup('mining');
            break;
        case 'satoshi':
            powerupEffects.satoshiWisdom.active = true;
            powerupEffects.satoshiWisdom.duration = powerupEffects.satoshiWisdom.maxDuration;
            showEducationalPopup('satoshi');
            break;
        case 'node':
            powerupEffects.nodeBooster.active = true;
            powerupEffects.nodeBooster.duration = powerupEffects.nodeBooster.maxDuration;
            showEducationalPopup('node');
            break;
    }
    
    // Play sound
    if (soundEnabled) {
        // Sound effect would be played here
    }
}

// Show educational popup
function showEducationalPopup(type) {
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    
    // Set popup content based on type
    if (type in enemyFacts) {
        popupContent.textContent = enemyFacts[type];
    } else if (type in powerupFacts) {
        popupContent.textContent = powerupFacts[type];
    } else {
        return; // Invalid type
    }
    
    // Show popup
    popup.classList.remove('hidden');
    
    // Hide popup after a delay
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 2000);
}

// Check level completion
function checkLevelCompletion() {
    if (levelFrameCount >= LEVEL_DURATION) {
        if (level >= 5) {
            // Game completed
            victory();
        } else {
            // Level completed
            showScreen('level-screen');
            gameActive = false;
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

// Victory
function victory() {
    gameActive = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('bitcoinDefenderHighScore', highScore);
    }
    
    showScreen('victory-screen');
}

// Draw functions
function drawBackground() {
    // Simple starfield background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = (Math.sin(i * 567 + frameCount * 0.01) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 789 + frameCount * 0.01) * 0.5 + 0.5) * canvas.height;
        const size = Math.sin(i * 123 + frameCount * 0.01) * 1.5 + 1.5;
        ctx.fillRect(x, y, size, size);
    }
}

function drawPlayer() {
    // Skip drawing if player is invincible and should be blinking
    if (player.isInvincible && Math.floor(frameCount / 5) % 2 === 0) {
        return;
    }
    
    ctx.drawImage(assets.player, player.x, player.y, player.width, player.height);
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.save();
        ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
        ctx.rotate(bullet.angle);
        ctx.drawImage(assets.bullet, -bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
        ctx.restore();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        const enemyImage = assets.enemies[enemy.type];
        ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawPowerups() {
    powerups.forEach(powerup => {
        const powerupImage = assets.powerups[powerup.type];
        ctx.drawImage(powerupImage, powerup.x, powerup.y, powerup.width, powerup.height);
    });
}

function drawExplosions() {
    explosions.forEach(explosion => {
        const size = 64 + explosion.frame * 5;
        const alpha = 1 - explosion.frame / explosion.maxFrames;
        
        ctx.beginPath();
        ctx.arc(explosion.x + 32, explosion.y + 32, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${alpha * 0.7})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(explosion.x + 32, explosion.y + 32, size / 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
        ctx.fill();
    });
}

function drawEffects() {
    // Draw active powerup indicators
    let y = 50;
    
    if (powerupEffects.lightningNetwork.active) {
        drawPowerupIndicator('Lightning Network', powerupEffects.lightningNetwork.duration, powerupEffects.lightningNetwork.maxDuration, y);
        y += 30;
    }
    
    if (powerupEffects.miningRig.active) {
        drawPowerupIndicator('Mining Rig', powerupEffects.miningRig.duration, powerupEffects.miningRig.maxDuration, y);
        y += 30;
    }
    
    if (powerupEffects.satoshiWisdom.active) {
        drawPowerupIndicator('Satoshi Wisdom', powerupEffects.satoshiWisdom.duration, powerupEffects.satoshiWisdom.maxDuration, y);
        y += 30;
    }
    
    if (powerupEffects.nodeBooster.active) {
        drawPowerupIndicator('Node Booster', powerupEffects.nodeBooster.duration, powerupEffects.nodeBooster.maxDuration, y);
    }
}

function drawPowerupIndicator(name, duration, maxDuration, y) {
    const width = 150;
    const height = 20;
    const x = 10;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, width, height);
    
    // Draw progress bar
    const progress = duration / maxDuration;
    ctx.fillStyle = '#f7931a';
    ctx.fillRect(x, y, width * progress, height);
    
    // Draw text
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(name, x + 5, y + 15);
}

// Initialize the game when the page loads
window.addEventListener('load', init);