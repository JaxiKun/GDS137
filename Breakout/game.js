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
    dx: 1.5, // slower speed
    dy: -1.5, // slower speed
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
        bricks[c][r] = { x: brickX, y: brickY, status: 1, color: `hsl(${r*60},80%,60%)` };
    }
}

let score = 0;

// Powerup variables
let powerup = null;
let powerupActive = false;
let powerupTimer = 0;
let powerupBaseDuration = 30 * 60; // 30 seconds at 60fps
let powerupExtraDuration = 5 * 60; // 5 seconds at 60fps
let normalPaddleWidth = paddleWidth;
let bigPaddleWidth = paddleWidth * 1.7;

// Helper to spawn a powerup at random brick position
function spawnPowerup() {
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
    powerup = {
        x: brick.x + brickWidth/2 - 10,
        y: brick.y + brickHeight,
        width: 20,
        height: 20,
        color: "#ff0",
        dy: 1
    };
}

// Draw the powerup
function drawPowerup() {
    if(powerup) {
        ctx.beginPath();
        ctx.arc(powerup.x + powerup.width/2, powerup.y + powerup.height/2, 10, 0, Math.PI*2);
        ctx.fillStyle = powerup.color;
        ctx.fill();
        ctx.closePath();
        ctx.font = "16px Arial";
        ctx.fillStyle = "#222";
        ctx.fillText("P", powerup.x + 5, powerup.y + 16);
    }
}

// Handle powerup logic
function updatePowerup() {
    if(powerup) {
        powerup.y += powerup.dy;
        // If paddle catches powerup
        if(
            powerup.y + powerup.height > paddle.y &&
            powerup.x + powerup.width > paddle.x &&
            powerup.x < paddle.x + paddle.width &&
            powerup.y < paddle.y + paddle.height
        ) {
            // Activate or extend powerup
            if(powerupActive) {
                powerupTimer += powerupExtraDuration;
            } else {
                powerupActive = true;
                paddle.width = bigPaddleWidth;
                powerupTimer = powerupBaseDuration;
            }
            powerup = null;
        } else if(powerup.y > canvas.height) {
            // If powerup falls off screen
            powerup = null;
        }
    }
    // Handle timer
    if(powerupActive) {
        powerupTimer--;
        if(powerupTimer <= 0) {
            powerupActive = false;
            paddle.width = normalPaddleWidth;
        }
    }
}

// Randomly spawn powerup after breaking a brick (10% chance)
function collisionDetection() {
    for(let c=0; c<brickColCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                if(ball.x > b.x && ball.x < b.x+brickWidth &&
                   ball.y > b.y && ball.y < b.y+brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    // 10% chance to spawn powerup
                    if(Math.random() < 0.1 && !powerup) {
                        spawnPowerup();
                    }
                    if(score === brickRowCount*brickColCount) {
                        setTimeout(() => {
                            alert("YOU WIN!");
                            document.location.reload();
                        }, 100);
                    }
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
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    paddle.draw(ctx);
    drawBall();
    drawScore();
    drawPowerup();
    collisionDetection();
    updatePowerup();

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) ball.dx = -ball.dx;
    if(ball.y - ball.radius < 0) ball.dy = -ball.dy;
    else if(ball.y + ball.radius > canvas.height) {
        // Instead of losing a life, just reset the ball and paddle
        ball.x = canvas.width/2;
        ball.y = canvas.height - paddleHeight - 20;
        ball.dx = 1.5;
        ball.dy = -1.5;
        paddle.x = (canvas.width - paddleWidth) / 2;
    }

    // Paddle collision
    if(ball.x > paddle.x && ball.x < paddle.x + paddle.width &&
       ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height) {
        ball.dy = -ball.dy;
        // Add some "english" based on where it hits the paddle
        let hitPos = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
        ball.dx = 2 * hitPos; // keep ball slow after paddle hit
    }

    // Paddle movement (make it slower)
    if(rightPressed && paddle.x < canvas.width - paddle.width) paddle.x += 3;
    if(leftPressed && paddle.x > 0) paddle.x -= 3;

    requestAnimationFrame(draw);
}

draw();