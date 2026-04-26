// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  let h = now.getHours(), m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('clock-time').textContent =
    `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}
updateClock();
setInterval(updateClock, 1000);

// ===== WINDOW MANAGEMENT =====
let zCounter = 200;
const minimizedState = {};
const windowTitles = {
  'win-mycomputer': '🖥️ My Computer',
  'win-notepad': '📝 Notepad',
  'win-recycle': '🗑️ Recycle Bin',
  'win-minesweeper': '💣 Minesweeper',
  'win-internet': '🌐 Internet Explorer',
  'win-wolfenstein': '🎮 Digger',
};

function openWindow(name) {
  const id = 'win-' + name;
  const el = document.getElementById(id);
  if (!el) return;

  if (el.style.display === 'none' || el.style.display === '') {
    el.style.display = 'flex';
    if (name === 'minesweeper' && !document.getElementById('ms-board').children.length) {
      initMinesweeper();
    }
    if (name === 'wolfenstein' && !document.getElementById('dos-game-container').innerHTML) {
      initWolfenstein();
    }
  }

  bringToFront(id);
  minimizedState[id] = false;

  if (!document.querySelector(`.taskbar-btn[data-win="${id}"]`)) {
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn active';
    btn.dataset.win = id;
    btn.textContent = windowTitles[id] || id;
    btn.onclick = () => toggleTaskbarWindow(id);
    document.getElementById('taskbar-items').appendChild(btn);
  }
  updateTaskbarBtns(id);
}

function closeWindow(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
  const btn = document.querySelector(`.taskbar-btn[data-win="${id}"]`);
  if (btn) btn.remove();
  delete minimizedState[id];
}

function minimizeWindow(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
  minimizedState[id] = true;
  updateTaskbarBtns(null);
}

function maximizeWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.dataset.maximized === '1') {
    el.style.top = el.dataset.origTop;
    el.style.left = el.dataset.origLeft;
    el.style.width = el.dataset.origWidth;
    el.style.height = el.dataset.origHeight;
    el.dataset.maximized = '0';
  } else {
    el.dataset.origTop = el.style.top;
    el.dataset.origLeft = el.style.left;
    el.dataset.origWidth = el.style.width || '';
    el.dataset.origHeight = el.style.height || '';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '100vw';
    el.style.height = 'calc(100vh - 28px)';
    el.dataset.maximized = '1';
  }
}

function bringToFront(id) {
  zCounter++;
  const el = document.getElementById(id);
  if (el) el.style.zIndex = zCounter;
  updateTaskbarBtns(id);
}

function toggleTaskbarWindow(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.style.display === 'none') {
    el.style.display = 'flex';
    minimizedState[id] = false;
    bringToFront(id);
  } else if (parseInt(el.style.zIndex) === zCounter) {
    minimizeWindow(id);
  } else {
    bringToFront(id);
  }
}

function updateTaskbarBtns(activeId) {
  document.querySelectorAll('.taskbar-btn').forEach(btn => {
    const id = btn.dataset.win;
    const el = document.getElementById(id);
    const isActive = id === activeId && el && el.style.display !== 'none';
    btn.classList.toggle('active', isActive);
  });
}

// Clicking desktop deactivates all taskbar buttons
document.getElementById('desktop').addEventListener('mousedown', () => {
  updateTaskbarBtns(null);
});

// ===== DRAG =====
let dragEl = null, dragOffX = 0, dragOffY = 0;

function dragStart(e, id) {
  const el = document.getElementById(id);
  if (!el || el.dataset.maximized === '1') return;
  bringToFront(id);
  dragEl = el;
  dragOffX = e.clientX - el.offsetLeft;
  dragOffY = e.clientY - el.offsetTop;
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
  e.preventDefault();
}

function dragMove(e) {
  if (!dragEl) return;
  let x = e.clientX - dragOffX;
  let y = e.clientY - dragOffY;
  x = Math.max(0, Math.min(x, window.innerWidth - dragEl.offsetWidth));
  y = Math.max(0, Math.min(y, window.innerHeight - 28 - dragEl.offsetHeight));
  dragEl.style.left = x + 'px';
  dragEl.style.top = y + 'px';
}

function dragEnd() {
  dragEl = null;
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
}

// Click on window brings it to front
document.querySelectorAll('.win95-window').forEach(win => {
  win.addEventListener('mousedown', () => bringToFront(win.id));
});

// ===== START MENU =====
function toggleStartMenu() {
  const menu = document.getElementById('start-menu');
  menu.classList.toggle('hidden');
}

document.addEventListener('mousedown', (e) => {
  const menu = document.getElementById('start-menu');
  const startBtn = document.getElementById('start-btn');
  if (!menu.contains(e.target) && !startBtn.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// ===== SHUTDOWN =====
function showShutdown() {
  document.getElementById('start-menu').classList.add('hidden');
  document.getElementById('shutdown-overlay').classList.remove('hidden');
}
function hideShutdown() {
  document.getElementById('shutdown-overlay').classList.add('hidden');
}
function doShutdown() {
  const val = document.querySelector('input[name="shutdown"]:checked').value;
  if (val === 'shutdown') {
    document.body.innerHTML = `
      <div style="background:#000;color:#fff;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Courier New',monospace;font-size:16px;">
        <div style="margin-bottom:24px;">It is now safe to turn off your computer.</div>
        <div style="font-size:48px;">🔌</div>
        <div style="margin-top:24px;font-size:12px;color:#aaa;">
          <a href="." style="color:#aaf;">Click here to restart</a>
        </div>
      </div>`;
  } else if (val === 'restart') {
    location.reload();
  } else {
    document.body.innerHTML = `
      <div style="background:#000;color:#aaa;height:100vh;font-family:'Courier New',monospace;font-size:14px;padding:20px;">
        <div style="color:#fff;margin-bottom:8px;">Microsoft(R) Windows 95</div>
        <div style="color:#fff;margin-bottom:20px;">(C)Copyright Microsoft Corp 1981-1995.</div>
        <div>C:\\WINDOWS&gt;<span id="cursor">_</span></div>
      </div>`;
    setInterval(() => {
      const c = document.getElementById('cursor');
      if (c) c.style.visibility = c.style.visibility === 'hidden' ? 'visible' : 'hidden';
    }, 500);
  }
}

// ===== MINESWEEPER =====
const MS_ROWS = 9, MS_COLS = 9, MS_MINES = 10;
let msBoard = [], msRevealed = [], msFlagged = [], msGameOver = false, msFirstClick = true, msTimerInterval = null, msSeconds = 0, msMinesLeft = MS_MINES;

function initMinesweeper() {
  msBoard = Array.from({length: MS_ROWS}, () => Array(MS_COLS).fill(0));
  msRevealed = Array.from({length: MS_ROWS}, () => Array(MS_COLS).fill(false));
  msFlagged = Array.from({length: MS_ROWS}, () => Array(MS_COLS).fill(false));
  msGameOver = false;
  msFirstClick = true;
  msMinesLeft = MS_MINES;
  msSeconds = 0;
  clearInterval(msTimerInterval);
  document.getElementById('ms-face').textContent = '🙂';
  updateMsCounter('ms-mines', msMinesLeft);
  updateMsCounter('ms-timer', 0);
  renderMsBoard();
}

function placeMines(safeR, safeC) {
  let placed = 0;
  while (placed < MS_MINES) {
    const r = Math.floor(Math.random() * MS_ROWS);
    const c = Math.floor(Math.random() * MS_COLS);
    if (msBoard[r][c] === -1) continue;
    if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
    msBoard[r][c] = -1;
    placed++;
  }
  for (let r = 0; r < MS_ROWS; r++) {
    for (let c = 0; c < MS_COLS; c++) {
      if (msBoard[r][c] === -1) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < MS_ROWS && nc >= 0 && nc < MS_COLS && msBoard[nr][nc] === -1) count++;
        }
      msBoard[r][c] = count;
    }
  }
}

function renderMsBoard() {
  const board = document.getElementById('ms-board');
  board.innerHTML = '';
  for (let r = 0; r < MS_ROWS; r++) {
    for (let c = 0; c < MS_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'ms-cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      if (msRevealed[r][c]) {
        cell.classList.add('revealed');
        const v = msBoard[r][c];
        if (v === -1) { cell.textContent = '💣'; cell.classList.add('mine-hit'); }
        else if (v > 0) { cell.textContent = v; cell.classList.add('ms-' + v); }
      } else if (msFlagged[r][c]) {
        cell.textContent = '🚩';
        cell.classList.add('flagged');
      }
      cell.addEventListener('click', () => msClick(r, c));
      cell.addEventListener('contextmenu', (e) => { e.preventDefault(); msFlag(r, c); });
      board.appendChild(cell);
    }
  }
}

function msClick(r, c) {
  if (msGameOver || msRevealed[r][c] || msFlagged[r][c]) return;
  if (msFirstClick) {
    msFirstClick = false;
    placeMines(r, c);
    msTimerInterval = setInterval(() => {
      msSeconds = Math.min(999, msSeconds + 1);
      updateMsCounter('ms-timer', msSeconds);
    }, 1000);
  }
  if (msBoard[r][c] === -1) {
    revealAllMines();
    msGameOver = true;
    clearInterval(msTimerInterval);
    document.getElementById('ms-face').textContent = '😵';
    return;
  }
  msFloodFill(r, c);
  renderMsBoard();
  checkMsWin();
}

function msFlag(r, c) {
  if (msGameOver || msRevealed[r][c]) return;
  msFlagged[r][c] = !msFlagged[r][c];
  msMinesLeft += msFlagged[r][c] ? -1 : 1;
  updateMsCounter('ms-mines', msMinesLeft);
  renderMsBoard();
}

function msFloodFill(r, c) {
  if (r < 0 || r >= MS_ROWS || c < 0 || c >= MS_COLS) return;
  if (msRevealed[r][c] || msFlagged[r][c]) return;
  msRevealed[r][c] = true;
  if (msBoard[r][c] === 0) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        msFloodFill(r + dr, c + dc);
  }
}

function revealAllMines() {
  for (let r = 0; r < MS_ROWS; r++)
    for (let c = 0; c < MS_COLS; c++)
      if (msBoard[r][c] === -1) msRevealed[r][c] = true;
  renderMsBoard();
}

function checkMsWin() {
  let unrevealed = 0;
  for (let r = 0; r < MS_ROWS; r++)
    for (let c = 0; c < MS_COLS; c++)
      if (!msRevealed[r][c]) unrevealed++;
  if (unrevealed === MS_MINES) {
    msGameOver = true;
    clearInterval(msTimerInterval);
    document.getElementById('ms-face').textContent = '😎';
  }
}

function updateMsCounter(id, val) {
  document.getElementById(id).textContent = String(Math.max(0, Math.min(999, val))).padStart(3, '0');
}

// ===== WOLFENSTEIN 3D (js-dos) =====
function initWolfenstein() {
  const container = document.getElementById('dos-game-container');
  if (!container) return;

  // Only initialize if not already loaded
  if (!container.dataset.loaded) {
    container.innerHTML = '<div style="color:#fff;padding:20px;text-align:center;padding-top:200px;">Loading...</div>';
    
    try {
      // Use digger as test - if this works, the API is functional
      // Wolf3d bundle may not exist on server
      Dos(container, {
        url: 'https://v8.js-dos.com/bundles/digger.jsdos',
        theme: 'retro',
        noNetworking: true,
        noCloud: true,
      });
      container.dataset.loaded = 'true';
    } catch (e) {
      container.innerHTML = '<div style="color:#fff;padding:20px;">Error: ' + e.message + '</div>';
      console.error('DOS game error:', e);
    }
  }
}
