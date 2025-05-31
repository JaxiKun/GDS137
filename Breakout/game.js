const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Paddle
const paddleWidth = 75, paddleHeight = 12;
let paddle = new GameObject(
    (canvas.width - paddleWidth) / 2,
    canvas.height - paddleHeight - 10,
    paddleWidth, paddleHeight, "#0ff"
);

// Ball (make it slower)
const ballRadius = 8;
let ball = {
    x: canvas.width / 2,
    y: canvas.height - paddleHeight - 20,
    dx: .30, // slower speed (was 1.5)
    dy: -1.0, // slower speed (was -1.5)
    radius: ballRadius,
    color: "#fff"
};

// Bricks
const brickRowCount = 5, brickColCount = 8;
const brickWidth = 50, brickHeight = 18, brickPadding = 8, brickOffsetTop = 30, brickOffsetLeft = 20;
let bricks = [];
for(let c=0; c<brickColCount; c++) {
    bricks[c] = [];
    for(let r=0; r<brickRowCount; r++) {
        let brickX = brickOffsetLeft + c*(brickWidth+brickPadding);
        let brickY = brickOffsetTop + r*(brickHeight+brickPadding);
        bricks[c][r] = { 
            x: brickX, 
            y: brickY, 
            status: 1, 
            color: `hsl(${r*60},80%,60%)`,
            respawn: 0 // seconds until respawn, 0 means active
        };
    }
}

let score = 0;

// Timer variables
let startTime = Date.now();
let elapsedTime = 0;

// Health system
let health = 10;

// Powerup variables
let powerups = []; // Array to support multiple powerups on screen
let powerupActive = { paddle: false, doubleScore: false };
let powerupTimer = { paddle: 0, doubleScore: 0 };
let powerupBaseDuration = 30 * 60; // 30 seconds at 60fps
let powerupExtraDuration = 5 * 60; // 5 seconds at 60fps
let normalPaddleWidth = paddleWidth;
let bigPaddleWidth = paddleWidth * 1.7;

// Helper to spawn a powerup at random brick position
function spawnPowerup(type) {
    // Find all active bricks
    let activeBricks = [];
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                activeBricks.push(bricks[c][r]);
            }
        }
    }
    if(activeBricks.length === 0) return;
    // Pick a random brick
    let brick = activeBricks[Math.floor(Math.random() * activeBricks.length)];
    let color = type === "paddle" ? "#ff0" : "#0f0";
    powerups.push({
        x: brick.x + brickWidth/2 - 10,
        y: brick.y + brickHeight,
        width: 20,
        height: 20,
        color: color,
        dy: 1,
        type: type
    });
}

// Draw the powerups
function drawPowerups() {
    powerups.forEach(powerup => {
        ctx.beginPath();
        ctx.arc(powerup.x + powerup.width/2, powerup.y + powerup.height/2, 10, 0, Math.PI*2);
        ctx.fillStyle = powerup.color;
        ctx.fill();
        ctx.closePath();
        ctx.font = "16px Arial";
        ctx.fillStyle = "#222";
        ctx.fillText(powerup.type === "paddle" ? "P" : "2x", powerup.x + (powerup.type === "paddle" ? 5 : 2), powerup.y + 16);
    });
}

// Handle powerup logic
function updatePowerups() {
    for(let i = powerups.length - 1; i >= 0; i--) {
        let powerup = powerups[i];
        powerup.y += powerup.dy;
        // If paddle catches powerup
        if(
            powerup.y + powerup.height > paddle.y &&
            powerup.x + powerup.width > paddle.x &&
            powerup.x < paddle.x + paddle.width &&
            powerup.y < paddle.y + paddle.height
        ) {
            if(powerup.type === "paddle") {
                // Activate or extend paddle powerup
                if(powerupActive.paddle) {
                    powerupTimer.paddle += powerupExtraDuration;
                } else {
                    powerupActive.paddle = true;
                    paddle.width = bigPaddleWidth;
                    powerupTimer.paddle = powerupBaseDuration;
                }
            } else if(powerup.type === "doubleScore") {
                // Activate or extend double score powerup
                if(powerupActive.doubleScore) {
                    powerupTimer.doubleScore += powerupExtraDuration;
                } else {
                    powerupActive.doubleScore = true;
                    powerupTimer.doubleScore = powerupBaseDuration;
                }
            }
            powerups.splice(i, 1);
        } else if(powerup.y > canvas.height) {
            // If powerup falls off screen
            powerups.splice(i, 1);
        }
    }
    // Handle timers
    if(powerupActive.paddle) {
        powerupTimer.paddle--;
        if(powerupTimer.paddle <= 0) {
            powerupActive.paddle = false;
            paddle.width = normalPaddleWidth;
        }
    }
    if(powerupActive.doubleScore) {
        powerupTimer.doubleScore--;
        if(powerupTimer.doubleScore <= 0) {
            powerupActive.doubleScore = false;
        }
    }
}

// Randomly spawn powerup after breaking a brick (10% chance for each)
function collisionDetection() {
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                if(ball.x > b.x && ball.x < b.x+brickWidth &&
                   ball.y > b.y && ball.y < b.y+brickHeight) {
                    ball.dy = -ball.dy;
                    ball.color = randomColor(); // <--- Add this line
                    b.status = 0;
                    b.respawn = 10 * 60; // 10 seconds at 60fps
                    // 10% chance to spawn paddle powerup
                    if(Math.random() < 0.1 && !powerupActive.paddle) {
                        spawnPowerup("paddle");
                    }
                    // 10% chance to spawn double score powerup
                    if(Math.random() < 0.1 && !powerupActive.doubleScore) {
                        spawnPowerup("doubleScore");
                    }
                    // Score logic
                    score += powerupActive.doubleScore ? 2 : 1;
                    // Remove the "YOU WIN!" popup and reload
                    // if(score === brickRowCount*brickColCount) {
                    //     setTimeout(() => {
                    //         alert("YOU WIN!");
                    //         document.location.reload();
                    //     }, 100);
                    // }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: "+score, 8, 20);
    ctx.fillText("HP: " + health, 8, 40); // Show health under score
}

function drawTimer() {
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    let minutes = Math.floor(elapsedTime / 60);
    let seconds = elapsedTime % 60;
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(
        "Time: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds,
        canvas.width - 110, 20
    );
}

function updateBricksRespawn() {
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 0 && b.respawn > 0) {
                b.respawn--;
                if(b.respawn <= 0) {
                    b.status = 1;
                }
            }
        }
    } 
}

let gameOver = false;

function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "32px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width/2, canvas.height/2 - 40);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#0ff";
    ctx.fillText("Score: " + score, canvas.width/2, canvas.height/2);

    let minutes = Math.floor(elapsedTime / 60);
    let seconds = elapsedTime % 60;
    ctx.fillStyle = "#fff";
    ctx.fillText(
        "Time Survived: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds,
        canvas.width/2, canvas.height/2 + 30
    );

    ctx.font = "20px Arial";
    ctx.fillStyle = "#f44";
    ctx.fillText("HP: 0", canvas.width/2, canvas.height/2 + 60);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#aaa";
    ctx.fillText("Press R to Restart", canvas.width/2, canvas.height/2 + 100);
    ctx.textAlign = "start";
}

function randomColor() {
    // Returns a random bright color
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 90%, 60%)`;
}

function draw() {
    if(gameOver) {
        drawGameOver();
        requestAnimationFrame(draw); // <-- Add this line
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    paddle.draw(ctx);
    drawBall();
    drawScore();
    drawTimer();
    drawPowerups();
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
        // Lose 1 HP and reset ball/paddle if ball falls below paddle
        health--;
        if(health <= 0) {
            gameOver = true;
            requestAnimationFrame(draw);
            return;
        }
        // Reset ball and paddle position
        ball.x = canvas.width / 2;
        ball.y = canvas.height - paddleHeight - 20;
        ball.dx = 1.3;
        ball.dy = -1.2;
        paddle.x = (canvas.width - paddle.width) / 2;
        paddle.y = canvas.height - paddleHeight - 10;
        // Do NOT return here, let the draw loop continue!
    }

    // Paddle collision
    if(ball.x > paddle.x && ball.x < paddle.x + paddle.width &&
       ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height) {
        ball.dy = -ball.dy;
        ball.color = randomColor(); // <--- Add this line
        // Add some "english" based on where it hits the paddle
        let hitPos = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
        ball.dx = 1.5 * hitPos; // was 2 * hitPos
    }

    // Paddle movement (make it slower)
    if(rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += 2; // was 3
    if(leftPressed && paddle.x > 0) paddle.x -= 2; // was 3

    requestAnimationFrame(draw);
}

// Restart game on R key
window.addEventListener("keydown", function(e) {
    if(gameOver && (e.key === "r" || e.key === "R")) {
        document.location.reload();
    }
});

draw();