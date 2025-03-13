// Game canvas and context
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 7; // Default speed (will be set by speed selector)
const speedOptions = {
    slow: 5,
    normal: 7,
    fast: 10
};
let appleCount = 1; // Default number of apples
let movingApples = false; // Whether apples move around
let backgroundColor = '#e8f5e9'; // Default background color

// Game elements
let snake = [];
let foods = []; // Array to hold multiple food items
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Load high score from local storage
let lastFrameTime = 0; // For frame-independent movement
const FPS = 60; // Target frames per second

// Snake colors
const snakeColorOptions = [
    { base: '#2E7D32', scales: '#1B5E20', head: '#1B5E20' }, // Green
    { base: '#D32F2F', scales: '#B71C1C', head: '#B71C1C' }, // Red
    { base: '#1976D2', scales: '#0D47A1', head: '#0D47A1' }, // Blue
    { base: '#FFA000', scales: '#FF6F00', head: '#FF6F00' }, // Orange
    { base: '#7B1FA2', scales: '#4A148C', head: '#4A148C' }, // Purple
    { base: '#FF5722', scales: '#E64A19', head: '#E64A19' }, // Deep Orange
    { base: '#FFC107', scales: '#FFA000', head: '#FFA000' }, // Amber
    { base: '#00BCD4', scales: '#0097A7', head: '#0097A7' }  // Cyan
];
let currentSnakeColorIndex = 0;

// Create snake texture images
function createSnakeTextures() {
    // Get current snake color
    const currentColor = snakeColorOptions[currentSnakeColorIndex];
    
    // Create snake skin texture
    const snakeSkinCanvas = document.createElement('canvas');
    snakeSkinCanvas.width = 100;
    snakeSkinCanvas.height = 100;
    const skinCtx = snakeSkinCanvas.getContext('2d');
    
    // Create a snake skin pattern with scales using the current color
    skinCtx.fillStyle = currentColor.base;
    skinCtx.fillRect(0, 0, 100, 100);
    
    // Add scale pattern
    skinCtx.fillStyle = currentColor.scales;
    
    // Draw diamond pattern scales
    for (let y = 0; y < 100; y += 10) {
        for (let x = 0; x < 100; x += 10) {
            skinCtx.beginPath();
            skinCtx.moveTo(x + 5, y);
            skinCtx.lineTo(x + 10, y + 5);
            skinCtx.lineTo(x + 5, y + 10);
            skinCtx.lineTo(x, y + 5);
            skinCtx.closePath();
            skinCtx.fill();
        }
    }
    
    // Add highlight on scales
    skinCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let y = 0; y < 100; y += 10) {
        for (let x = 0; x < 100; x += 10) {
            skinCtx.beginPath();
            skinCtx.moveTo(x + 5, y);
            skinCtx.lineTo(x + 7, y + 2);
            skinCtx.lineTo(x + 5, y + 4);
            skinCtx.lineTo(x + 3, y + 2);
            skinCtx.closePath();
            skinCtx.fill();
        }
    }
    
    // Create snake head texture
    const snakeHeadCanvas = document.createElement('canvas');
    snakeHeadCanvas.width = 50;
    snakeHeadCanvas.height = 50;
    const headCtx = snakeHeadCanvas.getContext('2d');
    
    // Draw triangular head shape
    headCtx.fillStyle = currentColor.head;
    headCtx.beginPath();
    headCtx.moveTo(50, 25);
    headCtx.lineTo(5, 5);
    headCtx.lineTo(5, 45);
    headCtx.closePath();
    headCtx.fill();
    
    // Draw eyes
    headCtx.fillStyle = 'white';
    headCtx.beginPath();
    headCtx.arc(20, 15, 5, 0, Math.PI * 2);
    headCtx.arc(20, 35, 5, 0, Math.PI * 2);
    headCtx.fill();
    
    // Draw pupils
    headCtx.fillStyle = 'black';
    headCtx.beginPath();
    headCtx.arc(22, 15, 2, 0, Math.PI * 2);
    headCtx.arc(22, 35, 2, 0, Math.PI * 2);
    headCtx.fill();
    
    // Apply textures to images
    snakeImage.src = snakeSkinCanvas.toDataURL();
    snakeHeadImage.src = snakeHeadCanvas.toDataURL();
}

// Snake visuals
let snakeImage = new Image();
let snakeHeadImage = new Image();
createSnakeTextures();

// Snake position interpolation for smooth movement
let snakePositions = []; // Array to track intermediate positions

// Direction and game state
let xVelocity = 0;
let yVelocity = 0;
let lastXVelocity = 0;
let lastYVelocity = 0;
let gameRunning = false;
let gameOver = false;

// Initialize game
function initGame() {
    // Reset variables
    snake = [];
    snakePositions = [];
    score = 0;
    xVelocity = 0;
    yVelocity = 0;
    lastXVelocity = 0;
    lastYVelocity = 0;
    gameOver = false;
    
    // Reset snake color to the default (green)
    currentSnakeColorIndex = 0;
    createSnakeTextures();
    
    // Get the apple count from input
    appleCount = parseInt(document.getElementById('apple-count').value);
    // Ensure it's within valid range
    appleCount = Math.min(Math.max(appleCount, 1), 10);
    document.getElementById('apple-count').value = appleCount;
    
    // Check if moving apples is enabled
    movingApples = document.getElementById('moving-apples').checked;
    
    // Get speed from selector
    const speedSetting = document.getElementById('speed-select').value;
    speed = speedOptions[speedSetting];
    
    // Get background color
    backgroundColor = document.getElementById('bg-color').value || '#e8f5e9';
    
    // Create initial snake (3 segments)
    snake[0] = { x: 10, y: 10 };
    snake[1] = { x: 9, y: 10 };
    snake[2] = { x: 8, y: 10 };
    
    // Initialize snake positions array for smooth animation
    for (let i = 0; i < snake.length; i++) {
        snakePositions[i] = {
            x: snake[i].x,
            y: snake[i].y,
            xFrac: snake[i].x,
            yFrac: snake[i].y
        };
    }
    
    // Place initial food
    placeFood();
    
    // Update score display
    document.getElementById('score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
}

// Place food at random position
function placeFood(count = appleCount) {
    // If we're starting the game, clear the foods array
    if (count === appleCount) {
        foods = [];
    }
    
    // Calculate how many apples we need to add
    const applesNeeded = count - foods.length;
    
    // Add the requested number of food items
    for (let f = 0; f < applesNeeded; f++) {
        let newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
            // For moving apples, add velocity and fractional position
            xFrac: Math.floor(Math.random() * tileCount),
            yFrac: Math.floor(Math.random() * tileCount),
            xVel: (Math.random() * 0.1 - 0.05), // Random small x velocity
            yVel: (Math.random() * 0.1 - 0.05)  // Random small y velocity
        };
        
        // Check if food spawned on snake body or other food
        let validPosition = false;
        while (!validPosition) {
            validPosition = true;
            
            // Check collision with snake
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === Math.floor(newFood.xFrac) && 
                    snake[i].y === Math.floor(newFood.yFrac)) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check collision with other foods
            for (let i = 0; i < foods.length; i++) {
                if (Math.floor(foods[i].xFrac) === Math.floor(newFood.xFrac) && 
                    Math.floor(foods[i].yFrac) === Math.floor(newFood.yFrac)) {
                    validPosition = false;
                    break;
                }
            }
            
            if (!validPosition) {
                newFood = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount),
                    xFrac: Math.floor(Math.random() * tileCount),
                    yFrac: Math.floor(Math.random() * tileCount),
                    xVel: (Math.random() * 0.1 - 0.05),
                    yVel: (Math.random() * 0.1 - 0.05)
                };
            }
        }
        
        // Set integer coordinates based on fractional position
        newFood.x = Math.floor(newFood.xFrac);
        newFood.y = Math.floor(newFood.yFrac);
        
        foods.push(newFood);
    }
}

// Update food positions if moving apples are enabled
function updateFoodPositions(deltaTime) {
    if (!movingApples) return;
    
    for (let i = 0; i < foods.length; i++) {
        // Update fractional positions
        foods[i].xFrac += foods[i].xVel * deltaTime;
        foods[i].yFrac += foods[i].yVel * deltaTime;
        
        // Bounce off walls
        if (foods[i].xFrac < 0) {
            foods[i].xFrac = 0;
            foods[i].xVel = -foods[i].xVel;
        } else if (foods[i].xFrac > tileCount - 1) {
            foods[i].xFrac = tileCount - 1;
            foods[i].xVel = -foods[i].xVel;
        }
        
        if (foods[i].yFrac < 0) {
            foods[i].yFrac = 0;
            foods[i].yVel = -foods[i].yVel;
        } else if (foods[i].yFrac > tileCount - 1) {
            foods[i].yFrac = tileCount - 1;
            foods[i].yVel = -foods[i].yVel;
        }
        
        // Update integer coordinates
        foods[i].x = Math.floor(foods[i].xFrac);
        foods[i].y = Math.floor(foods[i].yFrac);
    }
}

// Game loop
function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    // Calculate delta time for smooth animation
    if (!lastFrameTime) lastFrameTime = timestamp;
    const deltaTime = (timestamp - lastFrameTime) / (1000 / FPS); // Convert to frame time
    lastFrameTime = timestamp;
    
    // Accumulator for snake update timing
    if (!gameLoop.accumulator) gameLoop.accumulator = 0;
    gameLoop.accumulator += deltaTime;
    
    if (!gameOver) {
        // Always update food positions for smooth animation
        updateFoodPositions(deltaTime);
        
        // Update snake position based on speed
        const updateRate = FPS / speed;
        let updated = false;
        
        while (gameLoop.accumulator >= updateRate) {
            updateGame();
            gameLoop.accumulator -= updateRate;
            updated = true;
        }
        
        // Update snake position interpolation for smooth movement
        if (updated && snake.length > 0) {
            updateSnakeInterpolation(gameLoop.accumulator / updateRate);
        }
        
        // Always draw
        drawGame();
    }
    
    requestAnimationFrame(gameLoop);
}

// Update snake position interpolation for smooth movement
function updateSnakeInterpolation(t) {
    // If we don't have enough position data, initialize it
    if (snakePositions.length !== snake.length) {
        snakePositions = [];
        for (let i = 0; i < snake.length; i++) {
            snakePositions[i] = {
                x: snake[i].x,
                y: snake[i].y,
                xFrac: snake[i].x,
                yFrac: snake[i].y
            };
        }
        return;
    }
    
    // Update the target positions to match current snake positions
    for (let i = 0; i < snake.length; i++) {
        // Store current position as previous
        snakePositions[i].prevX = snakePositions[i].x;
        snakePositions[i].prevY = snakePositions[i].y;
        
        // Set new target position
        snakePositions[i].x = snake[i].x;
        snakePositions[i].y = snake[i].y;
        
        // Calculate fractional position for smooth movement
        snakePositions[i].xFrac = snakePositions[i].prevX + (snakePositions[i].x - snakePositions[i].prevX) * t;
        snakePositions[i].yFrac = snakePositions[i].prevY + (snakePositions[i].y - snakePositions[i].prevY) * t;
    }
}

// Update game state
function updateGame() {
    // Save last direction
    lastXVelocity = xVelocity;
    lastYVelocity = yVelocity;
    
    // Move snake
    let headX = snake[0].x + xVelocity;
    let headY = snake[0].y + yVelocity;
    
    // Check for wall collision
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        gameOver = true;
        return;
    }
    
    // Check for self collision
    for (let i = 1; i < snake.length; i++) {
        if (headX === snake[i].x && headY === snake[i].y) {
            gameOver = true;
            return;
        }
    }
    
    // Add new head segment
    snake.unshift({ x: headX, y: headY });
    
    // Check for food collision with any of the apples
    let foodEaten = false;
    for (let i = 0; i < foods.length; i++) {
        // For both moving and stationary apples, use the grid cell they're currently in
        const foodX = Math.floor(foods[i].xFrac);
        const foodY = Math.floor(foods[i].yFrac);
        
        if (headX === foodX && headY === foodY) {
            // Remove the eaten food
            foods.splice(i, 1);
            
            // Increase score
            score++;
            document.getElementById('score').textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                document.getElementById('high-score').textContent = highScore;
            }
            
            // Change snake color
            currentSnakeColorIndex = (currentSnakeColorIndex + 1) % snakeColorOptions.length;
            createSnakeTextures();
            
            // Always place a new food immediately when one is eaten
            placeFood(1); // Place exactly one new food
            
            // Increase length of snake positions array for smooth animation
            if (snakePositions.length > 0) {
                snakePositions.push({...snakePositions[snakePositions.length - 1]});
            }
            
            foodEaten = true;
            break;
        }
    }
    
    // Remove tail segment if no food eaten
    if (!foodEaten) {
        snake.pop();
    }
}

// Draw game elements
function drawGame() {
    // Clear canvas with selected background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines with slightly darker shade of the background
    const gridColor = adjustColor(backgroundColor, -20);
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 1; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 1; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw all apples
    for (let i = 0; i < foods.length; i++) {
        // Use fractional positions for smoother animation if moving
        const fractX = movingApples ? foods[i].xFrac : foods[i].x;
        const fractY = movingApples ? foods[i].yFrac : foods[i].y;
        
        const appleX = fractX * gridSize + gridSize / 2;
        const appleY = fractY * gridSize + gridSize / 2;
        const appleRadius = gridSize / 2 - 2;
        
        // Apple body
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(appleX, appleY, appleRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Apple stem
        ctx.fillStyle = '#4E342E';
        ctx.beginPath();
        ctx.fillRect(appleX - 2, appleY - appleRadius - 3, 3, 5);
        
        // Apple shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(appleX - appleRadius/3, appleY - appleRadius/3, appleRadius/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Apple leaf
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(appleX + 3, appleY - appleRadius - 1, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw snake with texture
    if (snake.length > 0 && snakePositions.length > 0) {
        // Create smooth path for the entire snake body
        const path = new Path2D();
        const controlPoints = [];
        
        // Draw body segments as a path using interpolated positions
        for (let i = 0; i < snakePositions.length; i++) {
            // Use fractional positions for smooth movement
            const segX = snakePositions[i].xFrac * gridSize;
            const segY = snakePositions[i].yFrac * gridSize;
            
            // Add control points for smooth curves
            controlPoints.push({
                x: segX + gridSize / 2,
                y: segY + gridSize / 2
            });
        }
        
        // Draw snake body as a spline curve
        if (controlPoints.length >= 2) {
            // Start the path at the head
            path.moveTo(controlPoints[0].x, controlPoints[0].y);
            
            // Draw curves connecting all points
            for (let i = 1; i < controlPoints.length; i++) {
                if (i === 1) {
                    // First segment after head - straight line
                    path.lineTo(controlPoints[i].x, controlPoints[i].y);
                } else {
                    // Use a smooth curve for body
                    const prevX = controlPoints[i-1].x;
                    const prevY = controlPoints[i-1].y;
                    const currX = controlPoints[i].x;
                    const currY = controlPoints[i].y;
                    
                    // Use quadratic curve for smoother corners
                    path.quadraticCurveTo(
                        prevX,
                        prevY,
                        (prevX + currX) / 2,
                        (prevY + currY) / 2
                    );
                }
            }
        }
        
        // Calculate snake head position from interpolated data
        const headX = snakePositions[0].xFrac * gridSize;
        const headY = snakePositions[0].yFrac * gridSize;
        
        // Calculate snake width based on score (grows as snake gets longer)
        const baseWidth = gridSize - 4;
        const maxGrowth = 8; // max extra width
        const growthFactor = Math.min(score / 20, 1); // reach max size at score 20
        const snakeWidth = baseWidth + (maxGrowth * growthFactor);
        
        // Draw snake body with texture
        ctx.save();
        ctx.lineWidth = snakeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Use snake skin texture if image loaded, otherwise use a gradient
        if (snakeImage.complete && snakeImage.naturalWidth > 0) {
            const pattern = ctx.createPattern(snakeImage, 'repeat');
            ctx.strokeStyle = pattern;
        } else {
            // Gradient as fallback
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#2E7D32');
            gradient.addColorStop(0.5, '#388E3C');
            gradient.addColorStop(1, '#2E7D32');
            ctx.strokeStyle = gradient;
        }
        
        ctx.stroke(path);
        ctx.restore();
        
        // Draw snake head with rotation based on direction
        ctx.save();
        ctx.translate(headX + gridSize/2, headY + gridSize/2);
        
        // Determine head rotation based on direction
        if (xVelocity === 1) { // Right
            ctx.rotate(0);
        } else if (xVelocity === -1) { // Left
            ctx.rotate(Math.PI);
        } else if (yVelocity === -1) { // Up
            ctx.rotate(-Math.PI/2);
        } else if (yVelocity === 1) { // Down
            ctx.rotate(Math.PI/2);
        }
        
        // Draw snake head
        const headSize = gridSize + (4 * growthFactor); // Head slightly larger than body
        
        // Use snake head image if loaded, otherwise draw a green head
        if (snakeHeadImage.complete && snakeHeadImage.naturalWidth > 0) {
            ctx.drawImage(
                snakeHeadImage, 
                -headSize/2, 
                -headSize/2, 
                headSize, 
                headSize
            );
        } else {
            // Fallback head
            ctx.fillStyle = '#1B5E20';
            ctx.beginPath();
            
            // Triangular head shape
            ctx.moveTo(headSize/2, 0);
            ctx.lineTo(-headSize/2, -headSize/2);
            ctx.lineTo(-headSize/2, headSize/2);
            ctx.closePath();
            ctx.fill();
            
            // Eyes
            const eyeSize = headSize/6;
            const eyeOffset = headSize/4;
            
            // Left eye
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(0, -eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Right eye
            ctx.beginPath();
            ctx.arc(0, eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(eyeSize/2, -eyeOffset, eyeSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(eyeSize/2, eyeOffset, eyeSize/2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw tongue occasionally
        if (Math.random() < 0.3) { // 30% chance each frame
            const tongueLength = gridSize/2 + 5;
            const tongueWidth = gridSize/8;
            
            ctx.fillStyle = '#FF1744';
            ctx.beginPath();
            ctx.moveTo(headSize/2, 0);
            ctx.lineTo(headSize/2 + tongueLength, -tongueWidth);
            ctx.lineTo(headSize/2 + tongueLength - 3, 0);
            ctx.lineTo(headSize/2 + tongueLength, tongueWidth);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Draw game over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
        
        // Show current score
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 - 15);
        
        // Show high score
        ctx.fillStyle = score > highScore ? '#FFC107' : 'white'; // Highlight with gold if new high score
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 15);
        
        // New high score message
        if (score > highScore - 1) { // Showing for current high score as well
            ctx.fillStyle = '#FFC107'; // Gold
            ctx.font = '24px Arial';
            ctx.fillText('New High Score!', canvas.width / 2, canvas.height / 2 + 45);
        }
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Press Start to Play Again', canvas.width / 2, canvas.height / 2 + 75);
        
        gameRunning = false;
    }
}

// Helper function to adjust a color's brightness
function adjustColor(color, amount) {
    // Remove the # if present
    color = color.replace('#', '');
    
    // Parse the color
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    
    // Adjust each component
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Event Listeners
document.getElementById('start').addEventListener('click', function() {
    if (gameRunning && !gameOver) return;
    
    // Reset timing variables
    lastFrameTime = 0;
    gameLoop.accumulator = 0;
    
    // Initialize the game
    initGame();
    gameRunning = true;
    
    // Set initial direction to right
    xVelocity = 1;
    yVelocity = 0;
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
});

// Keyboard controls
document.addEventListener('keydown', function(e) {
    // Left Arrow or A
    if ((e.key === 'ArrowLeft' || e.key === 'a') && lastXVelocity !== 1) {
        xVelocity = -1;
        yVelocity = 0;
    }
    // Right Arrow or D
    else if ((e.key === 'ArrowRight' || e.key === 'd') && lastXVelocity !== -1) {
        xVelocity = 1;
        yVelocity = 0;
    }
    // Up Arrow or W
    else if ((e.key === 'ArrowUp' || e.key === 'w') && lastYVelocity !== 1) {
        xVelocity = 0;
        yVelocity = -1;
    }
    // Down Arrow or S
    else if ((e.key === 'ArrowDown' || e.key === 's') && lastYVelocity !== -1) {
        xVelocity = 0;
        yVelocity = 1;
    }
    // Space to start game
    else if (e.key === ' ' && (!gameRunning || gameOver)) {
        document.getElementById('start').click();
    }
});

// Mobile controls
document.getElementById('up').addEventListener('click', function() {
    if (lastYVelocity !== 1 && gameRunning) {
        xVelocity = 0;
        yVelocity = -1;
    }
});

document.getElementById('down').addEventListener('click', function() {
    if (lastYVelocity !== -1 && gameRunning) {
        xVelocity = 0;
        yVelocity = 1;
    }
});

document.getElementById('left').addEventListener('click', function() {
    if (lastXVelocity !== 1 && gameRunning) {
        xVelocity = -1;
        yVelocity = 0;
    }
});

document.getElementById('right').addEventListener('click', function() {
    if (lastXVelocity !== -1 && gameRunning) {
        xVelocity = 1;
        yVelocity = 0;
    }
});

// Create a README file to explain how to play and deploy
document.addEventListener('DOMContentLoaded', function() {
    // Set high score display
    document.getElementById('high-score').textContent = highScore;
    
    // Initialize game
    initGame();
    drawGame();
});