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
    
    // Draw apple
    const appleX = food.x * gridSize + gridSize / 2;
    const appleY = food.y * gridSize + gridSize / 2;
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
    
    // Draw snake
    // Create snake pattern and colors
    const snakePatterns = ['#2E7D32', '#388E3C']; // Dark and light green pattern
    
    // Draw each segment
    for (let i = 0; i < snake.length; i++) {
        const segX = snake[i].x * gridSize;
        const segY = snake[i].y * gridSize;
        
        // Determine if this is a corner piece
        let isCorner = false;
        let prevSegment = null;
        let nextSegment = null;
        
        if (i > 0) {
            prevSegment = snake[i - 1];
        }
        
        if (i < snake.length - 1) {
            nextSegment = snake[i + 1];
        }
        
        // Snake body pattern - alternating dark/light green
        ctx.fillStyle = snakePatterns[i % 2];
        
        // Special treatment for head
        if (i === 0) {
            ctx.fillStyle = '#1B5E20'; // Darker green for head
            
            // Draw rounded snake head
            ctx.beginPath();
            
            // Determine head direction
            if (xVelocity === 1) { // Right
                ctx.arc(
                    segX + gridSize - 2, 
                    segY + gridSize / 2, 
                    gridSize / 2 - 1, 
                    Math.PI * 0.5, 
                    Math.PI * 1.5, 
                    true
                );
                ctx.fillRect(segX, segY + 1, gridSize / 2, gridSize - 2);
            } else if (xVelocity === -1) { // Left
                ctx.arc(
                    segX + 2, 
                    segY + gridSize / 2, 
                    gridSize / 2 - 1, 
                    Math.PI * 0.5, 
                    Math.PI * 1.5, 
                    false
                );
                ctx.fillRect(segX + gridSize / 2, segY + 1, gridSize / 2, gridSize - 2);
            } else if (yVelocity === -1) { // Up
                ctx.arc(
                    segX + gridSize / 2, 
                    segY + 2, 
                    gridSize / 2 - 1, 
                    0, 
                    Math.PI, 
                    false
                );
                ctx.fillRect(segX + 1, segY + gridSize / 2, gridSize - 2, gridSize / 2);
            } else if (yVelocity === 1) { // Down
                ctx.arc(
                    segX + gridSize / 2, 
                    segY + gridSize - 2, 
                    gridSize / 2 - 1, 
                    Math.PI, 
                    Math.PI * 2, 
                    false
                );
                ctx.fillRect(segX + 1, segY, gridSize - 2, gridSize / 2);
            } else { // Default (static)
                ctx.fillRect(segX + 1, segY + 1, gridSize - 2, gridSize - 2);
            }
            ctx.fill();
            
            // Position eyes based on direction
            let eyeSize = gridSize / 8;
            let eyeOffset = gridSize / 3.5;
            let pupilSize = eyeSize / 2;
            
            // Default eye positions (facing right)
            let leftEyeX = segX + gridSize - eyeOffset;
            let leftEyeY = segY + eyeOffset;
            let rightEyeX = segX + gridSize - eyeOffset;
            let rightEyeY = segY + gridSize - eyeOffset;
            
            // Adjust eye positions based on direction
            if (xVelocity === -1) { // Left
                leftEyeX = segX + eyeOffset;
                leftEyeY = segY + eyeOffset;
                rightEyeX = segX + eyeOffset;
                rightEyeY = segY + gridSize - eyeOffset;
            } else if (yVelocity === -1) { // Up
                leftEyeX = segX + eyeOffset;
                leftEyeY = segY + eyeOffset;
                rightEyeX = segX + gridSize - eyeOffset;
                rightEyeY = segY + eyeOffset;
            } else if (yVelocity === 1) { // Down
                leftEyeX = segX + eyeOffset;
                leftEyeY = segY + gridSize - eyeOffset;
                rightEyeX = segX + gridSize - eyeOffset;
                rightEyeY = segY + gridSize - eyeOffset;
            }
            
            // Draw eyes (white part)
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw pupils (black part)
            ctx.fillStyle = 'black';
            
            // Adjust pupil position slightly in the direction of movement
            let pupilOffsetX = 0;
            let pupilOffsetY = 0;
            
            if (xVelocity === 1) pupilOffsetX = 1;
            if (xVelocity === -1) pupilOffsetX = -1;
            if (yVelocity === 1) pupilOffsetY = 1;
            if (yVelocity === -1) pupilOffsetY = -1;
            
            ctx.beginPath();
            ctx.arc(leftEyeX + pupilOffsetX, leftEyeY + pupilOffsetY, pupilSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(rightEyeX + pupilOffsetX, rightEyeY + pupilOffsetY, pupilSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw forked tongue occasionally
            if (Math.random() < 0.3) { // 30% chance each frame
                ctx.fillStyle = '#FF1744'; // Red tongue
                
                if (xVelocity === 1) { // Right
                    ctx.beginPath();
                    ctx.moveTo(segX + gridSize, segY + gridSize / 2);
                    ctx.lineTo(segX + gridSize + 8, segY + gridSize / 2 - 3);
                    ctx.lineTo(segX + gridSize + 6, segY + gridSize / 2);
                    ctx.lineTo(segX + gridSize + 8, segY + gridSize / 2 + 3);
                    ctx.closePath();
                    ctx.fill();
                } else if (xVelocity === -1) { // Left
                    ctx.beginPath();
                    ctx.moveTo(segX, segY + gridSize / 2);
                    ctx.lineTo(segX - 8, segY + gridSize / 2 - 3);
                    ctx.lineTo(segX - 6, segY + gridSize / 2);
                    ctx.lineTo(segX - 8, segY + gridSize / 2 + 3);
                    ctx.closePath();
                    ctx.fill();
                } else if (yVelocity === -1) { // Up
                    ctx.beginPath();
                    ctx.moveTo(segX + gridSize / 2, segY);
                    ctx.lineTo(segX + gridSize / 2 - 3, segY - 8);
                    ctx.lineTo(segX + gridSize / 2, segY - 6);
                    ctx.lineTo(segX + gridSize / 2 + 3, segY - 8);
                    ctx.closePath();
                    ctx.fill();
                } else if (yVelocity === 1) { // Down
                    ctx.beginPath();
                    ctx.moveTo(segX + gridSize / 2, segY + gridSize);
                    ctx.lineTo(segX + gridSize / 2 - 3, segY + gridSize + 8);
                    ctx.lineTo(segX + gridSize / 2, segY + gridSize + 6);
                    ctx.lineTo(segX + gridSize / 2 + 3, segY + gridSize + 8);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        } else {
            // Body segment with scale pattern
            ctx.fillRect(segX + 1, segY + 1, gridSize - 2, gridSize - 2);
            
            // Add scale pattern
            ctx.fillStyle = snakePatterns[(i + 1) % 2];
            
            // Add a diamond-shaped scale in the center of each segment
            ctx.beginPath();
            ctx.moveTo(segX + gridSize / 2, segY + 4);
            ctx.lineTo(segX + gridSize - 4, segY + gridSize / 2);
            ctx.lineTo(segX + gridSize / 2, segY + gridSize - 4);
            ctx.lineTo(segX + 4, segY + gridSize / 2);
            ctx.closePath();
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