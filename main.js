const setupPanelEl = document.getElementById("setup-panel");
const dropZoneEl = document.getElementById("drop-zone");
const loadedEl = document.getElementById("loaded");
const roundsEl = document.getElementById("rounds");
const intervalEl = document.getElementById("interval");
const startButtonEl = document.getElementById("start-button");

const controlPanelEl = document.getElementById("control-panel");
const currentRoundEl = document.getElementById("current-round");
const timerEl = document.getElementById("timer");
const pauseButtonEl = document.getElementById("pause-button");
const resumeButtonEl = document.getElementById("resume-button");
const closeButtonEl = document.getElementById("close-button");

const imagesEl = document.getElementById("images");

const files = [];

let interval = 0;
let intervalId = null;
let rounds = 0;
let currentRound = 1;
let timer = 0;

async function toFile(entry) {
  return new Promise((resolve) => entry.file(resolve));
}

function renderFile(file) {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.hidden = true;
  imagesEl.appendChild(img);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

dropZoneEl.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropZoneEl.classList.add("dragging");
  dropZoneEl.textContent = "Drop it";
});

dropZoneEl.addEventListener("dragleave", function () {
  dropZoneEl.classList.remove("dragging");
  dropZoneEl.textContent = "Drag image files here";
});

dropZoneEl.addEventListener("drop", async function (e) {
  e.preventDefault();
  dropZoneEl.classList.remove("dragging");

  const items = [...e.dataTransfer.items];
  const entries = items.map((item) => item.webkitGetAsEntry());

  for (const entry of entries) {
    if (entry?.isFile && entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
      files.push(await toFile(entry));
    }
  }

  loadedEl.value = files.length;
  roundsEl.max = files.length;
  dropZoneEl.textContent = "Drag image files here";
  startButtonEl.disabled = !(Number(roundsEl.value) <= Number(loadedEl.value));
});

startButtonEl.addEventListener("click", function () {
  interval = Number(intervalEl.value);
  rounds = Number(roundsEl.value);

  timer = interval;
  timerEl.textContent = interval;
  currentRoundEl.textContent = `${currentRound} / ${rounds}`;

  shuffle(files);
  files.slice(0, rounds).forEach(renderFile);

  intervalId = setInterval(function () {
    window.dispatchEvent(new CustomEvent("tick"));
  }, 1000);

  document.querySelector("img").hidden = false;
  setupPanelEl.style.display = "none";
  controlPanelEl.classList.add("show");
});

pauseButtonEl.addEventListener("click", function () {
  clearInterval(intervalId);
  this.hidden = true;
  resumeButtonEl.hidden = false;
});

roundsEl.addEventListener("input", function () {
  startButtonEl.disabled = !(Number(this.value) <= Number(this.max));
});

resumeButtonEl.addEventListener("click", function () {
  this.hidden = true;
  pauseButtonEl.hidden = false;
  intervalId = setInterval(() => {
    window.dispatchEvent(new CustomEvent("tick"));
  }, 1000);
});

closeButtonEl.addEventListener("click", function () {
  location.href = "/";
});

window.addEventListener("tick", function () {
  if (--timer == 0) {
    timer = interval;
    timerEl.textContent = timer;
    window.dispatchEvent(new CustomEvent("time-up"));
    return;
  }

  timerEl.textContent = timer;
});

window.addEventListener("time-up", function () {
  if (currentRound++ < rounds) {
    document.querySelectorAll("img").forEach((img, index) => {
      img.hidden = index + 1 == currentRound ? false : true;
    });
    currentRoundEl.textContent = `${currentRound} / ${rounds}`;
    return;
  }

  clearInterval(intervalId);
  window.dispatchEvent(new CustomEvent("finish"));
});

window.addEventListener("finish", function () {
  document.querySelectorAll("img").forEach((img) => {
    img.hidden = false;
  });
  pauseButtonEl.hidden = true;
  closeButtonEl.hidden = false;
  timerEl.textContent = "Finish";
});
