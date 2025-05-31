const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const SQUARE_SIZE = 50;
const SQUARE_Y = CANVAS_HEIGHT - 25 - SQUARE_SIZE; // 25px from bottom
let squareX = (CANVAS_WIDTH - SQUARE_SIZE) / 2;

let score = 0;
let squareState = "correction"; // "correction" (green) or "death" (red)

const SPEED = 7;
let leftPressed = false;
let rightPressed = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'a' || e.key === 'A') leftPressed = true;
  if (e.key === 'd' || e.key === 'D') rightPressed = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'a' || e.key === 'A') leftPressed = false;
  if (e.key === 'd' || e.key === 'D') rightPressed = false;
});

// For demonstration: toggle state every 3 seconds
setInterval(() => {
  squareState = (squareState === "correction") ? "death" : "correction";
}, 3000);

// Object arrays
const hazards = [];
const items = [];

// Utility to get random X within canvas for given object width
function getRandomX(objWidth) {
  return Math.random() * (CANVAS_WIDTH - objWidth);
}

// Spawn hazards (circles)
for (let i = 0; i < 5; i++) {
  hazards.push({
    x: getRandomX(30),
    y: -Math.random() * 100 - 30, // Randomly above canvas
    radius: 15,
    color: "red", // red hazard
    speed: 2 + Math.random() * 3 // random speed between 2 and 5
  });
}

// Spawn items (squares)
for (let i = 0; i < 5; i++) {
  items.push({
    x: getRandomX(30),
    y: -Math.random() * 100 - 30,
    size: 30,
    color: "green", // green item
    speed: 2 + Math.random() * 3 // random speed between 2 and 5
  });
}

function drawScore() {
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 20, 40);
}

function drawSquare() {
  ctx.fillStyle = squareState === "correction" ? "green" : "red";
  ctx.fillRect(squareX, SQUARE_Y, SQUARE_SIZE, SQUARE_SIZE);
}

function drawHazards() {
  for (const h of hazards) {
    ctx.beginPath();
    ctx.arc(h.x + h.radius, h.y + h.radius, h.radius, 0, Math.PI * 2);
    ctx.fillStyle = h.color;
    ctx.fill();
    ctx.closePath();
  }
}

function drawItems() {
  for (const item of items) {
    ctx.fillStyle = item.color;
    ctx.fillRect(item.x, item.y, item.size, item.size);
  }
}

// Helper: check collision between player and square/circle
function rectCircleColliding(circle, rect) {
  // circle: {x, y, radius}, rect: {x, y, width, height}
  let distX = Math.abs((circle.x + circle.radius) - (rect.x + rect.width / 2));
  let distY = Math.abs((circle.y + circle.radius) - (rect.y + rect.height / 2));

  if (distX > (rect.width / 2 + circle.radius)) { return false; }
  if (distY > (rect.height / 2 + circle.radius)) { return false; }

  if (distX <= (rect.width / 2)) { return true; }
  if (distY <= (rect.height / 2)) { return true; }

  let dx = distX - rect.width / 2;
  let dy = distY - rect.height / 2;
  return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

function rectRectColliding(r1, r2) {
  return !(r2.x > r1.x + r1.width ||
           r2.x + r2.width < r1.x ||
           r2.y > r1.y + r1.height ||
           r2.y + r2.height < r1.y);
}

function update() {
  if (leftPressed) squareX -= SPEED;
  if (rightPressed) squareX += SPEED;
  // Clamp to canvas
  if (squareX < 0) squareX = 0;
  if (squareX > CANVAS_WIDTH - SQUARE_SIZE) squareX = CANVAS_WIDTH - SQUARE_SIZE;

  // Move hazards down
  for (const h of hazards) {
    h.y += h.speed;
    if (h.y > CANVAS_HEIGHT) {
      h.y = -h.radius * 2;
      h.x = getRandomX(h.radius * 2);
      h.speed = 2 + Math.random() * 3;
    }
  }

  // Move items down
  for (const item of items) {
    item.y += item.speed;
    if (item.y > CANVAS_HEIGHT) {
      item.y = -item.size;
      item.x = getRandomX(item.size);
      item.speed = 2 + Math.random() * 3;
    }
  }

  // Player rectangle
  const playerRect = {
    x: squareX,
    y: SQUARE_Y,
    width: SQUARE_SIZE,
    height: SQUARE_SIZE
  };

  // Check collision with items
  for (const item of items) {
    const itemRect = {
      x: item.x,
      y: item.y,
      width: item.size,
      height: item.size
    };
    if (rectRectColliding(playerRect, itemRect)) {
      score += 1;
      squareState = "correction";
      setTimeout(() => {
        squareState = "correction";
      }, 500);
      // Respawn item
      item.y = -item.size;
      item.x = getRandomX(item.size);
      item.speed = 2 + Math.random() * 3;
    }
  }

  // Check collision with hazards
  for (const h of hazards) {
    if (rectCircleColliding(h, playerRect)) {
      score = 0;
      squareState = "death";
      setTimeout(() => {
        squareState = "correction";
      }, 500);
      // Respawn hazard
      h.y = -h.radius * 2;
      h.x = getRandomX(h.radius * 2);
      h.speed = 2 + Math.random() * 3;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawScore();
  drawSquare();
  drawHazards();
  drawItems();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();