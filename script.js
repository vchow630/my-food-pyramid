let selectedEmoji = null;
let foodsOnPyramid = [];

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
      div.textContent = emoji;
      div.onclick = () => {
        selectedEmoji = emoji;
        document.querySelectorAll('.food-item').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
      };
      container.appendChild(div);
    });
  });
}

function setupPyramidTap() {
  const container = document.getElementById('pyramidContainer');
  container.addEventListener('click', (e) => {
    if (!selectedEmoji) {
      alert("Please tap a food emoji from the left first!");
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - 22;
    const y = e.clientY - rect.top - 22;

    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.fontSize = '44px';
    el.style.cursor = 'grab';
    el.style.left = Math.max(20, Math.min(x, 480)) + 'px';
    el.style.top = Math.max(20, Math.min(y, 520)) + 'px';
    el.textContent = selectedEmoji;

    // Make draggable
    let isDragging = false, offsetX, offsetY;

    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start);

    function start(ev) {
      isDragging = true;
      const r = el.getBoundingClientRect();
      offsetX = (ev.clientX || ev.touches[0].clientX) - r.left;
      offsetY = (ev.clientY || ev.touches[0].clientY) - r.top;
    }

    function move(ev) {
      if (!isDragging) return;
      const cx = ev.clientX || ev.touches[0].clientX;
      const cy = ev.clientY || ev.touches[0].clientY;
      el.style.left = Math.max(20, Math.min(cx - offsetX, 480)) + 'px';
      el.style.top = Math.max(20, Math.min(cy - offsetY, 520)) + 'px';
    }

    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('touchend', () => isDragging = false);

    el.addEventListener('dblclick', () => el.remove());

    container.appendChild(el);
    foodsOnPyramid.push(el);
  });
}

window.resetPyramid = () => {
  if (confirm("Clear everything?")) {
    foodsOnPyramid.forEach(f => f.remove());
    foodsOnPyramid = [];
  }
};

window.saveAsImage = async () => {
  try {
    const canvas = await html2canvas(document.querySelector('.main'), { scale: 2 });
    const link = document.createElement('a');
    link.download = 'My_Food_Pyramid.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    alert("✅ Image saved!");
  } catch (e) {
    alert("Failed to save.");
  }
};

window.onload = () => {
  populateFoods();
  setupPyramidTap();
};
