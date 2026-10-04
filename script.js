const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

let running = true;
let day = true;
let speed = 1;
let zoom = 1;
let time = 0;
let carX = 120;
let carDirection = 1;

const rain = [];
for (let i = 0; i < 90; i++) {
  rain.push({
    x: Math.random() * W,
    y: Math.random() * H,
    length: 8 + Math.random() * 13,
    speed: 4 + Math.random() * 6
  });
}

const clouds = [
  { x: 120, y: 100, s: 1.0, speed: 0.25 },
  { x: 430, y: 145, s: 0.75, speed: 0.18 },
  { x: 800, y: 90, s: 1.15, speed: 0.22 }
];

const birds = [
  { x: 270, y: 170, s: 1 },
  { x: 650, y: 130, s: .8 },
  { x: 920, y: 180, s: .7 }
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function skyGradient() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (day) {
    g.addColorStop(0, "#38bdf8");
    g.addColorStop(.6, "#7dd3fc");
    g.addColorStop(1, "#dbeafe");
  } else {
    g.addColorStop(0, "#020617");
    g.addColorStop(.55, "#172554");
    g.addColorStop(1, "#312e81");
  }
  return g;
}

function drawBackground() {
  ctx.fillStyle = skyGradient();
  ctx.fillRect(0, 0, W, H);

  // Stars in night mode
  if (!day) {
    ctx.save();
    for (let i = 0; i < 75; i++) {
      const x = (i * 157) % W;
      const y = 25 + ((i * 73) % 240);
      const twinkle = 1 + Math.sin(time * .05 + i) * .4;
      ctx.fillStyle = `rgba(255,255,255,${.35 + twinkle * .25})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.3 + twinkle * .4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Sun / Moon
  ctx.save();
  const celestialX = ((time * .035) % (W + 180)) - 90;
  const celestialY = day
    ? 90 + Math.sin((celestialX / W) * Math.PI) * -25
    : 105 + Math.sin((celestialX / W) * Math.PI) * -20;

  ctx.translate(celestialX, celestialY);
  if (day) {
    ctx.rotate(time * .002);
    ctx.strokeStyle = "rgba(255,220,60,.75)";
    ctx.lineWidth = 5;
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(55, 0);
      ctx.lineTo(72, 0);
      ctx.stroke();
    }
    ctx.fillStyle = "#fde047";
  } else {
    ctx.fillStyle = "#f8fafc";
  }
  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawClouds();
}

function drawClouds() {
  clouds.forEach(c => {
    c.x += c.speed * speed;
    if (c.x > W + 100) c.x = -130;

    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.s, c.s);

    ctx.fillStyle = day ? "rgba(255,255,255,.82)" : "rgba(148,163,184,.32)";
    ctx.beginPath();
    ctx.arc(-35, 8, 28, 0, Math.PI * 2);
    ctx.arc(0, -5, 38, 0, Math.PI * 2);
    ctx.arc(38, 10, 28, 0, Math.PI * 2);
    ctx.roundRect(-62, 8, 125, 35, 18);
    ctx.fill();

    ctx.restore();
  });
}

function drawMountains() {
  // Back mountains
  ctx.fillStyle = day ? "#64748b" : "#1e293b";
  ctx.beginPath();
  ctx.moveTo(0, 355);
  ctx.lineTo(150, 180);
  ctx.lineTo(270, 345);
  ctx.lineTo(430, 160);
  ctx.lineTo(590, 350);
  ctx.lineTo(760, 190);
  ctx.lineTo(920, 350);
  ctx.lineTo(1080, 175);
  ctx.lineTo(1200, 350);
  ctx.lineTo(1200, 470);
  ctx.lineTo(0, 470);
  ctx.closePath();
  ctx.fill();

  // Snow caps
  ctx.fillStyle = day ? "#f8fafc" : "#cbd5e1";
  [[150,180],[430,160],[760,190],[1080,175]].forEach(([x,y]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x-35, y+45);
    ctx.lineTo(x-12, y+35);
    ctx.lineTo(x, y+52);
    ctx.lineTo(x+15, y+32);
    ctx.lineTo(x+38, y+46);
    ctx.closePath();
    ctx.fill();
  });

  // Front hills
  ctx.fillStyle = day ? "#166534" : "#14532d";
  ctx.beginPath();
  ctx.moveTo(0, 390);
  ctx.quadraticCurveTo(180, 300, 350, 405);
  ctx.quadraticCurveTo(520, 315, 720, 410);
  ctx.quadraticCurveTo(930, 300, 1200, 405);
  ctx.lineTo(1200, 510);
  ctx.lineTo(0, 510);
  ctx.closePath();
  ctx.fill();
}

function drawTree(x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  ctx.fillStyle = "#78350f";
  ctx.fillRect(-9, 30, 18, 72);

  const leaves = ["#166534", "#15803d", "#22c55e"];
  leaves.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(-18 + i*18, 25 - i*4, 27, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawHouse() {
  ctx.save();
  ctx.translate(930, 345);

  // Body
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(0, 50, 150, 105);

  // Roof
  ctx.fillStyle = "#991b1b";
  ctx.beginPath();
  ctx.moveTo(-18, 52);
  ctx.lineTo(75, -15);
  ctx.lineTo(168, 52);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = "#78350f";
  ctx.fillRect(62, 95, 32, 60);

  // Windows
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(20, 75, 30, 30);
  ctx.fillRect(105, 75, 30, 30);
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 75, 30, 30);
  ctx.strokeRect(105, 75, 30, 30);

  // Chimney
  ctx.fillStyle = "#7f1d1d";
  ctx.fillRect(113, 5, 22, 43);

  ctx.restore();
}

function drawRoad() {
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 480, W, 120);

  ctx.fillStyle = "#f8fafc";
  for (let x = -80; x < W + 80; x += 130) {
    const offset = (time * 2 * speed) % 130;
    ctx.fillRect(x - offset, 535, 75, 8);
  }

  ctx.fillStyle = "#facc15";
  ctx.fillRect(0, 485, W, 5);
  ctx.fillRect(0, 595, W, 5);
}

function drawRiver() {
  ctx.fillStyle = day ? "#0284c7" : "#075985";
  ctx.fillRect(0, 600, W, 50);

  if (document.getElementById("waterToggle").checked) {
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = 2;
    for (let y = 610; y < 650; y += 13) {
      for (let x = -30; x < W; x += 90) {
        const waveX = x + ((time * 1.5 * speed) % 90);
        ctx.beginPath();
        ctx.moveTo(waveX, y);
        ctx.quadraticCurveTo(waveX + 20, y - 5, waveX + 40, y);
        ctx.stroke();
      }
    }
  }
}

function drawWheel(x, y, r, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle); // ROTATION
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.arc(0, 0, r * .48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r * .42, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCar() {
  if (!document.getElementById("carToggle").checked) return;

  carX += carDirection * speed * .9;
  if (carX > W + 120) carX = -160;
  if (carX < -160) carX = W + 120;

  ctx.save();
  ctx.translate(carX, 0); // TRANSLATION

  const y = 505;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath();
  ctx.ellipse(80, y + 57, 82, 10, 0, 0, Math.PI*2);
  ctx.fill();

  // Body
  ctx.fillStyle = "#ef4444";
  ctx.roundRect(5, y, 150, 42, 12);
  ctx.fill();

  // Cabin
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.moveTo(35, y);
  ctx.lineTo(60, y - 38);
  ctx.lineTo(115, y - 38);
  ctx.lineTo(140, y);
  ctx.closePath();
  ctx.fill();

  // Windows
  ctx.fillStyle = "#bae6fd";
  ctx.beginPath();
  ctx.moveTo(63, y - 33);
  ctx.lineTo(78, y - 7);
  ctx.lineTo(64, y - 7);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(83, y - 33);
  ctx.lineTo(111, y - 33);
  ctx.lineTo(130, y - 7);
  ctx.lineTo(83, y - 7);
  ctx.closePath();
  ctx.fill();

  // Headlights
  ctx.fillStyle = "#fef08a";
  ctx.fillRect(145, y + 10, 8, 12);

  const wheelAngle = time * .035 * carDirection;
  drawWheel(42, y + 42, 18, wheelAngle);
  drawWheel(125, y + 42, 18, wheelAngle);

  ctx.restore();
}

function drawBird(b) {
  b.x += .45 * speed;
  if (b.x > W + 50) b.x = -50;

  const wing = Math.sin(time * .08 + b.x) * 10;

  ctx.save();
  ctx.translate(b.x, b.y + Math.sin(time * .02 + b.x) * 6);
  ctx.scale(b.s, b.s);

  ctx.strokeStyle = day ? "#1e293b" : "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-16, wing);
  ctx.quadraticCurveTo(-8, -8, 0, 0);
  ctx.quadraticCurveTo(8, -8, 16, wing);
  ctx.stroke();

  ctx.restore();
}

function drawWindmill() {
  ctx.save();
  ctx.translate(760, 395);

  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(-5, 0, 10, 85);

  ctx.rotate(time * .025); // ROTATION
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 6;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -48);
    ctx.stroke();
  }

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function drawFlowers() {
  for (let x = 30; x < 900; x += 55) {
    const y = 452 + Math.sin(x) * 3;
    ctx.strokeStyle = "#166534";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillStyle = x % 2 ? "#f472b6" : "#facc15";
    for (let a = 0; a < 5; a++) {
      const px = x + Math.cos(a * Math.PI * 2 / 5) * 6;
      const py = y + Math.sin(a * Math.PI * 2 / 5) * 6;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

function drawRain() {
  if (!document.getElementById("rainToggle").checked) return;

  ctx.strokeStyle = "rgba(186,230,253,.65)";
  ctx.lineWidth = 1.5;

  rain.forEach(r => {
    r.y += r.speed * speed;
    r.x -= .8 * speed;
    if (r.y > H) {
      r.y = -20;
      r.x = Math.random() * W;
    }

    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x - 4, r.y + r.length);
    ctx.stroke();
  });
}

function render() {
  ctx.clearRect(0, 0, W, H);

  // SCALING transformation around scene center
  ctx.save();
  ctx.translate(W/2, H/2);
  ctx.scale(zoom, zoom);
  ctx.translate(-W/2, -H/2);

  drawBackground();
  drawMountains();

  drawTree(100, 355, 1.15);
  drawTree(205, 375, .85);
  drawTree(520, 360, 1.05);
  drawTree(1080, 350, 1.2);

  drawHouse();
  drawWindmill();
  drawFlowers();
  drawRoad();
  drawRiver();
  drawCar();

  if (document.getElementById("birdsToggle").checked) {
    birds.forEach(drawBird);
  }

  drawRain();
  ctx.restore();

  if (running) time += 1;
  requestAnimationFrame(render);
}

function reset() {
  time = 0;
  carX = 120;
  speed = 1;
  zoom = 1;
  day = true;
  document.getElementById("speed").value = 1;
  document.getElementById("zoom").value = 1;
  updateLabels();
}

function updateLabels() {
  document.getElementById("speedValue").textContent = speed.toFixed(1) + "x";
  document.getElementById("zoomValue").textContent = zoom.toFixed(2) + "x";
  document.getElementById("status").textContent = running ? "● Running" : "● Paused";
  document.getElementById("status").style.color = running ? "#4ade80" : "#fbbf24";
}

document.getElementById("startBtn").onclick = () => {
  running = true;
  updateLabels();
};

document.getElementById("pauseBtn").onclick = () => {
  running = false;
  updateLabels();
};

document.getElementById("resetBtn").onclick = () => {
  reset();
  running = true;
  updateLabels();
};

document.getElementById("dayBtn").onclick = () => {
  day = true;
};

document.getElementById("nightBtn").onclick = () => {
  day = false;
};

document.getElementById("speed").oninput = e => {
  speed = Number(e.target.value);
  updateLabels();
};

document.getElementById("zoom").oninput = e => {
  zoom = Number(e.target.value);
  updateLabels();
};

window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    running = !running;
    updateLabels();
  }

  if (e.key.toLowerCase() === "d") day = !day;
  if (e.key.toLowerCase() === "r") {
    reset();
    running = true;
    updateLabels();
  }

  if (e.key === "ArrowRight") {
    carX += 25;
  }

  if (e.key === "ArrowLeft") {
    carX -= 25;
  }
});

// Mouse interaction: clicking the scene changes day/night.
canvas.addEventListener("click", e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * W / rect.width;
  const y = (e.clientY - rect.top) * H / rect.height;

  if (y < 250 && x < 350) {
    day = !day;
  }
});

updateLabels();
render();
