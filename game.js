const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");

const keys = {};
let score = 0;
let lives = 3;
let level = 1;

const gravity = 0.6;
const groundY = 330;

const player = {
  x: 80,
  y: groundY - 40,
  w: 28,
  h: 40,
  vx: 0,
  vy: 0,
  speed: 3.5,
  jumpPower: 11,
  onGround: false,
  facing: 1,
  attacking: false,
  attackTimer: 0
};

const platforms = [
  { x: 0, y: 350, w: 800, h: 50 },
  { x: 140, y: 290, w: 120, h: 18 },
  { x: 310, y: 250, w: 120, h: 18 },
  { x: 500, y: 290, w: 130, h: 18 },
  { x: 660, y: 230, w: 100, h: 18 }
];

const coins = [
  { x: 180, y: 250, r: 8, collected: false },
  { x: 350, y: 210, r: 8, collected: false },
  { x: 560, y: 250, r: 8, collected: false },
  { x: 700, y: 190, r: 8, collected: false }
];

const enemies = [
  { x: 420, y: 320, w: 28, h: 28, minX: 330, maxX: 520, dir: 1, alive: true },
  { x: 620, y: 320, w: 28, h: 28, minX: 590, maxX: 760, dir: 1, alive: true }
];

const goal = { x: 760, y: 190, w: 20, h: 40 };

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === " ") {
    e.preventDefault();
  }

  if (e.key.toLowerCase() === "j") {
    player.attacking = true;
    player.attackTimer = 12;
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function resetPlayer() {
  player.x = 80;
  player.y = groundY - 40;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
}

function updateHud() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
}

function handleInput() {
  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
    player.vx = -player.speed;
    player.facing = -1;
  } else if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
    player.vx = player.speed;
    player.facing = 1;
  } else {
    player.vx *= 0.8;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
  }

  if ((keys["ArrowUp"] || keys["w"] || keys["W"] || keys[" "]) && player.onGround) {
    player.vy = -player.jumpPower;
    player.onGround = false;
  }
}

function updatePlayer() {
  handleInput();

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  player.onGround = false;

  for (const p of platforms) {
    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h > p.y &&
      player.y + player.h < p.y + p.h + 20 &&
      player.vy >= 0
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  if (player.y + player.h > canvas.height) {
    player.y = canvas.height - player.h;
    player.vy = 0;
    player.onGround = true;
    loseLife();
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

  if (player.attackTimer > 0) {
    player.attackTimer--;
  } else {
    player.attacking = false;
  }
}

function loseLife() {
  lives--;
  updateHud();

  if (lives <= 0) {
    alert("Game Over! Press OK to restart.");
    lives = 3;
    score = 0;
    resetLevel();
  } else {
    resetPlayer();
  }
}

function updateCoins() {
  for (const c of coins) {
    if (!c.collected) {
      const dx = player.x + player.w / 2 - c.x;
      const dy = player.y + player.h / 2 - c.y;
      if (Math.hypot(dx, dy) < 22) {
        c.collected = true;
        score += 10;
        updateHud();
      }
    }
  }
}

function updateEnemies() {
  for (const e of enemies) {
    if (!e.alive) continue;

    e.x += e.dir * 1.2;

    if (e.x < e.minX || e.x + e.w > e.maxX) {
      e.dir *= -1;
    }

    if (
      player.x < e.x + e.w &&
      player.x + player.w > e.x &&
      player.y < e.y + e.h &&
      player.y + player.h > e.y
    ) {
      if (player.attacking && player.facing === 1 && player.x + player.w < e.x + e.w + 30) {
        e.alive = false;
        score += 25;
      } else {
        loseLife();
      }
    }
  }
}

function checkGoal() {
  if (
    player.x + player.w > goal.x &&
    player.x < goal.x + goal.w &&
    player.y + player.h > goal.y &&
    player.y < goal.y + goal.h
  ) {
    level++;
    updateHud();
    resetLevel();
  }
}

function resetLevel() {
  resetPlayer();
  for (const c of coins) c.collected = false;
  for (const e of enemies) e.alive = true;
  eReset();
}

function eReset() {
  enemies[0].x = 420;
  enemies[0].dir = 1;
  enemies[1].x = 620;
  enemies[1].dir = 1;
}

function drawBackground() {
  ctx.fillStyle = "#8ad7ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#b7e8ff";
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(80 + i * 140, 60 + (i % 2) * 25, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#8fd45d";
  ctx.fillRect(0, 350, canvas.width, 60);
}

function drawPlatforms() {
  for (const p of platforms) {
    ctx.fillStyle = "#9a5d2d";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#6d3d1f";
    ctx.fillRect(p.x, p.y, p.w, 3);
  }
}

function drawCoins() {
  for (const c of coins) {
    if (!c.collected) {
      ctx.fillStyle = "#ffd400";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffeb7a";
      ctx.fillRect(c.x - 2, c.y - 6, 4, 12);
    }
  }
}

function drawEnemies() {
  for (const e of enemies) {
    if (!e.alive) continue;
    ctx.fillStyle = "#7c1d00";
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = "#f9d5a5";
    ctx.fillRect(e.x + 4, e.y + 6, 6, 6);
    ctx.fillRect(e.x + e.w - 10, e.y + 6, 6, 6);
  }
}

function drawGoal() {
  ctx.fillStyle = "#c5f0ff";
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(goal.x + 4, goal.y + 4, goal.w - 8, goal.h - 8);
}

function drawPlayer() {
  ctx.fillStyle = "#ff7f50";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "#e0a05c";
  ctx.fillRect(player.x + 8, player.y + 8, 12, 12);

  if (player.attacking) {
    ctx.fillStyle = "#ffeb3b";
    const attackX = player.facing === 1 ? player.x + player.w : player.x - 12;
    ctx.fillRect(attackX, player.y + 8, 12, 8);
  }
}

function draw() {
  drawBackground();
  drawPlatforms();
  drawCoins();
  drawEnemies();
  drawGoal();
  drawPlayer();
}

function gameLoop() {
  updatePlayer();
  updateCoins();
  updateEnemies();
  checkGoal();
  draw();
  requestAnimationFrame(gameLoop);
}

updateHud();
resetLevel();
requestAnimationFrame(gameLoop);