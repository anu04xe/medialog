/* js/app.js — main controller */

let entries = loadEntries();
let nextId = entries.length ? Math.max(...entries.map(e=>e.id)) + 1 : 1;
let activeTypeFilter = 'all';
let activeStatusFilter = 'all';
let activeSortBy = 'start-desc';
window.activeTagFilter = null;
let activeView = 'dashboard';
let searchQuery = '';
let currentEditId = null;
let currentRating = 0;
let selectedColor = ACCENT_COLORS[0];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupStars();
  setupColorPicker();
  setupSearch();
  setupSortSelect();
  setupStatusFilters();
  renderAll();
});

function renderAll() {
  renderNow(entries, activeTypeFilter);
  renderRecent(entries, activeTypeFilter);
  renderStats(entries);
  renderLog(entries, activeTypeFilter, activeStatusFilter, activeSortBy, window.activeTagFilter, searchQuery);
  renderTagFilters(entries);
  if (activeView === 'timeline') renderTimeline(entries, activeTypeFilter);
}

// ===== TABS =====
function setupTabs() {
  document.querySelectorAll('#type-tabs .tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#type-tabs .tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      activeTypeFilter = btn.dataset.type;
      window.activeTagFilter = null;
      renderAll();
    });
  });
}

// ===== VIEW SWITCHER =====
function switchView(view, btn) {
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeView = view;
  document.getElementById('view-dashboard').style.display = view === 'dashboard' ? '' : 'none';
  document.getElementById('view-timeline').style.display = view === 'timeline' ? '' : 'none';
  document.getElementById('view-log').style.display = view === 'log' ? '' : 'none';
  if (view === 'timeline') renderTimeline(entries, activeTypeFilter);
  if (view === 'log') { renderLog(entries, activeTypeFilter, activeStatusFilter, activeSortBy, window.activeTagFilter, searchQuery); renderTagFilters(entries); }
}

// ===== SEARCH =====
function setupSearch() {
  const inp = document.getElementById('global-search');
  const clearBtn = document.getElementById('search-clear');
  inp.addEventListener('input', () => {
    searchQuery = inp.value.trim();
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    updateSearchBanner();
    renderLog(entries, activeTypeFilter, activeStatusFilter, activeSortBy, window.activeTagFilter, searchQuery);
    if (searchQuery && activeView !== 'log') {
      switchView('log', document.querySelector('.view-btn[data-view="log"]'));
    }
  });
}
function clearSearch() {
  document.getElementById('global-search').value = '';
  document.getElementById('search-clear').style.display = 'none';
  searchQuery = '';
  updateSearchBanner();
  renderLog(entries, activeTypeFilter, activeStatusFilter, activeSortBy, window.activeTagFilter, searchQuery);
}
function updateSearchBanner() {
  const banner = document.getElementById('search-banner');
  if (!searchQuery) { banner.style.display = 'none'; return; }
  const count = entries.filter(e => {
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) || (e.creator||'').toLowerCase().includes(q) || (e.review||'').toLowerCase().includes(q) || (e.tags||[]).some(t=>t.toLowerCase().includes(q));
  }).length;
  banner.style.display = 'flex';
  banner.innerHTML = `<span>🔍</span><span>Showing <strong>${count}</strong> result${count!==1?'s':''} for "<strong>${escHtml(searchQuery)}</strong>"</span><span style="cursor:pointer;margin-left:auto;color:var(--muted)" onclick="clearSearch()">clear</span>`;
}

// ===== STATUS FILTERS =====
function setupStatusFilters() {
  document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeStatusFilter = btn.dataset.status;
      renderLog(entries, activeTypeFilter, activeStatusFilter, activeSortBy, window.activeTagFilter, searchQuery);
    });
  });
}

// ===== SORT =====
function setupSortSelect() {
  document.getElementById('sort-select').addEventListener('change', e => {
    activeSortBy = e.target.value;
    renderLog(entries, activeTypeFilter, activeStatusFilter, activeSortBy, window.activeTagFilter, searchQuery);
  });
}

// ===== TAG FILTER =====
function filterByTag(tag) {
  if (window.activeTagFilter === tag) {
    window.activeTagFilter = null;
  } else {
    window.activeTagFilter = tag;
  }
  renderTagFilters(entries);
  renderLog(entries, activeTypeFilter, activeStatusFilter, activeSortBy, window.activeTagFilter, searchQuery);
}

// ===== STARS =====
function setupStars() {
  document.querySelectorAll('#star-input .star').forEach(s => {
    s.addEventListener('click', () => {
      const v = parseInt(s.dataset.v);
      currentRating = currentRating === v ? 0 : v;
      updateStarDisplay();
    });
    s.addEventListener('mouseenter', () => {
      const v = parseInt(s.dataset.v);
      document.querySelectorAll('#star-input .star').forEach(x => x.classList.toggle('lit', parseInt(x.dataset.v) <= v));
    });
    s.addEventListener('mouseleave', updateStarDisplay);
  });
}
function updateStarDisplay() {
  document.querySelectorAll('#star-input .star').forEach(x => x.classList.toggle('lit', parseInt(x.dataset.v) <= currentRating));
}

// ===== COLOR PICKER =====
function setupColorPicker() {
  const row = document.getElementById('color-picker');
  row.innerHTML = ACCENT_COLORS.map(c =>
    `<div class="color-swatch${c===selectedColor?' selected':''}" style="background:${c}" data-color="${c}" onclick="selectColor('${c}')"></div>`
  ).join('');
}
function selectColor(c) {
  selectedColor = c;
  document.querySelectorAll('.color-swatch').forEach(el => el.classList.toggle('selected', el.dataset.color === c));
}

// ===== TAG SUGGESTIONS =====
function populateTagSuggestions() {
  const existing = new Set(entries.flatMap(e => e.tags || []));
  const all = [...new Set([...TAG_PRESETS, ...existing])].slice(0, 20);
  document.getElementById('tag-suggestions').innerHTML = all.map(t =>
    `<span class="tag-sug-chip" onclick="addTagSuggestion('${escAttr(t)}')">${escHtml(t)}</span>`
  ).join('');
}
function addTagSuggestion(tag) {
  const inp = document.getElementById('f-tags');
  const current = inp.value.split(',').map(t=>t.trim()).filter(Boolean);
  if (!current.includes(tag)) { current.push(tag); inp.value = current.join(', '); }
}

// ===== ADD / EDIT MODAL =====
function openAdd(prefillEntry) {
  currentEditId = null;
  currentRating = 0;
  selectedColor = ACCENT_COLORS[0];

  document.getElementById('modal-title').textContent = 'log something new';
  document.getElementById('delete-btn').style.display = 'none';
  document.getElementById('f-title').value = '';
  document.getElementById('f-type').value = 'game';
  document.getElementById('f-status').value = 'active';
  document.getElementById('f-creator').value = '';
  document.getElementById('f-start').value = new Date().toISOString().slice(0,10);
  document.getElementById('f-end').value = '';
  document.getElementById('f-progress').value = '';
  document.getElementById('f-pct').value = 0;
  document.getElementById('pct-display').textContent = '0%';
  document.getElementById('f-tags').value = '';
  document.getElementById('f-review').value = '';

  if (prefillEntry) {
    Object.assign({}, prefillEntry);
    document.getElementById('f-title').value = prefillEntry.title || '';
    document.getElementById('f-type').value = prefillEntry.type || 'film';
    document.getElementById('f-status').value = prefillEntry.status || 'active';
    document.getElementById('f-creator').value = prefillEntry.creator || '';
    document.getElementById('f-start').value = prefillEntry.start || '';
    document.getElementById('f-end').value = prefillEntry.end || '';
    document.getElementById('f-progress').value = prefillEntry.progress || '';
    document.getElementById('f-pct').value = prefillEntry.pct || 0;
    document.getElementById('pct-display').textContent = (prefillEntry.pct || 0) + '%';
    document.getElementById('f-tags').value = (prefillEntry.tags || []).join(', ');
    document.getElementById('f-review').value = prefillEntry.review || '';
    currentRating = prefillEntry.rating || 0;
    selectedColor = prefillEntry.color || ACCENT_COLORS[0];
    currentEditId = prefillEntry.id;
    document.getElementById('modal-title').textContent = 'edit entry';
    document.getElementById('delete-btn').style.display = 'block';
  }

  updateStarDisplay();
  setupColorPicker();
  populateTagSuggestions();
  document.getElementById('add-modal').classList.add('open');
  setTimeout(() => document.getElementById('f-title').focus(), 80);
}

function closeAdd() {
  document.getElementById('add-modal').classList.remove('open');
  currentEditId = null;
}

function saveEntry() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) { document.getElementById('f-title').focus(); return; }

  const tags = document.getElementById('f-tags').value
    .split(',').map(t => t.trim()).filter(Boolean);

  const data = {
    title,
    type: document.getElementById('f-type').value,
    status: document.getElementById('f-status').value,
    creator: document.getElementById('f-creator').value.trim(),
    start: document.getElementById('f-start').value,
    end: document.getElementById('f-end').value,
    progress: document.getElementById('f-progress').value.trim(),
    pct: parseInt(document.getElementById('f-pct').value) || 0,
    rating: currentRating,
    color: selectedColor,
    tags,
    review: document.getElementById('f-review').value.trim(),
  };

  if (currentEditId) {
    const idx = entries.findIndex(e => e.id === currentEditId);
    if (idx !== -1) entries[idx] = { ...entries[idx], ...data };
  } else {
    data.id = nextId++;
    entries.push(data);
  }

  saveEntries(entries);
  closeAdd();
  renderAll();
}

function confirmDelete() {
  if (!currentEditId) return;
  if (!confirm('Delete this entry? This cannot be undone.')) return;
  entries = entries.filter(e => e.id !== currentEditId);
  saveEntries(entries);
  closeAdd();
  renderAll();
}

// ===== REVIEW MODAL =====
let reviewTargetId = null;

function openReview(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  reviewTargetId = id;
  renderReviewModal(entry);
  document.getElementById('review-modal').classList.add('open');
}

function closeReview() {
  document.getElementById('review-modal').classList.remove('open');
  reviewTargetId = null;
}

function editFromReview() {
  const entry = entries.find(e => e.id === reviewTargetId);
  closeReview();
  if (entry) openAdd(entry);
}

// ===== BACKDROP CLICK =====
function handleBackdropClick(event, modalId) {
  if (event.target.id === modalId) {
    if (modalId === 'add-modal') closeAdd();
    else if (modalId === 'review-modal') closeReview();
    else if (modalId === 'import-modal') closeImport();
  }
}

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAdd(); closeReview(); closeImport();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('global-search').focus();
  }
});
