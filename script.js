const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// HUD
let score = 0;
let level = 1;

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");

// Mouse
const mouse = { x: null, y: null };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

// Random color
function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 60%)`;
}

// Ball class
class Ball {
  constructor(x, y, dx, dy, radius, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.alpha = 1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    // glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.closePath();
  }

  update() {
    // wall bounce
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.dx *= -1;
    }

    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.dy *= -1;
    }

    // mouse repulsion
    if (mouse.x && mouse.y) {
      let dx = this.x - mouse.x;
      let dy = this.y - mouse.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        this.x += dx / dist * 2;
        this.y += dy / dist * 2;
      }
    }

    // speed limit (prevents crazy fast balls)
    this.dx = Math.max(-4, Math.min(4, this.dx));
    this.dy = Math.max(-4, Math.min(4, this.dy));

    this.x += this.dx;
    this.y += this.dy;

    this.draw();
  }
}

// Balls
let balls = [];

function spawnBalls(count) {
  for (let i = 0; i < count; i++) {
    let radius = Math.random() * 18 + 8;
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;
    let dx = (Math.random() - 0.5) * 4;
    let dy = (Math.random() - 0.5) * 4;

    balls.push(new Ball(x, y, dx, dy, radius, randomColor()));
  }
}

// initial spawn
spawnBalls(20);

// click to pop
canvas.addEventListener("click", (e) => {
  for (let i = 0; i < balls.length; i++) {
    let dx = balls[i].x - e.offsetX;
    let dy = balls[i].y - e.offsetY;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < balls[i].radius) {
      balls.splice(i, 1);
      score++;

      scoreEl.textContent = "Score: " + score;

      // level system
      if (score % 10 === 0) {
        level++;
        levelEl.textContent = "Level: " + level;

        spawnBalls(5); // add difficulty
      }

      break;
    }
  }
});

// collision reaction
function handleCollision() {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      let dx = balls[i].x - balls[j].x;
      let dy = balls[i].y - balls[j].y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < balls[i].radius + balls[j].radius) {
        balls[i].color = randomColor();
        balls[j].color = randomColor();
      }
    }
  }
}

// animation loop (with trail effect)
function animate() {
  requestAnimationFrame(animate);

  // fade effect for trails
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  handleCollision();

  for (let ball of balls) {
    ball.update();
  }
}

animate();
