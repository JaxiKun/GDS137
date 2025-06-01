const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- MENU SYSTEM ---
let gameState = "menu"; // "menu", "instructions", "game", "gameover"

// Button positions (relative to canvas)
const BUTTON_WIDTH = 200, BUTTON_HEIGHT = 50;
const startBtn = {
    x: canvas.width/2 - BUTTON_WIDTH/2,
    y: canvas.height/2,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT
};
const instrBtn = {
    x: canvas.width/2 - BUTTON_WIDTH/2,
    y: canvas.height/2 + 70,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT
};
const backBtn = {
    x: canvas.width/2 - BUTTON_WIDTH/2,
    y: canvas.height - 80,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT
};

// --- GAME CONSTANTS ---
const paddleWidth = 75;
const paddleHeight = 12;
const ballRadius = 8;

// --- BRICK VARIABLES ---
const brickRowCount = 5, brickColCount = 8;
const brickWidth = 50, brickHeight = 18, brickPadding = 8, brickOffsetTop = 30, brickOffsetLeft = 20;
let bricks = [];

// --- MENU DRAWING ---
function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.font = "bold 38px Arial";
    ctx.fillStyle = "#0ff";
    ctx.textAlign = "center";
    ctx.fillText("Breakout Star", canvas.width/2, 90);

    // Name
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("by Gideon Thomas", canvas.width/2, 135);

    // Start Button (visual only)
    drawButton(startBtn, "Press Enter to Start");

    // Instructions Button
    drawButton(instrBtn, "Instructions");
}

function drawButton(btn, text) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(btn.x, btn.y, btn.width, btn.height);
    ctx.fillStyle = "#222";
    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.font = "bold 26px Arial";
    ctx.fillStyle = "#0ff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, btn.x + btn.width/2, btn.y + btn.height/2);
    ctx.restore();
}

function drawInstructions() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#0ff";
    ctx.textAlign = "center";
    ctx.fillText("Instructions", canvas.width/2, 70);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    let y = 120;
    const lines = [
        "- Use A / D or Arrow keys to move the paddle.",
        "- Bounce the ball to break all the bricks.",
        "- Catch yellow (P) powerups for a bigger paddle.",
        "- Catch green (2x) powerups for double score.",
        "- Don't let the ball fall below the paddle!",
        "- You have 10 HP. Survive as long as you can.",
        "",
        "Press 'R' to restart after Game Over."
    ];
    for(let line of lines) {
        ctx.fillText(line, 50, y);
        y += 26; // Reduced line spacing
    }

    // Back Button (move it lower)
    drawButton({
        x: canvas.width/2 - BUTTON_WIDTH/2,
        y: canvas.height - 50, // Lowered from -80 to -50
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT
    }, "Back");
}

// --- MENU INTERACTION ---
canvas.addEventListener("mousedown", function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if(gameState === "menu") {
        // Only allow mouse for Instructions
        if(pointInRect(mx, my, instrBtn)) {
            gameState = "instructions";
        }
    } else if(gameState === "instructions") {
        const backBtnRect = {
            x: canvas.width/2 - BUTTON_WIDTH/2,
            y: canvas.height - 50,
            width: BUTTON_WIDTH,
            height: BUTTON_HEIGHT
        };
        if(pointInRect(mx, my, backBtnRect)) {
            gameState = "menu";
        }
    }
});

function pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
}

// --- GAME VARIABLES ---
let score = 0;
let health = 10;
let paddle, ball, powerups, powerupActive, powerupTimer, startTime, elapsedTime, gameOver;
let paddlePowerupTimer = 0;
let doubleScorePowerupTimer = 0;

// --- GAME START/RESET ---
function startGame() {
    // Reset all variables
    score = 0;
    health = 10;
    powerups = [];
    powerupActive = { paddle: false, doubleScore: false };
    powerupTimer = { paddle: 0, doubleScore: 0 };
    paddle = new GameObject(
        (canvas.width - paddleWidth) / 2,
        canvas.height - paddleHeight - 10,
        paddleWidth, paddleHeight, "#0ff"
    );
    ball = {
        x: canvas.width / 2,
        y: canvas.height - paddleHeight - 20,
        dx: .30,
        dy: -1.0,
        radius: ballRadius,
        color: "#fff"
    };
    resetBricks();
    startTime = Date.now();
    elapsedTime = 0;
    gameOver = false;
    gameState = "game";
}

// --- BRICK FUNCTIONS ---
function resetBricks() {
    bricks = [];
    for(let c=0; c<brickColCount; c++) {
        bricks[c] = [];
        for(let r=0; r<brickRowCount; r++) {
            let brickX = brickOffsetLeft + c*(brickWidth+brickPadding);
            let brickY = brickOffsetTop + r*(brickHeight+brickPadding);
            bricks[c][r] = { 
                x: brickX, 
                y: brickY, 
                status: 1, 
                color: `hsl(${r*60},80%,60%)`
            };
        }
    }
}

function drawBricks() {
    for(let c = 0; c < brickColCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if(b.status === 1) {
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
                ctx.strokeStyle = "#222";
                ctx.strokeRect(b.x, b.y, brickWidth, brickHeight);
            }
        }
    }
}

// --- GAME DRAW LOOP ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(gameState === "menu") {
        drawMenu();
    } else if(gameState === "instructions") {
        drawInstructions();
    } else if(gameOver) {
        drawGameOver();
    } else {
        drawBricks();
        paddle.draw(ctx);
        drawBall();
        drawScore();
        drawTimer();
        drawPowerups();
        drawHP();
        collisionDetection();
        updatePowerups();
        updateBricksRespawn();

        // Ball movement
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision
        if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx = -ball.dx;
        if(ball.y - ball.radius < 0) ball.dy = -ball.dy;
        else if(ball.y + ball.radius > canvas.height) {
            health--;
            if(health <= 0) {
                gameOver = true;
            }
            ball.x = canvas.width / 2;
            ball.y = canvas.height - paddleHeight - 20;
            ball.dx = 1.3;
            ball.dy = -1.2;
            paddle.x = (canvas.width - paddle.width) / 2;
            paddle.y = canvas.height - paddleHeight - 10;
        }

        // Paddle collision
        if(ball.x > paddle.x && ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height) {
            ball.dy = -ball.dy;
            ball.color = randomColor();
            let hitPos = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
            ball.dx = 1.5 * hitPos;
        }

        // Paddle movement (make it slower)
        if(rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += 2;
        if(leftPressed && paddle.x > 0) paddle.x -= 2;

        // Handle paddle powerup timer safely
        if (gameState === "game" && powerupActive && powerupActive.paddle && paddle) {
            paddlePowerupTimer--;
            if (paddlePowerupTimer <= 0) {
                powerupActive.paddle = false;
                paddle.width = paddleWidth; // Reset to normal size
            }
        }

        // Handle double score powerup timer safely
        if (gameState === "game" && powerupActive && powerupActive.doubleScore) {
            doubleScorePowerupTimer--;
            if (doubleScorePowerupTimer <= 0) {
                powerupActive.doubleScore = false;
            }
        }
    }
    requestAnimationFrame(draw);
}
draw(); // Start the draw loop

window.addEventListener("keydown", function(e) {
    if(gameState === "menu" && (e.key === "Enter" || e.keyCode === 13)) {
        startGame();
    }
    if(gameOver && (e.key === "r" || e.key === "R")) {
        startGame();
    }
});

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color || "#fff";
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#0ff";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 16, 28);
}

function drawTimer() {
    if (typeof startTime === "undefined") return;
    let now = Date.now();
    let elapsed = gameState === "game" ? Math.floor((now - startTime) / 1000) : 0;
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#0ff";
    ctx.textAlign = "right";
    ctx.fillText("Time: " + elapsed + "s", canvas.width - 16, 28);
}

function drawPowerups() {
    if (!powerups) return;
    for (const p of powerups) {
        ctx.save();
        ctx.fillStyle = p.color || "#ff0";
        ctx.fillRect(p.x, p.y, p.width || 20, p.height || 20);
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#222";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Show type or label if available
        if (p.type === "paddle") {
            ctx.fillText("P", p.x + (p.width || 20)/2, p.y + (p.height || 20)/2);
        } else if (p.type === "doubleScore") {
            ctx.fillText("2x", p.x + (p.width || 20)/2, p.y + (p.height || 20)/2);
        }
        ctx.restore();
    }
}

function collisionDetection() {
    // Ball-brick collision
    for(let c = 0; c < brickColCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                if(ball.x > b.x && ball.x < b.x + brickWidth &&
                   ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    // Double score if powerup is active
                    score += (powerupActive.doubleScore ? 2 : 1);
                    // 40% chance to spawn a powerup
                    if (Math.random() < 0.4) {
                        // Randomly choose type
                        let type = Math.random() < 0.5 ? "paddle" : "doubleScore";
                        powerups.push({
                            x: b.x + brickWidth/2 - 10,
                            y: b.y + brickHeight/2 - 10,
                            width: 20,
                            height: 20,
                            color: type === "paddle" ? "#ff0" : "#0f0",
                            type: type
                        });
                    }
                }
            }
        }
    }
    // Ball-powerup collision
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        // Paddle and powerup rectangle collision
        if (
            paddle.x < p.x + (p.width || 20) &&
            paddle.x + paddle.width > p.x &&
            paddle.y < p.y + (p.height || 20) &&
            paddle.y + paddle.height > p.y
        ) {
            if (p.type === "paddle") {
                powerupActive.paddle = true;
                paddlePowerupTimer = 30 * 60; // 30 seconds at 60 FPS
                paddle.width = paddleWidth * 1.7; // Make paddle bigger
            }
            if (p.type === "doubleScore") {
                powerupActive.doubleScore = true;
                doubleScorePowerupTimer = 30 * 60; // 30 seconds at 60 FPS
            }
            powerups.splice(i, 1);
        }
    }
}

function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].y += 2; // Falling speed
        if (powerups[i].y > canvas.height) {
            powerups.splice(i, 1);
        }
    }
}

function updateBricksRespawn() {
    let allCleared = true;
    for(let c = 0; c < brickColCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                allCleared = false;
                break;
            }
        }
    }
    if(allCleared) {
        resetBricks();
    }
}

function drawGameOver() {
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#f44";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width/2, canvas.height/2 - 20);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Final Score: " + score, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText("Press R to Restart", canvas.width/2, canvas.height/2 + 60);
}

function drawHP() {
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "left";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.strokeText("HP: " + health, 16, 52); // White outline
    ctx.fillStyle = "#f44";
    ctx.fillText("HP: " + health, 16, 52);   // Red fill
}

function randomColor() {
    return `hsl(${Math.floor(Math.random()*360)},80%,60%)`;
}


