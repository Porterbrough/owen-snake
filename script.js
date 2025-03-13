// Game canvas and context
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 7;

// Game elements
let snake = [];
let food = {};
let score = 0;

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
    score = 0;
    xVelocity = 0;
    yVelocity = 0;
    lastXVelocity = 0;
    lastYVelocity = 0;
    gameOver = false;
    
    // Create initial snake (3 segments)
    snake[0] = { x: 10, y: 10 };
    snake[1] = { x: 9, y: 10 };
    snake[2] = { x: 8, y: 10 };
    
    // Place initial food
    placeFood();
    
    // Update score display
    document.getElementById('score').textContent = score;
}

// Place food at random position
function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Check if food spawned on snake body
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === food.x && snake[i].y === food.y) {
            placeFood(); // Try again
            break;
        }
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    setTimeout(function() {
        requestAnimationFrame(gameLoop);
        if (!gameOver) {
            updateGame();
            drawGame();
        }
    }, 1000 / speed);
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
    if (headX < 0) headX = tileCount - 1;
    if (headX >= tileCount) headX = 0;
    if (headY < 0) headY = tileCount - 1;
    if (headY >= tileCount) headY = 0;
    
    // Check for self collision
    for (let i = 1; i < snake.length; i++) {
        if (headX === snake[i].x && headY === snake[i].y) {
            gameOver = true;
            return;
        }
    }
    
    // Add new head segment
    snake.unshift({ x: headX, y: headY });
    
    // Check for food collision
    if (headX === food.x && headY === food.y) {
        score++;
        document.getElementById('score').textContent = score;
        placeFood();
        
        // Increase speed every 5 points
        if (score % 5 === 0 && speed < 15) {
            speed++;
        }
    } else {
        // Remove tail segment if no food eaten
        snake.pop();
    }
}

// Draw game elements
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#d0e8d0';
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
    
    // Draw food
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        // Use different color for head
        if (i === 0) {
            ctx.fillStyle = '#388E3C'; // Dark green for head
        } else {
            ctx.fillStyle = '#4CAF50'; // Lighter green for body
        }
        
        ctx.fillRect(
            snake[i].x * gridSize + 1,
            snake[i].y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        
        // Add eyes to the head
        if (i === 0) {
            ctx.fillStyle = 'white';
            
            // Position eyes based on direction
            let eyeSize = gridSize / 6;
            let eyeOffset = gridSize / 4;
            
            // Default eye positions (facing right)
            let leftEyeX = snake[0].x * gridSize + gridSize - eyeOffset;
            let leftEyeY = snake[0].y * gridSize + eyeOffset;
            let rightEyeX = snake[0].x * gridSize + gridSize - eyeOffset;
            let rightEyeY = snake[0].y * gridSize + gridSize - eyeOffset;
            
            // Adjust eye positions based on direction
            if (xVelocity === -1) { // Left
                leftEyeX = snake[0].x * gridSize + eyeOffset;
                leftEyeY = snake[0].y * gridSize + eyeOffset;
                rightEyeX = snake[0].x * gridSize + eyeOffset;
                rightEyeY = snake[0].y * gridSize + gridSize - eyeOffset;
            } else if (yVelocity === -1) { // Up
                leftEyeX = snake[0].x * gridSize + eyeOffset;
                leftEyeY = snake[0].y * gridSize + eyeOffset;
                rightEyeX = snake[0].x * gridSize + gridSize - eyeOffset;
                rightEyeY = snake[0].y * gridSize + eyeOffset;
            } else if (yVelocity === 1) { // Down
                leftEyeX = snake[0].x * gridSize + eyeOffset;
                leftEyeY = snake[0].y * gridSize + gridSize - eyeOffset;
                rightEyeX = snake[0].x * gridSize + gridSize - eyeOffset;
                rightEyeY = snake[0].y * gridSize + gridSize - eyeOffset;
            }
            
            // Draw eyes
            ctx.beginPath();
            ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw game over message
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
        
        ctx.font = '16px Arial';
        ctx.fillText('Press Start to Play Again', canvas.width / 2, canvas.height / 2 + 45);
        
        gameRunning = false;
    }
}

// Event Listeners
document.getElementById('start').addEventListener('click', function() {
    if (gameRunning && !gameOver) return;
    
    initGame();
    gameRunning = true;
    gameLoop();
    
    // Set initial direction to right
    xVelocity = 1;
    yVelocity = 0;
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
    initGame();
    drawGame();
});