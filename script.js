// Game canvas and context
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = 7;
let appleCount = 1; // Default number of apples

// Game elements
let snake = [];
let foods = []; // Array to hold multiple food items
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Load high score from local storage

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
    
    // Get the apple count from input
    appleCount = parseInt(document.getElementById('apple-count').value);
    // Ensure it's within valid range
    appleCount = Math.min(Math.max(appleCount, 1), 10);
    document.getElementById('apple-count').value = appleCount;
    
    // Create initial snake (3 segments)
    snake[0] = { x: 10, y: 10 };
    snake[1] = { x: 9, y: 10 };
    snake[2] = { x: 8, y: 10 };
    
    // Place initial food
    placeFood();
    
    // Update score display
    document.getElementById('score').textContent = score;
    document.getElementById('high-score').textContent = highScore;
}

// Place food at random position
function placeFood() {
    // Clear the foods array
    foods = [];
    
    // Add the requested number of food items
    for (let f = 0; f < appleCount; f++) {
        let newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Check if food spawned on snake body or other food
        let validPosition = false;
        while (!validPosition) {
            validPosition = true;
            
            // Check collision with snake
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check collision with other foods
            for (let i = 0; i < foods.length; i++) {
                if (foods[i].x === newFood.x && foods[i].y === newFood.y) {
                    validPosition = false;
                    break;
                }
            }
            
            if (!validPosition) {
                newFood = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
            }
        }
        
        foods.push(newFood);
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
    
    // Check for food collision with any of the apples
    let foodEaten = false;
    for (let i = 0; i < foods.length; i++) {
        if (headX === foods[i].x && headY === foods[i].y) {
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
            
            // Place a new food if all are eaten
            if (foods.length === 0) {
                placeFood();
            }
            
            // Increase speed every 5 points
            if (score % 5 === 0 && speed < 15) {
                speed++;
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
    
    // Draw all apples
    for (let i = 0; i < foods.length; i++) {
        const appleX = foods[i].x * gridSize + gridSize / 2;
        const appleY = foods[i].y * gridSize + gridSize / 2;
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
    
    // Draw snake as a continuous shape
    if (snake.length > 0) {
        // Draw snake body first
        ctx.fillStyle = '#2E7D32'; // Base green for snake body
        
        // Create path for the entire snake body
        ctx.beginPath();
        
        // Draw body segments as a path
        for (let i = 0; i < snake.length; i++) {
            const segX = snake[i].x * gridSize;
            const segY = snake[i].y * gridSize;
            
            if (i === 0) {
                // First segment - will be drawn separately with eyes
                continue;
            } else {
                // Calculate position relative to previous segment
                const prevX = snake[i-1].x;
                const prevY = snake[i-1].y;
                const currX = snake[i].x;
                const currY = snake[i].y;
                
                // Draw continuous snake body section
                if (i === 1) {
                    // This is the segment after the head
                    ctx.moveTo(segX + gridSize/2, segY + gridSize/2);
                } else {
                    // Connect to the previous segment with curves to make it smooth
                    const midX = (snake[i-1].x * gridSize + segX) / 2;
                    const midY = (snake[i-1].y * gridSize + segY) / 2;
                    
                    if (prevX === currX) { // Vertical connection
                        ctx.lineTo(segX + gridSize/2, segY + gridSize/2);
                    } else if (prevY === currY) { // Horizontal connection
                        ctx.lineTo(segX + gridSize/2, segY + gridSize/2);
                    } else {
                        // This is a corner - make it rounded
                        ctx.quadraticCurveTo(
                            snake[i-1].x * gridSize + gridSize/2, 
                            snake[i-1].y * gridSize + gridSize/2,
                            midX + gridSize/2, 
                            midY + gridSize/2
                        );
                        ctx.lineTo(segX + gridSize/2, segY + gridSize/2);
                    }
                }
                
                // Draw connected snake body segment
                ctx.lineWidth = gridSize - 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
        
        // Stroke the entire connected snake body
        ctx.strokeStyle = '#2E7D32'; // Dark green
        ctx.stroke();
        
        // Add scale pattern to the snake body
        for (let i = 1; i < snake.length; i++) {
            const segX = snake[i].x * gridSize;
            const segY = snake[i].y * gridSize;
            
            // Add a subtle scale pattern
            ctx.fillStyle = '#388E3C'; // Lighter green
            ctx.beginPath();
            ctx.arc(segX + gridSize/2, segY + gridSize/2, gridSize/6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw snake head
        const headX = snake[0].x * gridSize;
        const headY = snake[0].y * gridSize;
        
        ctx.fillStyle = '#1B5E20'; // Darker green for head
        
        // Draw rounded snake head
        ctx.beginPath();
        
        // Determine head direction
        if (xVelocity === 1) { // Right
            ctx.arc(
                headX + gridSize - 2, 
                headY + gridSize / 2, 
                gridSize / 2, 
                Math.PI * 0.5, 
                Math.PI * 1.5, 
                true
            );
            ctx.fillRect(headX, headY + 1, gridSize / 2, gridSize - 2);
        } else if (xVelocity === -1) { // Left
            ctx.arc(
                headX + 2, 
                headY + gridSize / 2, 
                gridSize / 2, 
                Math.PI * 0.5, 
                Math.PI * 1.5, 
                false
            );
            ctx.fillRect(headX + gridSize / 2, headY + 1, gridSize / 2, gridSize - 2);
        } else if (yVelocity === -1) { // Up
            ctx.arc(
                headX + gridSize / 2, 
                headY + 2, 
                gridSize / 2, 
                0, 
                Math.PI, 
                false
            );
            ctx.fillRect(headX + 1, headY + gridSize / 2, gridSize - 2, gridSize / 2);
        } else if (yVelocity === 1) { // Down
            ctx.arc(
                headX + gridSize / 2, 
                headY + gridSize - 2, 
                gridSize / 2, 
                Math.PI, 
                Math.PI * 2, 
                false
            );
            ctx.fillRect(headX + 1, headY, gridSize - 2, gridSize / 2);
        } else { // Default (static)
            ctx.arc(headX + gridSize / 2, headY + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
        }
        ctx.fill();
        
        // Position eyes based on direction
        let eyeSize = gridSize / 8;
        let eyeOffset = gridSize / 3.5;
        let pupilSize = eyeSize / 2;
        
        // Default eye positions (facing right)
        let leftEyeX = headX + gridSize - eyeOffset;
        let leftEyeY = headY + eyeOffset;
        let rightEyeX = headX + gridSize - eyeOffset;
        let rightEyeY = headY + gridSize - eyeOffset;
        
        // Adjust eye positions based on direction
        if (xVelocity === -1) { // Left
            leftEyeX = headX + eyeOffset;
            leftEyeY = headY + eyeOffset;
            rightEyeX = headX + eyeOffset;
            rightEyeY = headY + gridSize - eyeOffset;
        } else if (yVelocity === -1) { // Up
            leftEyeX = headX + eyeOffset;
            leftEyeY = headY + eyeOffset;
            rightEyeX = headX + gridSize - eyeOffset;
            rightEyeY = headY + eyeOffset;
        } else if (yVelocity === 1) { // Down
            leftEyeX = headX + eyeOffset;
            leftEyeY = headY + gridSize - eyeOffset;
            rightEyeX = headX + gridSize - eyeOffset;
            rightEyeY = headY + gridSize - eyeOffset;
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
                ctx.moveTo(headX + gridSize, headY + gridSize / 2);
                ctx.lineTo(headX + gridSize + 8, headY + gridSize / 2 - 3);
                ctx.lineTo(headX + gridSize + 6, headY + gridSize / 2);
                ctx.lineTo(headX + gridSize + 8, headY + gridSize / 2 + 3);
                ctx.closePath();
                ctx.fill();
            } else if (xVelocity === -1) { // Left
                ctx.beginPath();
                ctx.moveTo(headX, headY + gridSize / 2);
                ctx.lineTo(headX - 8, headY + gridSize / 2 - 3);
                ctx.lineTo(headX - 6, headY + gridSize / 2);
                ctx.lineTo(headX - 8, headY + gridSize / 2 + 3);
                ctx.closePath();
                ctx.fill();
            } else if (yVelocity === -1) { // Up
                ctx.beginPath();
                ctx.moveTo(headX + gridSize / 2, headY);
                ctx.lineTo(headX + gridSize / 2 - 3, headY - 8);
                ctx.lineTo(headX + gridSize / 2, headY - 6);
                ctx.lineTo(headX + gridSize / 2 + 3, headY - 8);
                ctx.closePath();
                ctx.fill();
            } else if (yVelocity === 1) { // Down
                ctx.beginPath();
                ctx.moveTo(headX + gridSize / 2, headY + gridSize);
                ctx.lineTo(headX + gridSize / 2 - 3, headY + gridSize + 8);
                ctx.lineTo(headX + gridSize / 2, headY + gridSize + 6);
                ctx.lineTo(headX + gridSize / 2 + 3, headY + gridSize + 8);
                ctx.closePath();
                ctx.fill();
            }
        }
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
    // Set high score display
    document.getElementById('high-score').textContent = highScore;
    
    // Initialize game
    initGame();
    drawGame();
});