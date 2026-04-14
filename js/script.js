const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const paddleWidth = 12;
const paddleHeight = 100;
const paddleSpeed = 9;
const ballSize = 12;
const maxSpeed = 16;
const minSpeed = 4;

const player1 = { x: 10, y: canvas.height / 2 - paddleHeight / 2, dy: 0, score: 0 };
const player2 = { x: canvas.width - 10 - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, dy: 0, score: 0 };
const ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 0, dy: 0 };

const keys = {};
let isPaused = false;
let countdownTimer = 0;
let winner = null;

const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawText(text, x, y) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 2);
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 2);
}

function togglePause() {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? 'Fortsett' : 'Pause';
}

function startCountdown() {
  countdownTimer = 180; // 3 sekunder ved 60fps
}

function resetPaddles() {
  player1.y = canvas.height / 2 - paddleHeight / 2;
  player2.y = canvas.height / 2 - paddleHeight / 2;
}

function checkWinner() {
  if (player1.score >= 7) {
    winner = 'Spiller 1';
  } else if (player2.score >= 7) {
    winner = 'Spiller 2';
  }
}

function restartGame() {
  player1.score = 0;
  player2.score = 0;
  winner = null;
  resetPaddles();
  resetBall();
  startCountdown();
}

function update() {
  if (isPaused || winner || countdownTimer > 0) {
    if (countdownTimer > 0) countdownTimer--;
    return;
  }
  if (keys['w']) player1.dy = -paddleSpeed;
  else if (keys['s']) player1.dy = paddleSpeed;
  else player1.dy = 0;

  if (keys['ArrowUp']) player2.dy = -paddleSpeed;
  else if (keys['ArrowDown']) player2.dy = paddleSpeed;
  else player2.dy = 0;

  player1.y += player1.dy;
  player2.y += player2.dy;

  if (player1.y < 0) player1.y = 0;
  if (player1.y + paddleHeight > canvas.height) player1.y = canvas.height - paddleHeight;
  if (player2.y < 0) player2.y = 0;
  if (player2.y + paddleHeight > canvas.height) player2.y = canvas.height - paddleHeight;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y - ballSize / 2 < 0) {
    ball.y = ballSize / 2;
    ball.dy = Math.abs(ball.dy);
  }

  if (ball.y + ballSize / 2 > canvas.height) {
    ball.y = canvas.height - ballSize / 2;
    ball.dy = -Math.abs(ball.dy);
  }

  const collidePaddle = (paddle) => {
    return (
      ball.x - ballSize / 2 < paddle.x + paddleWidth &&
      ball.x + ballSize / 2 > paddle.x &&
      ball.y + ballSize / 2 > paddle.y &&
      ball.y - ballSize / 2 < paddle.y + paddleHeight
    );
  };

  if (collidePaddle(player1)) {
    if (ball.dx < 0) {
      ball.dx = Math.max(minSpeed, Math.abs(ball.dx) * 1.05);
    }
    ball.dy += player1.dy * 0.3;
    ball.x = player1.x + paddleWidth + ballSize / 2;
  }

  if (collidePaddle(player2)) {
    if (ball.dx > 0) {
      ball.dx = -Math.max(minSpeed, Math.abs(ball.dx) * 1.05);
    }
    ball.dy += player2.dy * 0.3;
    ball.x = player2.x - ballSize / 2;
  }

  ball.dx = Math.max(-maxSpeed, Math.min(maxSpeed, ball.dx));
  ball.dy = Math.max(-maxSpeed, Math.min(maxSpeed, ball.dy));

  if (ball.x < 0) {
    player2.score += 1;
    resetPaddles();
    checkWinner();
    if (!winner) {
      resetBall();
      startCountdown();
    }
  }

  if (ball.x > canvas.width) {
    player1.score += 1;
    resetPaddles();
    checkWinner();
    if (!winner) {
      resetBall();
      startCountdown();
    }
  }
}

function draw() {
  drawRect(0, 0, canvas.width, canvas.height, '#000000');
  drawRect(player1.x, player1.y, paddleWidth, paddleHeight, '#ffffff');
  drawRect(player2.x, player2.y, paddleWidth, paddleHeight, '#ffffff');
  drawCircle(ball.x, ball.y, ballSize / 2, '#ffffff');
  drawText(`${player1.score} - ${player2.score}`, canvas.width / 2, 40);

  ctx.strokeStyle = '#ffffff';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  if (isPaused) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    drawText('PAUSE', canvas.width / 2, canvas.height / 2 + 10);
  } else if (countdownTimer > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    drawText(Math.ceil(countdownTimer / 60), canvas.width / 2, canvas.height / 2 + 10);
  } else if (winner) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, canvas.height / 2 - 100, canvas.width, 200);
    drawText(`${winner} vinner!`, canvas.width / 2, canvas.height / 2 - 20);
    drawText('Trykk R for å starte nytt spill', canvas.width / 2, canvas.height / 2 + 20);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', restartGame);

window.addEventListener('keydown', (event) => {
  if (event.key === ' ' || event.key === 'Escape') {
    event.preventDefault();
    togglePause();
    return;
  }
  if (event.key === 'r' || event.key === 'R') {
    if (winner) {
      restartGame();
    }
    return;
  }
  keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

resetBall();
startCountdown();
requestAnimationFrame(loop);