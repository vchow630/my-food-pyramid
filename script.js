let selectedEmoji = null;
let foodsOnPyramid = [];
let history = [];
let historyIndex = -1;

const foods = {
  carb: ["🍚","🍝","🍜","🥟","🥔","🍞","🥐"],
  protein: ["🍗","🥩","🐖","🐟","🦐","🥚","🍖","🥛"],
  veg: ["🥦","🥬","🫛","🥒","🫑","🍄","🫐","🥕","🍎","🍊","🍌","🍅","🥑"],
  others: ["🍦","🍰","🍩","🍫","🥤","☕","🍵","🍔","🍟","🍕","🍪","🥜","🍷","🍺"]   // New category
};

function populateFoods() {
  Object.keys(foods).forEach(key => {
    const container = document.getElementById(key);
    if (!container) return;
    container.innerHTML = '';
    
    foods[key].forEach(emoji => {
      const div = document.createElement('div');
      div.className = 'food-item';
      div.textContent = emoji;
      div.onclick = () => selectEmoji(emoji, div);
      container.appendChild(div);
    });
  });
}

function selectEmoji(emoji, element) {
  document.querySelectorAll('.food-item').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedEmoji = emoji;
}

function setupPyramidTap() {
  const container = document.getElementById('pyramidContainer');
  container.addEventListener('click', (e) => {
    if (!selectedEmoji) {
      alert("Please tap a food from the left first!");
      return;
    }
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - 22;
    const y = e.clientY - rect.top - 22;
    addFood(selectedEmoji, x, y);
  });
}

function addFood(emoji, x, y) {
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.fontSize = '44px';
  el.style.cursor = 'grab';
  el.style.zIndex = '30';
  el.textContent = emoji;
  el.style.left = Math.max(20, Math.min(x, 480)) + 'px';
  el.style.top = Math.max(20, Math.min(y, 520)) + 'px';

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
    const canvas = await html2canvas(document.querySelector('.main'), { scale: 2.2 });
    const link = document.createElement('a');
    link.download = 'My_Food_Pyramid.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    alert("✅ Image saved!");
  } catch (e) {
    alert("Failed to save image.");
  }
};

window.onload = () => {
  populateFoods();
  setupPyramidTap();
  history = [[]];
  historyIndex = 0;
};
