// Pong Game Constants
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const PADDLE_WIDTH = 16;
const PADDLE_HEIGHT = 100;
const PADDLE_MARGIN = 24;
const BALL_RADIUS = 12;

let leftPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let rightPaddleY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let leftPaddleTargetY = leftPaddleY;

let ballX = WIDTH / 2;
let ballY = HEIGHT / 2;
let ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = (Math.random() * 6 - 3);

let leftScore = 0;
let rightScore = 0;

// Paddle follows mouse Y
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddleTargetY = mouseY - PADDLE_HEIGHT / 2;
});

// For touch devices
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    leftPaddleTargetY = touchY - PADDLE_HEIGHT / 2;
}, { passive: false });

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    for (let i = 0; i < HEIGHT; i += 30) {
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2, i);
        ctx.lineTo(WIDTH / 2, i + 20);
        ctx.stroke();
    }
}

function drawScore() {
    ctx.font = "36px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(leftScore, WIDTH * 0.25, 50);
    ctx.fillText(rightScore, WIDTH * 0.75, 50);
}

function resetBall() {
    ballX = WIDTH / 2;
    ballY = HEIGHT / 2;
    ballSpeedX = 6 * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = (Math.random() * 6 - 3);
}

function update() {
    // Smoothly move left paddle to mouse target
    leftPaddleY += (leftPaddleTargetY - leftPaddleY) * 0.25;
    leftPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, leftPaddleY));

    // Simple AI: right paddle follows ball (with delay)
    let rightPaddleCenter = rightPaddleY + PADDLE_HEIGHT / 2;
    let aiSpeed = 5.5;
    if (ballY < rightPaddleCenter - 10) {
        rightPaddleY -= aiSpeed;
    } else if (ballY > rightPaddleCenter + 10) {
        rightPaddleY += aiSpeed;
    }
    rightPaddleY = Math.max(0, Math.min(HEIGHT - PADDLE_HEIGHT, rightPaddleY));

    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top/bottom wall collision
    if (ballY - BALL_RADIUS < 0) {
        ballY = BALL_RADIUS;
        ballSpeedY *= -1;
    } else if (ballY + BALL_RADIUS > HEIGHT) {
        ballY = HEIGHT - BALL_RADIUS;
        ballSpeedY *= -1;
    }

    // Paddle collision (left)
    if (ballX - BALL_RADIUS < PADDLE_MARGIN + PADDLE_WIDTH &&
        ballY > leftPaddleY && ballY < leftPaddleY + PADDLE_HEIGHT) {
        ballX = PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS;
        ballSpeedX *= -1.08;
        // Add "spin" based on where the ball hits the paddle
        let hitPos = (ballY - (leftPaddleY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        ballSpeedY += hitPos * 4;
    }

    // Paddle collision (right)
    if (ballX + BALL_RADIUS > WIDTH - PADDLE_MARGIN - PADDLE_WIDTH &&
        ballY > rightPaddleY && ballY < rightPaddleY + PADDLE_HEIGHT) {
        ballX = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_RADIUS;
        ballSpeedX *= -1.08;
        let hitPos = (ballY - (rightPaddleY + PADDLE_HEIGHT/2)) / (PADDLE_HEIGHT/2);
        ballSpeedY += hitPos * 4;
    }

    // Score left or right
    if (ballX < 0) {
        rightScore += 1;
        resetBall();
    } else if (ballX > WIDTH) {
        leftScore += 1;
        resetBall();
    }
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Net
    drawNet();

    // Paddles
    drawRect(PADDLE_MARGIN, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#35f");
    drawRect(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#f53");

    // Ball
    drawCircle(ballX, ballY, BALL_RADIUS, "#fff");

    // Score
    drawScore();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();