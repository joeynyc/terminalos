/* ========= Model ========= */
const STORAGE_KEY = "leaf.workspace.v1";
const COLORS_KEY = "leaf.colors.v1";

const defaultState = { blocks: [] };

let state = load() || defaultState;

/* ========= Utils ========= */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const uid = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const events = {
  on: (event, callback) => document.addEventListener(event, callback),
  emit: (event, data) => document.dispatchEvent(new CustomEvent(event, { detail: data }))
};

/* ========= Debounce Utility ========= */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showSavingIndicator() {
  const indicator = $("#saving-indicator");
  indicator.classList.add("show");
  setTimeout(() => indicator.classList.remove("show"), 800);
}

function save(show=true, blockId = null){
  if(show) showSavingIndicator();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if(show) {
      setTimeout(() => toast("Saved"), 600);
    }
    events.emit('stateChange', { blockId });
  } catch(e) {
    if (e.name === 'QuotaExceededError') {
      toast("Storage full - consider exporting data");
    } else {
      toast("Save failed");
      console.error('Save error:', e);
    }
  }
}

const debouncedSave = debounce(() => save(false), 500);
function load(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } 
  catch(e){ return null; }
}
function toast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove("show"), 1000);
}

/* ========= Theme & Color System ========= */
const themePresets = {
  dark: {
    name: 'Dark',
    colors: {
      '--bg': '#0b0d11',
      '--panel': '#11161b',
      '--text': '#e6edf3',
      '--muted': '#9aa7b2',
      '--border': '#1f2630',
      '--accent': '#6ee7b7',
      '--accent-2': '#4f8cff',
      '--card': '#0f1317'
    }
  },
  light: {
    name: 'Light',
    colors: {
      '--bg': '#f8fafc',
      '--panel': '#ffffff',
      '--text': '#0f172a',
      '--muted': '#475569',
      '--border': '#e2e8f0',
      '--accent': '#10b981',
      '--accent-2': '#3b82f6',
      '--card': '#ffffff'
    }
  },
  midnight: {
    name: 'Midnight',
    colors: {
      '--bg': '#050505',
      '--panel': '#0a0a0a',
      '--text': '#e0e0e0',
      '--muted': '#8a8a8a',
      '--border': '#1a1a1a',
      '--accent': '#7c3aed',
      '--accent-2': '#ec4899',
      '--card': '#0d0d0d'
    }
  },
  sepia: {
    name: 'Sepia',
    colors: {
      '--bg': '#f7f3e9',
      '--panel': '#f5f1e8',
      '--text': '#5d4e37',
      '--muted': '#8b7355',
      '--border': '#e6dcc6',
      '--accent': '#cd853f',
      '--accent-2': '#d2691e',
      '--card': '#faf6ed'
    }
  }
};

// Default to dark theme
const defaultColors = themePresets.dark.colors;

function saveColors(colors) {
  localStorage.setItem(COLORS_KEY, JSON.stringify(colors));
}

function loadColors() {
  const savedColors = localStorage.getItem(COLORS_KEY);
  if (savedColors) {
    return JSON.parse(savedColors);
  }
  return defaultColors;
}

function applyColors(colors) {
  for (const [key, value] of Object.entries(colors)) {
    document.documentElement.style.setProperty(key, value);
  }
}

function updateColorPickers(colors) {
  for (const [key, value] of Object.entries(colors)) {
    const picker = document.querySelector(`[data-var="${key}"]`);
    if (picker) {
      picker.value = value;
    }
  }
}

function applyTheme(themeName) {
  if (!themePresets[themeName]) {
    console.error(`Theme "${themeName}" not found`);
    return;
  }

  const theme = themePresets[themeName];
  const overlay = $("#theme-transition-overlay");

  // Show transition overlay
  overlay.classList.add('active');

  // Apply theme after a brief delay
  setTimeout(() => {
    applyColors(theme.colors);
    updateColorPickers(theme.colors);
    saveColors(theme.colors);

    // Update active theme button
    $$('.preset-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = $(`.preset-btn[data-theme="${themeName}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Hide overlay after colors are applied
    setTimeout(() => {
      overlay.classList.remove('active');
      toast(`${theme.name} theme applied`);
    }, 150);
  }, 150);
}

function getCurrentTheme() {
  const currentColors = loadColors();

  // Check if current colors match any preset
  for (const [themeName, theme] of Object.entries(themePresets)) {
    const matches = Object.keys(theme.colors).every(key =>
      currentColors[key] === theme.colors[key]
    );
    if (matches) return themeName;
  }

  return 'custom';
}

/* ========= Layout Management ========= */
const layouts = ['single', 'masonry', 'compact', 'comfortable', 'wide'];
let currentLayoutIndex = 0;

function toggleLayout() {
  currentLayoutIndex = (currentLayoutIndex + 1) % layouts.length;
  const newLayout = layouts[currentLayoutIndex];
  console.log(`Switching to layout: ${newLayout} (index: ${currentLayoutIndex})`);
  applyLayout(newLayout);

  // Save layout preference
  localStorage.setItem('jotdown.layout', newLayout);
  toast(`${newLayout} layout applied`);
}

function applyLayout(layout) {
  const board = $("#board");

  // Ensure base 'grid' class is always present
  if (!board.classList.contains('grid')) {
    board.classList.add('grid');
  }

  // Remove all layout-specific classes
  layouts.forEach(l => board.classList.remove(`layout-${l}`));

  // Apply new layout class (except for 'single' which is default)
  if (layout !== 'single') {
    board.classList.add(`layout-${layout}`);
  }

  console.log(`Applied layout: ${layout}, board classes:`, board.className);

  // Update layout toggle button text to show current layout
  const layoutBtn = $("#layout-toggle");
  if (layoutBtn) {
    layoutBtn.textContent = `📐 ${layout.charAt(0).toUpperCase() + layout.slice(1)}`;
  }
}

function loadLayout() {
  const savedLayout = localStorage.getItem('jotdown.layout') || 'single';
  const layoutIndex = layouts.indexOf(savedLayout);
  if (layoutIndex !== -1) {
    currentLayoutIndex = layoutIndex;
    applyLayout(savedLayout);
  }
}

/* ========= Zen Mode ========= */
let isZenMode = false;

function toggleZenMode() {
  isZenMode = !isZenMode;
  const body = document.body;
  const zenBtn = $("#zen-mode");

  if (isZenMode) {
    body.classList.add('zen-mode');
    zenBtn.textContent = '👁️ Exit';
    zenBtn.title = 'Exit Zen Mode (Z)';

    // Save zen mode state
    localStorage.setItem('jotdown.zenMode', 'true');

    // Close any open panels
    $("#color-panel").style.display = 'none';

    toast('Zen mode activated');
  } else {
    body.classList.remove('zen-mode');
    zenBtn.textContent = '🧘 Zen';
    zenBtn.title = 'Toggle Zen Mode (Z)';

    // Save zen mode state
    localStorage.setItem('jotdown.zenMode', 'false');

    toast('Zen mode deactivated');
  }
}

function loadZenMode() {
  const savedZenMode = localStorage.getItem('jotdown.zenMode') === 'true';
  if (savedZenMode) {
    isZenMode = false; // Set to false so toggle works correctly
    toggleZenMode();
  }
}

/* ========= Search & Filter ========= */
let searchQuery = '';
let filteredBlocks = [];

function searchBlocks(query) {
  if (!query.trim()) {
    filteredBlocks = [...state.blocks];
    return filteredBlocks;
  }

  query = query.toLowerCase();
  filteredBlocks = state.blocks.filter(block => {
    // Search in block content
    if (block.type === 'note') {
      return block.content.toLowerCase().includes(query);
    } else if (block.type === 'tasks') {
      // Search in task list title and individual tasks
      const titleMatch = block.title.toLowerCase().includes(query);
      const taskMatch = block.items.some(task =>
        task.text.toLowerCase().includes(query)
      );
      return titleMatch || taskMatch;
    }
    return false;
  });

  return filteredBlocks;
}

function updateSearchResults() {
  const results = searchBlocks(searchQuery);

  // Show/hide blocks based on search results
  $$('.card').forEach(card => {
    const blockId = card.dataset.id;
    const shouldShow = !searchQuery || results.some(block => block.id === blockId);

    if (shouldShow) {
      card.style.display = '';
      card.classList.remove('search-hidden');
    } else {
      card.style.display = 'none';
      card.classList.add('search-hidden');
    }
  });

  // Update empty state
  const board = $('#board');
  const empty = $('#empty');
  const visibleCards = $$('.card:not(.search-hidden)');

  if (visibleCards.length === 0) {
    if (searchQuery) {
      // Show search empty state
      empty.style.display = 'flex';
      empty.querySelector('.empty-title').textContent = 'No results found';
      empty.querySelector('.empty-subtitle').textContent = `No blocks match "${searchQuery}". Try different keywords or clear the search.`;
      empty.querySelector('.empty-actions').innerHTML = '<button class="empty-btn" onclick="$(\'#search-clear\').click()">Clear Search</button>';
    } else {
      // Show regular empty state
      empty.style.display = state.blocks.length === 0 ? 'flex' : 'none';
      empty.querySelector('.empty-title').textContent = 'Welcome to JOT DOWN';
      empty.querySelector('.empty-subtitle').textContent = 'Your minimal workspace for notes and tasks. Get started by creating your first block.';
      empty.querySelector('.empty-actions').innerHTML = '<button class="empty-btn primary" onclick="$(\'#new-note\').click()">📝 Create Note</button><button class="empty-btn" onclick="$(\'#new-tasks\').click()">✅ Create Tasks</button>';
    }
  } else {
    empty.style.display = 'none';
  }
}

/* ========= Task Completion Micro-interactions ========= */
function createCompletionParticles(element) {
  const particles = ['🎉', '✨', '⭐', '💫'];
  const rect = element.getBoundingClientRect();

  for (let i = 0; i < 4; i++) {
    const particle = document.createElement('div');
    particle.className = 'completion-particle';
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];
    particle.style.left = rect.left + rect.width / 2 + 'px';
    particle.style.top = rect.top + rect.height / 2 + 'px';
    particle.style.setProperty('--random-x', `${(Math.random() - 0.5) * 60}px`);

    document.body.appendChild(particle);

    // Clean up particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }
}

function celebrateTaskCompletion(taskElement, isCompleting) {
  if (isCompleting) {
    // Add completing animation
    taskElement.classList.add('completing');

    // Create celebration particles
    const checkbox = taskElement.querySelector('input[type="checkbox"]');
    createCompletionParticles(checkbox);

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 30]);
    }

    // Remove animation class after completion
    setTimeout(() => {
      taskElement.classList.remove('completing');
    }, 600);
  }
}


/* ========= Block factories ========= */
function newNote(text=""){
  return { id: uid(), type: "note", text };
}
function newTaskList(title="Untitled tasks", items=[]){
  return { id: uid(), type: "tasks", title, items };
}
function newTask(text){ return { id: uid(), text, done:false }; }

/* ========= Event Management ========= */
const eventManagement = {
  handlers: new Map(),

  cleanupCard(cardElement) {
    const cardId = cardElement.dataset.id;
    if (this.handlers.has(cardId)) {
      const handlers = this.handlers.get(cardId);
      handlers.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.handlers.delete(cardId);
    }
  },

  addHandler(cardId, element, event, handler) {
    if (!this.handlers.has(cardId)) {
      this.handlers.set(cardId, []);
    }
    this.handlers.get(cardId).push({ element, event, handler });
    element.addEventListener(event, handler);
  },

  cleanupAll() {
    this.handlers.forEach((handlers, cardId) => {
      handlers.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.handlers.clear();
  }
};

/* ========= Render ========= */
function render(blockId = null) {
  const board = $("#board");

  if (blockId) {
    const block = state.blocks.find(b => b.id === blockId);
    const index = state.blocks.findIndex(b => b.id === blockId);
    if (block) {
      const existingCard = $(`.card[data-id="${blockId}"]`);
      if (existingCard) {
        // Clean up existing event handlers
        eventManagement.cleanupCard(existingCard);
        existingCard.outerHTML = blockHTML(block, index);
        bindBlockBehaviors($(`.card[data-id="${blockId}"]`));
      } else {
        // New card
        board.insertAdjacentHTML('afterbegin', blockHTML(block, index));
        bindBlockBehaviors($(`.card[data-id="${blockId}"]`));
      }
    }
    return;
  }

  if (!state.blocks.length) {
    $("#empty").style.display = "block";
    eventManagement.cleanupAll();
    board.innerHTML = "";
    return;
  }
  $("#empty").style.display = "none";

  // Clean up all existing handlers before full re-render
  eventManagement.cleanupAll();
  board.innerHTML = state.blocks.map((b, i) => blockHTML(b, i)).join("");

  $$(".card").forEach(card => {
    bindBlockBehaviors(card);
  });
}

function bindBlockBehaviors(card) {
  const id = card.dataset.id;

  // Drag and drop handlers
  eventManagement.addHandler(id, card, "dragstart", onDragStart);
  eventManagement.addHandler(id, card, "dragend", onDragEnd);
  eventManagement.addHandler(id, card, "dragover", onDragOver);
  eventManagement.addHandler(id, card, "dragleave", onDragLeave);

  // Note edit
  const note = card.querySelector('.note[contenteditable="true"]');
  if (note) {
    const noteHandler = e => {
      const blk = state.blocks.find(b => b.id === id);
      blk.text = note.innerText.trimEnd();
      debouncedSave();
    };
    eventManagement.addHandler(id, note, "input", noteHandler);
  }

  // Task title edit
  const taskTitle = card.querySelector('.task-title[contenteditable="true"]');
  if (taskTitle) {
    const titleHandler = e => {
      const blk = state.blocks.find(b => b.id === id);
      blk.title = taskTitle.innerText.trim() || "Untitled tasks";
      debouncedSave();
    };
    eventManagement.addHandler(id, taskTitle, "input", titleHandler);
  }

  // Task checkbox & text
  card.querySelectorAll('.task input[type="checkbox"]').forEach(cb => {
    const checkboxHandler = e => {
      const { bid, tid } = cb.dataset;
      const blk = state.blocks.find(b => b.id === bid);
      const t = blk.items.find(x => x.id === tid);
      const wasCompleted = t.done;
      t.done = cb.checked;

      // Celebrate if task was just completed
      if (!wasCompleted && cb.checked) {
        const taskElement = cb.closest('.task');
        celebrateTaskCompletion(taskElement, true);
      }

      save(false, bid); // Re-render only this block
    };
    eventManagement.addHandler(id, cb, "change", checkboxHandler);
  });

  card.querySelectorAll('.task .txt').forEach(txt => {
    const textHandler = e => {
      const { bid, tid } = txt.dataset;
      const blk = state.blocks.find(b => b.id === bid);
      const t = blk.items.find(x => x.id === tid);
      t.text = txt.innerText;
      debouncedSave();
    };
    eventManagement.addHandler(id, txt, "input", textHandler);
  });

  // Add task rows
  const addRowInput = card.querySelector(".add-row input");
  if (addRowInput) {
    const addRowHandler = e => {
      if (e.key === "Enter") {
        const id = addRowInput.dataset.bid;
        const blk = state.blocks.find(b => b.id === id);
        if (addRowInput.value.trim()) {
          blk.items.push(newTask(addRowInput.value.trim()));
          addRowInput.value = "";
          save(true, id);
        }
      }
    };
    eventManagement.addHandler(id, addRowInput, "keydown", addRowHandler);
  }

  // Actions: delete, focus
  const deleteBtn = card.querySelector('.icon[data-act="del"]');
  const deleteHandler = () => {
    eventManagement.cleanupCard(card);
    state.blocks = state.blocks.filter(b => b.id !== id);
    save();
  };
  eventManagement.addHandler(id, deleteBtn, "click", deleteHandler);

  const focusBtn = card.querySelector('.icon[data-act="focus"]');
  if (focusBtn) {
    const focusHandler = () => toggleFocus(id, true);
    eventManagement.addHandler(id, focusBtn, "click", focusHandler);
  }

  const unfocusBtn = card.querySelector('.icon[data-act="unfocus"]');
  if (unfocusBtn) {
    const unfocusHandler = () => toggleFocus(id, false);
    eventManagement.addHandler(id, unfocusBtn, "click", unfocusHandler);
  }
}

function blockHTML(b, index){
  const typeIcon = b.type === "note" ? "📝" : "✅";
  const base = `
    <div class="top">
      <div class="tags">
        <span class="tag type-${b.type}">${typeIcon} ${b.type}</span>
        <span class="tag">#${index+1}</span>
      </div>
      <div class="actions">
        <button class="icon" title="Focus" data-act="focus">🗖</button>
        <button class="icon" title="Delete" data-act="del">🗑️</button>
      </div>
    </div>`;
  if(b.type==="note"){
    return `<article class="card" draggable="true" data-id="${b.id}" data-type="note">
      ${base}
      <div class="note" contenteditable="true" spellcheck="true" placeholder="Type…">${escapeHTML(b.text || "")}</div>
    </article>`;
  }
  if(b.type==="tasks"){
    return `<article class="card" draggable="true" data-id="${b.id}" data-type="tasks">
      <div class="top">
        <div class="tags">
          <span class="tag type-tasks">${typeIcon} tasks</span>
          <span class="tag">#${index+1}</span>
        </div>
        <div class="actions">
          <button class="icon" title="Focus" data-act="focus">🗖</button>
          <button class="icon" title="Delete" data-act="del">🗑️</button>
        </div>
      </div>
      <div class="task-title" contenteditable="true">${escapeHTML(b.title || "Untitled tasks")}</div>
      <div class="tasks">
        ${b.items.map(item => `
          <div class="task ${item.done ? "done":""}">
            <input type="checkbox" ${item.done?"checked":""} data-bid="${b.id}" data-tid="${item.id}" />
            <div class="txt" contenteditable="true" data-bid="${b.id}" data-tid="${item.id}">${escapeHTML(item.text)}</div>
          </div>`).join("")}
      </div>
      <div class="add-row"><input placeholder="Add a task… (Enter)" data-bid="${b.id}" /></div>
    </article>`;
  }
  return "";
}

function escapeHTML(s){
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/* ========= Drag & drop (cards) ========= */
let dragState = {
  id: null,
  inProgress: false,
  lastDropTime: 0
};

function onDragStart(e){
  if (dragState.inProgress) {
    e.preventDefault();
    return;
  }

  const card = e.currentTarget;
  const board = $("#board");

  dragState.inProgress = true;
  dragState.id = card.dataset.id;

  // Visual feedback
  card.classList.add("dragging");
  board.classList.add("drag-active");

  e.dataTransfer.effectAllowed = "move";

  // Add gentle vibration on supported devices
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
}

function onDragEnd(e){
  const card = e.currentTarget;
  const board = $("#board");

  // Remove all drag-related classes
  card.classList.remove("dragging");
  board.classList.remove("drag-active");
  $$(".card").forEach(c => c.classList.remove("drag-over"));

  dragState.id = null;
  dragState.inProgress = false;
  dragState.lastDropTime = Date.now();

  // Debounced save to prevent excessive saves during drag operations
  debouncedSave();

  // Success vibration
  if (navigator.vibrate) {
    navigator.vibrate([30, 50, 30]);
  }
}

function onDragOver(e){
  e.preventDefault();

  if (!dragState.inProgress || !dragState.id) return;

  const over = e.currentTarget;
  const dragging = $(`.card[data-id="${dragState.id}"]`);

  if (!dragging || over === dragging) return;

  // Remove drag-over class from all cards
  $$(".card").forEach(c => c.classList.remove("drag-over"));

  // Add drag-over class to current target
  over.classList.add("drag-over");

  // Throttle drag operations to prevent excessive DOM manipulation
  const now = Date.now();
  if (now - dragState.lastDropTime < 50) return;

  const board = $("#board");
  const rect = over.getBoundingClientRect();
  const after = (e.clientY - rect.top) > rect.height/2;

  try {
    board.insertBefore(dragging, after ? over.nextSibling : over);

    // Update order in state to match DOM
    const ids = $$(".card").map(el => el.dataset.id);
    state.blocks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

    dragState.lastDropTime = now;
  } catch (error) {
    console.error('Drag operation failed:', error);
  }
}

// Add drag leave handler for better visual feedback
function onDragLeave(e) {
  const card = e.currentTarget;
  // Small delay to prevent flicker when dragging over child elements
  setTimeout(() => {
    if (!card.matches(':hover')) {
      card.classList.remove("drag-over");
    }
  }, 10);
}

/* ========= Focus mode ========= */
function toggleFocus(id, on){
  const card = $(`.card[data-id="${id}"]`);
  const backdrop = $("#backdrop");
  if(on){
    card.classList.add("focused");
    const focusBtn = card.querySelector('[data-act="focus"]');
    const newBtn = document.createElement('button');
    newBtn.className = 'icon';
    newBtn.setAttribute('data-act', 'unfocus');
    newBtn.setAttribute('title', 'Close');
    newBtn.textContent = '✕';
    focusBtn.parentNode.replaceChild(newBtn, focusBtn);
    backdrop.style.display="block";
  } else {
    card.classList.remove("focused");
    const unfocusBtn = card.querySelector('[data-act="unfocus"]');
    const newBtn = document.createElement('button');
    newBtn.className = 'icon';
    newBtn.setAttribute('data-act', 'focus');
    newBtn.setAttribute('title', 'Focus');
    newBtn.textContent = '🗖';
    unfocusBtn.parentNode.replaceChild(newBtn, unfocusBtn);
    backdrop.style.display="none";
  }
  render(); // rebind events for the swapped button
}

/* ========= App controls ========= */
$("#new-note").addEventListener("click", ()=>{
  const newBlock = newNote("");
  state.blocks.unshift(newBlock);
  save(true, newBlock.id);
  // Ensure render completes before any external scripts can interact
  requestAnimationFrame(() => {
    const newCard = $(`.card[data-id="${newBlock.id}"]`);
    if (newCard) {
      newCard.setAttribute('data-ready', 'true');
    }
  });
});
$("#new-tasks").addEventListener("click", ()=>{
  const newBlock = newTaskList("Tasks", [newTask("First task")]);
  state.blocks.unshift(newBlock);
  save(true, newBlock.id);
  // Ensure render completes before any external scripts can interact
  requestAnimationFrame(() => {
    const newCard = $(`.card[data-id="${newBlock.id}"]`);
    if (newCard) {
      newCard.setAttribute('data-ready', 'true');
    }
  });
});
$("#export").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "jotdown-export.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
function validateImportData(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.blocks)) return false;

  return data.blocks.every(block => {
    if (!block.id || !block.type) return false;
    if (!['note', 'tasks'].includes(block.type)) return false;

    if (block.type === 'note') {
      return typeof block.text === 'string';
    }

    if (block.type === 'tasks') {
      return typeof block.title === 'string' &&
             Array.isArray(block.items) &&
             block.items.every(item =>
               typeof item.id === 'string' &&
               typeof item.text === 'string' &&
               typeof item.done === 'boolean'
             );
    }

    return false;
  });
}

$("#importFile").addEventListener("change", (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (!validateImportData(data)) {
        toast("Invalid file format");
        return;
      }
      state = data; save(); toast("Imported");
    } catch(err){ toast("Import failed"); }
  };
  r.readAsText(file);
});
$("#themes").addEventListener("click", () => {
  const panel = $("#color-panel");
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

// Theme preset buttons
$$(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const themeName = btn.dataset.theme;
    applyTheme(themeName);
  });
});

$("#save-colors").addEventListener("click", () => {
  const colors = {};
  $$("#color-panel input[type='color']").forEach(picker => {
    colors[picker.dataset.var] = picker.value;
  });
  saveColors(colors);
  applyColors(colors);

  // Update active theme indicator since this is now custom
  $$('.preset-btn').forEach(btn => btn.classList.remove('active'));

  toast("Custom colors saved");
});

$("#reset-colors").addEventListener("click", () => {
  applyTheme('dark'); // Reset to default dark theme
});
$("#layout-toggle").addEventListener("click", () => {
  toggleLayout();
});
$("#zen-mode").addEventListener("click", () => {
  toggleZenMode();
});

/* ========= Search event handlers ========= */
$("#search").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  updateSearchResults();

  // Show/hide clear button
  const clearBtn = $("#search-clear");
  if (searchQuery) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }
});

$("#search-clear").addEventListener("click", () => {
  searchQuery = '';
  $("#search").value = '';
  $("#search-clear").classList.remove('visible');
  updateSearchResults();
  $("#search").focus();
});

$("#search").addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    $("#search-clear").click();
  }
});

$("#quick").addEventListener("keydown", e=>{
  if(e.key==="Enter"){
    const val = e.target.value.trim();
    if(!val) return;
    const newBlock = newNote(val);
    state.blocks.unshift(newBlock);
    e.target.value="";
    save(true, newBlock.id);
  }
});

/* ========= Shortcuts ========= */
document.addEventListener("keydown", (e)=>{
  if(e.target.matches("input,[contenteditable=true],textarea")) return;
  if(e.key.toLowerCase()==="n"){ $("#new-note").click(); }
  if(e.key.toLowerCase()==="t"){ $("#new-tasks").click(); }
  if(e.key.toLowerCase()==="z"){
    e.preventDefault();
    toggleZenMode();
  }
  if(e.key==="/"){ e.preventDefault(); $("#quick").focus(); }
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="f"){
    e.preventDefault(); $("#search").focus();
  }
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="s"){
    e.preventDefault(); $("#export").click();
  }
});

/* ========= Global Error Boundary ========= */
function initializeErrorBoundary() {
  // Global error handler for JavaScript errors
  window.addEventListener('error', (e) => {
    console.error('Global error caught:', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      error: e.error
    });
    toast('An error occurred - your data is safe');

    // Attempt to save current state if possible
    try {
      save(false);
    } catch (saveError) {
      console.error('Failed to save state after error:', saveError);
    }
  });

  // Global handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    toast('An error occurred - your data is safe');

    // Prevent the default browser behavior (console error)
    e.preventDefault();

    // Attempt to save current state if possible
    try {
      save(false);
    } catch (saveError) {
      console.error('Failed to save state after promise rejection:', saveError);
    }
  });

  // Wrap critical functions with error boundaries
  const originalRender = render;
  window.render = function(...args) {
    try {
      return originalRender.apply(this, args);
    } catch (error) {
      console.error('Render error:', error);
      toast('Display error - refreshing view');

      // Attempt a basic recovery by clearing and re-rendering
      try {
        eventManagement.cleanupAll();
        const board = $("#board");
        board.innerHTML = state.blocks.map((b, i) => blockHTML(b, i)).join("");
        $$(".card").forEach(card => bindBlockBehaviors(card));
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);
        toast('Critical error - please refresh page');
      }
    }
  };

  const originalSave = save;
  window.save = function(...args) {
    try {
      return originalSave.apply(this, args);
    } catch (error) {
      console.error('Save error:', error);
      if (error.name === 'QuotaExceededError') {
        toast("Storage full - consider exporting data");
      } else {
        toast("Save failed - your changes may be lost");
      }
    }
  };
}

/* ========= Boot ========= */
(function boot(){
  // Initialize error boundary first
  initializeErrorBoundary();

  // Apply saved colors/theme
  const savedColors = loadColors();
  applyColors(savedColors);
  updateColorPickers(savedColors);

  // Set active theme button based on current colors
  const currentTheme = getCurrentTheme();
  if (currentTheme !== 'custom') {
    const activeBtn = $(`.preset-btn[data-theme="${currentTheme}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  // Load saved layout preference
  loadLayout();

  // Load saved zen mode preference
  loadZenMode();

  // seed empty state with a welcome note
  if(!state.blocks || !state.blocks.length){
    console.log('Creating welcome note - current state:', state);
    state.blocks = [
      newNote("Welcome to **JOT DOWN** — a simple, modular workspace.\n\n• Click + Note or + Task List\n• Drag cards to reorder\n• Click 🗖 to focus a block\n• Export/Import any time\n\nThis is intentionally the opposite of a complex \"workspace tool\". No databases, no accounts, just blocks.")
    ];
    save(false);
    console.log('Welcome note created, new state:', state);
  }
  events.on('stateChange', (e) => render(e.detail.blockId));
  render();
})();