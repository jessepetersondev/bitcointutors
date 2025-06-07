// Bitcoin Word Munchers - Game Logic
// Main game variables
let canvas, ctx;
let gameActive = false;
let score = 0;
let lives = 3;
let level = 1;
let currentCategory = "";
let grid = [];
let player = { x: 0, y: 0, width: 50, height: 50 };
let enemies = [];
let safeSquares = [];
let words = [];
let matchingWords = [];
let nonMatchingWords = [];
let explanations = {};
let bitcoinFacts = [];
let gridSize = { rows: 5, cols: 6 };
let cellSize = 80;
let animationFrame;
let lastTime = 0;
let enemySpeed = 1.5;
let enemyMoveInterval = 1000; // milliseconds
let lastEnemyMove = 0;

// Hardcoded game data to avoid fetch issues with local files
const gameData = {
  "bitcoinBasics": {
    "category": "Munch words related to Bitcoin basics",
    "words": [
      "Bitcoin",
      "Blockchain",
      "Wallet",
      "Mining",
      "Satoshi",
      "Node",
      "Address",
      "Key",
      "Halving",
      "Hash"
    ],
    "explanations": {
      "Bitcoin": "A decentralized digital currency created in 2009.",
      "Blockchain": "The technology that powers Bitcoin, a distributed ledger of all transactions.",
      "Wallet": "Software that allows you to store and manage your Bitcoin.",
      "Mining": "The process of validating transactions and adding them to the blockchain.",
      "Satoshi": "The smallest unit of Bitcoin, named after its creator Satoshi Nakamoto.",
      "Node": "A computer that participates in the Bitcoin network by validating transactions.",
      "Address": "A unique identifier where Bitcoin can be sent, similar to an email address.",
      "Key": "Cryptographic codes that allow access to your Bitcoin.",
      "Halving": "An event where Bitcoin mining rewards are cut in half, occurring approximately every four years.",
      "Hash": "A mathematical function that converts data into a fixed-size string of characters."
    }
  },
  "bitcoinVsFiat": {
    "category": "Munch words that describe Bitcoin (not fiat money)",
    "words": [
      "Decentralized",
      "Limited",
      "Borderless",
      "Permissionless",
      "Censorship-resistant",
      "Peer-to-peer"
    ],
    "nonMatchingWords": [
      "Inflationary",
      "Centralized",
      "Controlled",
      "Physical",
      "Government-issued"
    ],
    "explanations": {
      "Decentralized": "Bitcoin has no central authority controlling it.",
      "Limited": "Bitcoin has a fixed supply cap of 21 million coins.",
      "Borderless": "Bitcoin can be sent anywhere in the world without restrictions.",
      "Permissionless": "Anyone can use Bitcoin without needing approval.",
      "Censorship-resistant": "No entity can prevent Bitcoin transactions from occurring.",
      "Peer-to-peer": "Bitcoin allows direct transactions between users without intermediaries."
    }
  },
  "bitcoinNetworkParticipants": {
    "category": "Munch words that describe Bitcoin network participants",
    "words": [
      "Miner",
      "Node",
      "Developer",
      "Holder",
      "Merchant",
      "Validator"
    ],
    "nonMatchingWords": [
      "Bank",
      "Regulator",
      "Printer",
      "Middleman",
      "Broker"
    ],
    "explanations": {
      "Miner": "Someone who uses computing power to secure the Bitcoin network and process transactions.",
      "Node": "A person running software that validates and relays transactions on the Bitcoin network.",
      "Developer": "Someone who contributes code to improve the Bitcoin protocol.",
      "Holder": "A person who owns Bitcoin as a store of value or investment.",
      "Merchant": "A business or individual who accepts Bitcoin as payment.",
      "Validator": "Someone who verifies that Bitcoin transactions follow the network's rules."
    }
  },
  "bitcoinSecurityTerms": {
    "category": "Munch words related to Bitcoin security",
    "words": [
      "Private-key",
      "Seed-phrase",
      "Cold-storage",
      "Hardware-wallet",
      "Multisig",
      "Encryption"
    ],
    "nonMatchingWords": [
      "Password",
      "Username",
      "Email",
      "Server",
      "Cloud"
    ],
    "explanations": {
      "Private-key": "A secret code that gives you access to your Bitcoin.",
      "Seed-phrase": "A series of words that can recover your Bitcoin wallet.",
      "Cold-storage": "Keeping Bitcoin offline for maximum security.",
      "Hardware-wallet": "A physical device that securely stores Bitcoin keys offline.",
      "Multisig": "Requiring multiple signatures to authorize a Bitcoin transaction.",
      "Encryption": "Converting information into code to prevent unauthorized access."
    }
  },
  "bitcoinTransactionTerms": {
    "category": "Munch words related to Bitcoin transactions",
    "words": [
      "UTXO",
      "Mempool",
      "Fee",
      "Confirmation",
      "Block",
      "Script",
      "Signature",
      "Input",
      "Output"
    ],
    "nonMatchingWords": [
      "Receipt",
      "Invoice",
      "Refund",
      "Credit",
      "Debit"
    ],
    "explanations": {
      "UTXO": "Unspent Transaction Output - the fundamental building block of Bitcoin transactions.",
      "Mempool": "Where pending Bitcoin transactions wait before being confirmed.",
      "Fee": "Payment to miners for including your transaction in a block.",
      "Confirmation": "When a transaction is included in a block and added to the blockchain.",
      "Block": "A package of transactions that gets added to the blockchain.",
      "Script": "A simple programming language used in Bitcoin transactions.",
      "Signature": "Cryptographic proof that you own the Bitcoin you're trying to spend.",
      "Input": "Bitcoin you're spending in a transaction.",
      "Output": "Bitcoin you're sending to someone in a transaction."
    }
  },
  "bitcoinLayer2Solutions": {
    "category": "Munch words related to Bitcoin Layer 2 solutions",
    "words": [
      "Lightning",
      "Channel",
      "Sidechains",
      "Liquid",
      "RSK",
      "Payment"
    ],
    "nonMatchingWords": [
      "Visa",
      "PayPal",
      "Bank",
      "Cash",
      "Check"
    ],
    "explanations": {
      "Lightning": "A second-layer network on top of Bitcoin for fast, low-cost transactions.",
      "Channel": "A connection between two Lightning Network users for multiple transactions.",
      "Sidechains": "Separate blockchains connected to the main Bitcoin blockchain.",
      "Liquid": "A sidechain-based settlement network for traders and exchanges.",
      "RSK": "A smart contract platform secured by the Bitcoin network.",
      "Payment": "The act of sending Bitcoin to another person or business."
    }
  },
  "bitcoinPrivacyTerms": {
    "category": "Munch words related to Bitcoin privacy",
    "words": [
      "CoinJoin",
      "Taproot",
      "Schnorr",
      "Pseudonymous",
      "Mixing",
      "Entropy"
    ],
    "nonMatchingWords": [
      "Anonymous",
      "Untraceable",
      "Hidden",
      "Secret",
      "Invisible"
    ],
    "explanations": {
      "CoinJoin": "A method for combining multiple Bitcoin payments into a single transaction.",
      "Taproot": "A Bitcoin upgrade that improves privacy, efficiency, and smart contract capabilities.",
      "Schnorr": "A type of digital signature that enhances Bitcoin's privacy and efficiency.",
      "Pseudonymous": "Bitcoin transactions are linked to addresses, not personal identities.",
      "Mixing": "The process of combining Bitcoin from multiple sources to obscure their origin.",
      "Entropy": "Randomness collected to generate secure Bitcoin keys."
    }
  },
  "bitcoinMiningTerms": {
    "category": "Munch words related to Bitcoin mining",
    "words": [
      "Hashrate",
      "Difficulty",
      "Nonce",
      "Block-reward",
      "ASIC",
      "Pool"
    ],
    "nonMatchingWords": [
      "Digging",
      "Excavation",
      "Gold",
      "Silver",
      "Copper"
    ],
    "explanations": {
      "Hashrate": "The computing power of the Bitcoin network.",
      "Difficulty": "How hard it is to find a valid block, adjusts every 2016 blocks.",
      "Nonce": "A number miners change to try to find a valid block hash.",
      "Block-reward": "New Bitcoin given to miners for successfully mining a block.",
      "ASIC": "Application-Specific Integrated Circuit - specialized hardware for Bitcoin mining.",
      "Pool": "A group of miners who combine their computing power and share rewards."
    }
  },
  "bitcoinFacts": [
    "Bitcoin has a fixed supply of 21 million coins, making it scarce like gold.",
    "Bitcoin transactions are verified by a decentralized network of computers around the world.",
    "The smallest unit of Bitcoin is called a 'satoshi' - there are 100 million satoshis in 1 Bitcoin.",
    "Bitcoin's blockchain is a public ledger that records all transactions transparently.",
    "Bitcoin was created in 2009 as a response to the financial crisis.",
    "Bitcoin's creator, Satoshi Nakamoto, has never been conclusively identified.",
    "The first Bitcoin transaction was for two pizzas, costing 10,000 BTC (now worth millions).",
    "Bitcoin mining difficulty adjusts approximately every two weeks to maintain a 10-minute block time.",
    "Bitcoin has never been hacked - security issues have only affected exchanges and wallets.",
    "Bitcoin's code is open source, allowing anyone to review and contribute to it.",
    "Bitcoin transactions are irreversible once confirmed on the blockchain.",
    "Bitcoin operates 24/7/365, unlike traditional financial systems.",
    "Bitcoin's price is determined by supply and demand in the market.",
    "Bitcoin halvings occur approximately every four years, reducing the rate of new supply.",
    "Running a Bitcoin node gives you full control over your Bitcoin experience."
  ]
};

// Assets
const assets = {
    player: new Image(),
    enemy: new Image(),
    safeSquare: new Image(),
    grid: new Image(),
    background: new Image(),
    lifeIcon: new Image()
};

// Sound effects (to be implemented)
const sounds = {
    munch: null,
    wrong: null,
    enemyHit: null,
    levelComplete: null,
    gameOver: null
};

// Initialize the game
function init() {
    // Set up canvas
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Responsive canvas sizing
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Load assets
    loadAssets();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up first level data
    setupLevelData(level);
    
    // Show start screen
    showScreen('start-screen');
}

// Resize canvas based on window size
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    
    // Calculate canvas size based on container width
    const canvasWidth = Math.min(containerWidth - 20, 800);
    const canvasHeight = canvasWidth * 0.75; // 4:3 aspect ratio
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Adjust cell size based on canvas dimensions
    cellSize = Math.floor(canvasWidth / gridSize.cols);
    
    // If game is active, redraw
    if (gameActive) {
        draw();
    }
}

// Load game assets
function loadAssets() {
    assets.player.src = 'assets/images/bitty_character.png';
    assets.enemy.src = 'assets/images/fudster_enemy.png';
    assets.safeSquare.src = 'assets/images/safe_square.png';
    assets.grid.src = 'assets/images/game_grid.png';
    assets.background.src = 'assets/images/game_background.png';
    assets.lifeIcon.src = 'assets/images/life_icon.png';
    
    // Update lives display once life icon is loaded
    assets.lifeIcon.onload = updateLivesDisplay;
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    
    // Button event listeners
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('instructions-button').addEventListener('click', () => showScreen('instructions-screen'));
    document.getElementById('back-button').addEventListener('click', () => showScreen('start-screen'));
    document.getElementById('next-level-button').addEventListener('click', startNextLevel);
    document.getElementById('play-again-button').addEventListener('click', resetGame);
    
    // Mobile controls
    const upButton = document.getElementById('up-button');
    const leftButton = document.getElementById('left-button');
    const downButton = document.getElementById('down-button');
    const rightButton = document.getElementById('right-button');
    
    // Touch events for mobile
    upButton.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer(0, -1); });
    leftButton.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer(-1, 0); });
    downButton.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer(0, 1); });
    rightButton.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer(1, 0); });
    
    // Mouse events as fallback
    upButton.addEventListener('mousedown', () => movePlayer(0, -1));
    leftButton.addEventListener('mousedown', () => movePlayer(-1, 0));
    downButton.addEventListener('mousedown', () => movePlayer(0, 1));
    rightButton.addEventListener('mousedown', () => movePlayer(1, 0));
}

// Set up level data based on current level
function setupLevelData(currentLevel) {
    // Cycle through categories based on level
    const categories = Object.keys(gameData).filter(key => key !== 'bitcoinFacts');
    const categoryIndex = (currentLevel - 1) % categories.length;
    const categoryKey = categories[categoryIndex];
    
    const categoryData = gameData[categoryKey];
    currentCategory = categoryData.category;
    matchingWords = categoryData.words;
    nonMatchingWords = categoryData.nonMatchingWords || [];
    explanations = categoryData.explanations || {};
    
    // Store Bitcoin facts
    bitcoinFacts = gameData.bitcoinFacts;
    
    // Update category display
    document.getElementById('current-category').textContent = currentCategory;
}

// Handle keyboard input
function handleKeyDown(e) {
    if (!gameActive) return;
    
    switch (e.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
    }
}

// Move player on grid
function movePlayer(dx, dy) {
    if (!gameActive) return;
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    // Check if move is within grid bounds
    if (newX >= 0 && newX < gridSize.cols && newY >= 0 && newY < gridSize.rows) {
        player.x = newX;
        player.y = newY;
        
        // Check for word at new position
        checkWordCollision();
        
        // Check for enemy collision
        checkEnemyCollision();
    }
}

// Check if player is on a word
function checkWordCollision() {
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.x === player.x && word.y === player.y && !word.eaten) {
            // Word found at player position
            if (matchingWords.includes(word.text)) {
                // Correct word
                word.eaten = true;
                score += 10;
                updateScore();
                showExplanation(word.text);
                
                // Play munch sound
                // if (sounds.munch) sounds.munch.play();
                
                // Check if level complete
                checkLevelComplete();
            } else {
                // Wrong word
                loseLife();
                
                // Play wrong sound
                // if (sounds.wrong) sounds.wrong.play();
            }
            break;
        }
    }
}

// Check if player collided with an enemy
function checkEnemyCollision() {
    // Check if player is on a safe square
    for (const safeSquare of safeSquares) {
        if (player.x === safeSquare.x && player.y === safeSquare.y) {
            return; // Player is safe
        }
    }
    
    // Check for enemy collision
    for (const enemy of enemies) {
        if (Math.abs(player.x - enemy.x) < 0.5 && Math.abs(player.y - enemy.y) < 0.5) {
            loseLife();
            
            // Play enemy hit sound
            // if (sounds.enemyHit) sounds.enemyHit.play();
            
            // Move player to starting position
            resetPlayerPosition();
            break;
        }
    }
}

// Check if all matching words have been eaten
function checkLevelComplete() {
    const remainingWords = words.filter(word => matchingWords.includes(word.text) && !word.eaten);
    
    if (remainingWords.length === 0) {
        // Level complete
        gameActive = false;
        
        // Play level complete sound
        // if (sounds.levelComplete) sounds.levelComplete.play();
        
        // Show level complete screen
        document.getElementById('level-score').textContent = score;
        
        // Show random Bitcoin fact
        const factIndex = Math.floor(Math.random() * bitcoinFacts.length);
        document.getElementById('bitcoin-fact').textContent = bitcoinFacts[factIndex];
        
        showScreen('level-complete-screen');
    }
}

// Lose a life
function loseLife() {
    lives--;
    updateLivesDisplay();
    
    if (lives <= 0) {
        gameOver();
    }
}

// Game over
function gameOver() {
    gameActive = false;
    
    // Games over sound
    // if (sounds.gameOver) sounds.gameOver.play();
    
    // Show game over screen
    document.getElementById('final-score').textContent = score;
    showScreen('game-over-screen');
    
    // Cancel animation frame
    cancelAnimationFrame(animationFrame);
}

// Start the game
function startGame() {
    hideAllScreens();
    resetGame();
    gameActive = true;
    gameLoop(0);
}

// Reset the game
function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    updateScore();
    updateLivesDisplay();
    document.getElementById('level').textContent = level;
    
    // Set up level data
    setupLevelData(level);
    
    // Set up level
    setupLevel();
}

// Start next level
function startNextLevel() {
    hideAllScreens();
    level++;
    document.getElementById('level').textContent = level;
    
    // Increase difficulty
    enemySpeed += 0.2;
    
    // Set up level data
    setupLevelData(level);
    
    // Set up level
    setupLevel();
    
    gameActive = true;
    gameLoop(0);
}

// Set up level
function setupLevel() {
    // Reset arrays
    words = [];
    enemies = [];
    safeSquares = [];
    
    // Create grid of words
    createWordGrid();
    
    // Place safe squares
    placeSafeSquares();
    
    // Create enemies
    createEnemies();
    
    // Reset player position
    resetPlayerPosition();
}

// Create grid of words
function createWordGrid() {
    // Combine matching and non-matching words
    const allWords = [...matchingWords];
    
    // Add some non-matching words if available
    if (nonMatchingWords.length > 0) {
        // Add enough non-matching words to fill most of the grid
        const nonMatchingCount = Math.min(
            nonMatchingWords.length,
            (gridSize.rows * gridSize.cols) - matchingWords.length
        );
        
        // Randomly select non-matching words
        const selectedNonMatching = [];
        const tempNonMatching = [...nonMatchingWords]; // Create a copy to avoid modifying the original
        
        while (selectedNonMatching.length < nonMatchingCount && tempNonMatching.length > 0) {
            const randomIndex = Math.floor(Math.random() * tempNonMatching.length);
            selectedNonMatching.push(tempNonMatching[randomIndex]);
            tempNonMatching.splice(randomIndex, 1);
        }
        
        allWords.push(...selectedNonMatching);
    }
    
    // Shuffle words
    const shuffledWords = shuffleArray([...allWords]);
    
    // Create grid with words
    const positions = [];
    for (let y = 0; y < gridSize.rows; y++) {
        for (let x = 0; x < gridSize.cols; x++) {
            positions.push({ x, y });
        }
    }
    
    // Shuffle positions
    const shuffledPositions = shuffleArray([...positions]);
    
    // Place words on grid
    for (let i = 0; i < Math.min(shuffledWords.length, shuffledPositions.length); i++) {
        words.push({
            text: shuffledWords[i],
            x: shuffledPositions[i].x,
            y: shuffledPositions[i].y,
            eaten: false
        });
    }
}

// Place safe squares on grid
function placeSafeSquares() {
    // Place 3-5 safe squares randomly
    const safeSquareCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < safeSquareCount; i++) {
        let x, y;
        let validPosition = false;
        
        // Try to find a position that doesn't overlap with words
        let attempts = 0;
        while (!validPosition && attempts < 20) {
            x = Math.floor(Math.random() * gridSize.cols);
            y = Math.floor(Math.random() * gridSize.rows);
            
            // Check if position overlaps with any word
            validPosition = true;
            for (const word of words) {
                if (word.x === x && word.y === y) {
                    validPosition = false;
                    break;
                }
            }
            
            attempts++;
        }
        
        if (validPosition) {
            safeSquares.push({ x, y });
        }
    }
}

// Create enemies
function createEnemies() {
    // Create 2-4 enemies based on level
    const enemyCount = Math.min(2 + Math.floor(level / 2), 4);
    
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        let validPosition = false;
        
        // Try to find a position that doesn't overlap with words, safe squares, or player
        let attempts = 0;
        while (!validPosition && attempts < 20) {
            x = Math.floor(Math.random() * gridSize.cols);
            y = Math.floor(Math.random() * gridSize.rows);
            
            // Check if position is valid
            validPosition = true;
            
            // Check overlap with player starting position
            if (x === Math.floor(gridSize.cols / 2) && y === Math.floor(gridSize.rows / 2)) {
                validPosition = false;
                attempts++;
                continue;
            }
            
            // Check overlap with words
            for (const word of words) {
                if (word.x === x && word.y === y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check overlap with safe squares
            if (validPosition) {
                for (const safeSquare of safeSquares) {
                    if (safeSquare.x === x && safeSquare.y === y) {
                        validPosition = false;
                        break;
                    }
                }
            }
            
            attempts++;
        }
        
        if (validPosition) {
            enemies.push({
                x: x,
                y: y,
                direction: Math.floor(Math.random() * 4) // 0: up, 1: right, 2: down, 3: left
            });
        }
    }
}

// Reset player position to center of grid
function resetPlayerPosition() {
    player.x = Math.floor(gridSize.cols / 2);
    player.y = Math.floor(gridSize.rows / 2);
}

// Move enemies
function moveEnemies(currentTime) {
    // Move enemies at regular intervals
    if (currentTime - lastEnemyMove > enemyMoveInterval) {
        lastEnemyMove = currentTime;
        
        for (const enemy of enemies) {
            // Occasionally change direction (20% chance)
            if (Math.random() < 0.2) {
                enemy.direction = Math.floor(Math.random() * 4);
            }
            
            // Try to move in current direction
            let newX = enemy.x;
            let newY = enemy.y;
            
            switch (enemy.direction) {
                case 0: // Up
                    newY--;
                    break;
                case 1: // Right
                    newX++;
                    break;
                case 2: // Down
                    newY++;
                    break;
                case 3: // Left
                    newX--;
                    break;
            }
            
            // Check if move is valid (within grid)
            if (newX >= 0 && newX < gridSize.cols && newY >= 0 && newY < gridSize.rows) {
                enemy.x = newX;
                enemy.y = newY;
            } else {
                // Hit wall, change direction
                enemy.direction = (enemy.direction + 2) % 4; // Reverse direction
            }
        }
        
        // Check for enemy collision after moving
        checkEnemyCollision();
    }
}

// Main game loop
function gameLoop(currentTime) {
    if (!gameActive) return;
    
    // Calculate delta time
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Move enemies
    moveEnemies(currentTime);
    
    // Draw game
    draw();
    
    // Request next frame
    animationFrame = requestAnimationFrame(gameLoop);
}

// Draw game
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate cell dimensions
    const cellWidth = Math.floor(canvas.width / gridSize.cols);
    const cellHeight = Math.floor(canvas.height / gridSize.rows);
    
    // Draw grid cells with alternating colors
    for (let y = 0; y < gridSize.rows; y++) {
        for (let x = 0; x < gridSize.cols; x++) {
            // Alternate between dark blue and slightly lighter blue
            if ((x + y) % 2 === 0) {
                ctx.fillStyle = '#0a1744'; // Dark blue
            } else {
                ctx.fillStyle = '#0f2255'; // Slightly lighter blue
            }
            
            // Fill cell
            ctx.fillRect(
                x * cellWidth,
                y * cellHeight,
                cellWidth,
                cellHeight
            );
        }
    }
    
    // Draw grid lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Draw vertical grid lines
    for (let x = 0; x <= gridSize.cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellWidth, 0);
        ctx.lineTo(x * cellWidth, cellHeight * gridSize.rows);
        ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= gridSize.rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellHeight);
        ctx.lineTo(cellWidth * gridSize.cols, y * cellHeight);
        ctx.stroke();
    }
    
    // Draw safe squares
    for (const safeSquare of safeSquares) {
        // Draw safe square background
        ctx.fillStyle = 'rgba(100, 100, 255, 0.3)';
        ctx.fillRect(
            safeSquare.x * cellWidth + 2, // +2 to account for grid line width
            safeSquare.y * cellHeight + 2,
            cellWidth - 4,
            cellHeight - 4
        );
    }
    
    // Draw words
    // Adjust font size based on cell size and word length
    for (const word of words) {
        if (!word.eaten) {
            // Draw word background based on whether it's a matching word
            ctx.fillStyle = matchingWords.includes(word.text) ? 'rgba(0, 128, 0, 0.5)' : 'rgba(128, 0, 0, 0.5)';
            ctx.fillRect(
                word.x * cellWidth + 2,
                word.y * cellHeight + 2,
                cellWidth - 4,
                cellHeight - 4
            );
            
            // Calculate font size based on word length and cell size
            const wordLength = word.text.length;
            let fontSize;
            
            if (wordLength <= 4) {
                fontSize = Math.min(cellWidth / 6, 14);
            } else if (wordLength <= 8) {
                fontSize = Math.min(cellWidth / 8, 12);
            } else {
                fontSize = Math.min(cellWidth / 10, 10);
            }
            
            ctx.font = `${fontSize}px 'Press Start 2P', monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            
            // Handle word display based on length
            if (wordLength > 8 && word.text.includes('-')) {
                // Split hyphenated words
                const parts = word.text.split('-');
                for (let i = 0; i < parts.length; i++) {
                    const yOffset = (i - (parts.length - 1) / 2) * (fontSize + 2);
                    ctx.fillText(
                        parts[i],
                        word.x * cellWidth + cellWidth / 2,
                        word.y * cellHeight + cellHeight / 2 + yOffset
                    );
                }
            } else if (wordLength > 8) {
                // Split long words into two lines
                const halfLength = Math.ceil(wordLength / 2);
                const line1 = word.text.substring(0, halfLength);
                const line2 = word.text.substring(halfLength);
                
                ctx.fillText(
                    line1,
                    word.x * cellWidth + cellWidth / 2,
                    word.y * cellHeight + cellHeight / 2 - fontSize
                );
                ctx.fillText(
                    line2,
                    word.x * cellWidth + cellWidth / 2,
                    word.y * cellHeight + cellHeight / 2 + fontSize
                );
            } else {
                // Display shorter words on a single line
                ctx.fillText(
                    word.text,
                    word.x * cellWidth + cellWidth / 2,
                    word.y * cellHeight + cellHeight / 2
                );
            }
        }
    }
    
    // Draw enemies - properly sized and centered in cells
    for (const enemy of enemies) {
        // Calculate size to fit within cell with padding
        const maxSize = Math.min(cellWidth, cellHeight) * 0.7; // 70% of cell size
        
        // Draw enemy centered in cell
        ctx.drawImage(
            assets.enemy,
            enemy.x * cellWidth + (cellWidth - maxSize) / 2,
            enemy.y * cellHeight + (cellHeight - maxSize) / 2,
            maxSize,
            maxSize
        );
    }
    
    // Draw player - properly sized and centered in cell
    const maxPlayerSize = Math.min(cellWidth, cellHeight) * 0.7; // 70% of cell size
    
    ctx.drawImage(
        assets.player,
        player.x * cellWidth + (cellWidth - maxPlayerSize) / 2,
        player.y * cellHeight + (cellHeight - maxPlayerSize) / 2,
        maxPlayerSize,
        maxPlayerSize
    );
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
}

// Update lives display
function updateLivesDisplay() {
    const livesContainer = document.getElementById('lives-container');
    livesContainer.innerHTML = 'Lives: ';
    
    for (let i = 0; i < lives; i++) {
        const lifeIcon = document.createElement('img');
        lifeIcon.src = assets.lifeIcon.src;
        lifeIcon.classList.add('life-icon');
        livesContainer.appendChild(lifeIcon);
    }
}

// Show explanation for correct word
function showExplanation(word) {
    if (explanations[word]) {
        const factPopup = document.getElementById('fact-popup');
        const factText = document.getElementById('fact-text');
        
        factText.textContent = explanations[word];
        factPopup.classList.remove('hidden');
        
        // Hide popup after 6 seconds (increased from 3 for better readability)
        setTimeout(() => {
            factPopup.classList.add('hidden');
        }, 6000);
    }
}

// Show a specific screen
function showScreen(screenId) {
    hideAllScreens();
    document.getElementById(screenId).classList.remove('hidden');
}

// Hide all screens
function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('hidden'));
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize game when page loads
window.addEventListener('load', init);
