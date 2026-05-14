let foodsOnPyramid = [];
let history = [];
let historyIndex = -1;

const foods = {
  carb: ["🍚","🍝","🍜","🥟","🍞","🥐"],
  protein: ["🍗","🥩","🐖","🐟","🍤","🥚","🍖"],
  veg: ["🥦","🥬","🥕","🍎","🍊","🍌","🍅","🥑"]
};

function populateFoods() {
  Object.keys(foods).forEach(key => {
    const container = document.getElementById(key);
    container.innerHTML = '';
    foods[key].forEach(emoji => {
      const div = document.createElement('div');
      div.className = 'food-item';
      div.draggable = true;
      div.textContent = emoji;
      div.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', emoji));
      container.appendChild(div);
    });
  });
}

function setupDrop() {
  const container = document.getElementById('pyramidContainer');
  container.addEventListener('dragover', e => e.preventDefault());
  container.addEventListener('drop', e => {
    e.preventDefault();
    const emoji = e.dataTransfer.getData('text/plain');
    if (emoji) addFood(emoji, e);
  });
}

function addFood(emoji, e) {
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.fontSize = '44px';
  el.style.cursor = 'grab';
  el.style.zIndex = '30';
  el.textContent = emoji;

  const rect = document.getElementById('pyramidContainer').getBoundingClientRect();
  let x = e.clientX - rect.left - 22;
  let y = e.clientY - rect.top - 22;

  x = Math.max(30, Math.min(x, 480));
  y = Math.max(30, Math.min(y, 520));

  el.style.left = x + 'px';
  el.style.top = y + 'px';

  makeDraggable(el);
  document.getElementById('pyramidContainer').appendChild(el);
  foodsOnPyramid.push(el);
  saveHistory();
}

function makeDraggable(el) {
  let isDragging = false, offsetX, offsetY;

  el.addEventListener('mousedown', start);
  el.addEventListener('touchstart', start);

  function start(e) {
    isDragging = true;
    const r = el.getBoundingClientRect();
    offsetX = (e.clientX || e.touches[0].clientX) - r.left;
    offsetY = (e.clientY || e.touches[0].clientY) - r.top;
    el.style.zIndex = 200;
  }

  function move(e) {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    let newX = clientX - offsetX;
    let newY = clientY - offsetY;

    newX = Math.max(20, Math.min(newX, 480));
    newY = Math.max(20, Math.min(newY, 520));

    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
  }

  document.addEventListener('mousemove', move);
  document.addEventListener('touchmove', move);

  document.addEventListener('mouseup', () => { if(isDragging) saveHistory(); isDragging = false; });
  document.addEventListener('touchend', () => { if(isDragging) saveHistory(); isDragging = false; });

  el.addEventListener('dblclick', () => {
    el.remove();
    foodsOnPyramid = foodsOnPyramid.filter(f => f !== el);
    saveHistory();
  });
}

function saveHistory() {
  const state = foodsOnPyramid.map(food => ({
    emoji: food.textContent,
    left: food.style.left,
    top: food.style.top
  }));
  history = history.slice(0, historyIndex + 1);
  history.push(state);
  historyIndex++;
}

window.undo = () => {
  if (historyIndex <= 0) return;
  historyIndex--;
  restoreHistory();
};

window.redo = () => {
  if (historyIndex >= history.length - 1) return;
  historyIndex++;
  restoreHistory();
};

function restoreHistory() {
  foodsOnPyramid.forEach(f => f.remove());
  foodsOnPyramid = [];

  const state = history[historyIndex];
  const container = document.getElementById('pyramidContainer');

  state.forEach(item => {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.fontSize = '44px';
    el.style.left = item.left;
    el.style.top = item.top;
    el.textContent = item.emoji;
    makeDraggable(el);
    container.appendChild(el);
    foodsOnPyramid.push(el);
  });
}

window.resetPyramid = () => {
  if (confirm("Clear everything?")) {
    foodsOnPyramid.forEach(f => f.remove());
    foodsOnPyramid = [];
    history = [[]];
    historyIndex = 0;
  }
};

window.saveAsImage = async () => {
  try {
    // Capture the whole page area including the title
    const captureArea = document.body;   // or document.querySelector('.main') if you prefer
    
    const canvas = await html2canvas(captureArea, {
      scale: 2.2,                    // Higher quality
      backgroundColor: "#f0f7f0",
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    const link = document.createElement('a');
    link.download = 'My_Food_Pyramid.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    alert("✅ Image saved with title!");
  } catch (e) {
    alert("Failed to save image. Please try again.");
  }
};

window.onload = () => {
  populateFoods();
  setupDrop();
  history = [[]];
  historyIndex = 0;
};
