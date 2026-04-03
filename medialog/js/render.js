/* js/render.js — all rendering functions */

function fmt(d) {
  if (!d) return '—';
  const p = d.split('-');
  return `${p[2]}/${p[1]}/${p[0].slice(2)}`;
}

function daysOn(start, end) {
  if (!start) return null;
  const a = new Date(start);
  const b = end ? new Date(end) : new Date();
  return Math.max(0, Math.round((b - a) / 86400000));
}

function starStr(n, filled = '★', empty = '☆') {
  if (!n) return '';
  return filled.repeat(n) + empty.repeat(5 - n);
}

function renderNow(entries, typeFilter) {
  let active = entries.filter(e => e.status === 'active');
  if (typeFilter && typeFilter !== 'all') active = active.filter(e => e.type === typeFilter);

  const g = document.getElementById('now-grid');
  if (!active.length) {
    g.innerHTML = `<div class="empty"><div class="big">nothing active right now</div><div>tap "+ log something" to start tracking</div></div>`;
    return;
  }
  g.innerHTML = active.map(e => {
    const m = TYPE_META[e.type] || TYPE_META.game;
    const accent = e.color || m.accent;
    const days = daysOn(e.start, '');
    const tagsHtml = (e.tags || []).slice(0, 3).map(t => `<span class="mini-tag">${t}</span>`).join('');
    return `
      <div class="now-card" style="--card-glow:${accent}" onclick="openReview(${e.id})">
        <div class="card-art" style="border-color:${accent}22">${m.icon}</div>
        <div class="card-body">
          <div class="card-type-badge" style="background:${m.badge};color:${m.badgeColor}">${m.label}</div>
          <div class="card-title">${escHtml(e.title)}</div>
          <div class="card-sub">${escHtml(e.creator || 'unknown')}${days !== null ? ' &middot; ' + days + 'd in' : ''}</div>
          <div class="progress-wrap">
            <div class="progress-bar" style="width:${e.pct || 0}%;background:${accent}"></div>
          </div>
          <div class="progress-meta">
            <span>${escHtml(e.progress || 'in progress')}</span>
            <span>${e.pct || 0}%</span>
          </div>
          ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
        </div>
        <div class="pulse" style="background:${accent}"></div>
      </div>`;
  }).join('');
}

function renderRecent(entries, typeFilter) {
  let done = entries.filter(e => e.status === 'done');
  if (typeFilter && typeFilter !== 'all') done = done.filter(e => e.type === typeFilter);
  done.sort((a, b) => (b.end || '').localeCompare(a.end || ''));
  const recent = done.slice(0, 8);

  const el = document.getElementById('recent-list');
  if (!recent.length) { el.innerHTML = ''; return; }
  el.innerHTML = recent.map(e => {
    const m = TYPE_META[e.type] || TYPE_META.game;
    return `
      <div class="recent-card" onclick="openReview(${e.id})">
        <div class="recent-icon">${m.icon}</div>
        <div class="recent-title">${escHtml(e.title)}</div>
        <div class="recent-sub">${fmt(e.end)}</div>
        ${e.rating ? `<div class="recent-rating">${'★'.repeat(e.rating)}</div>` : ''}
      </div>`;
  }).join('');
}

function renderStats(entries) {
  const total = entries.length;
  const done = entries.filter(e => e.status === 'done').length;
  const active = entries.filter(e => e.status === 'active').length;
  const types = new Set(entries.map(e => e.type)).size;
  const totalDays = entries.reduce((acc, e) => acc + (daysOn(e.start, e.end) || 0), 0);
  document.getElementById('stats-bar').innerHTML = `
    <div class="stat-chip"><div class="stat-num">${total}</div><div class="stat-lbl">logged</div></div>
    <div class="stat-chip"><div class="stat-num">${done}</div><div class="stat-lbl">finished</div></div>
    <div class="stat-chip"><div class="stat-num">${active}</div><div class="stat-lbl">active</div></div>
    <div class="stat-chip"><div class="stat-num">${types}</div><div class="stat-lbl">media types</div></div>
    <div class="stat-chip"><div class="stat-num">${totalDays}</div><div class="stat-lbl">total days</div></div>`;
}

function renderLog(entries, typeFilter, statusFilter, sortBy, tagFilter, searchQuery) {
  let list = [...entries];
  if (typeFilter && typeFilter !== 'all') list = list.filter(e => e.type === typeFilter);
  if (statusFilter && statusFilter !== 'all') list = list.filter(e => e.status === statusFilter);
  if (tagFilter) list = list.filter(e => (e.tags || []).includes(tagFilter));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.creator || '').toLowerCase().includes(q) ||
      (e.review || '').toLowerCase().includes(q) ||
      (e.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }
  switch(sortBy) {
    case 'start-asc': list.sort((a,b)=>(a.start||'').localeCompare(b.start||'')); break;
    case 'end-desc':  list.sort((a,b)=>(b.end||'').localeCompare(a.end||'')); break;
    case 'alpha':     list.sort((a,b)=>a.title.localeCompare(b.title)); break;
    case 'rating':    list.sort((a,b)=>(b.rating||0)-(a.rating||0)); break;
    default:          list.sort((a,b)=>(b.start||'').localeCompare(a.start||'')); break;
  }

  const el = document.getElementById('log-list');
  if (!list.length) {
    el.innerHTML = `<div class="empty"><div class="big">no entries match</div><div>try adjusting the filters or search</div></div>`;
    return;
  }
  const sMap = { active:'s-active', done:'s-done', dropped:'s-dropped', planned:'s-planned' };
  el.innerHTML = list.map(e => {
    const m = TYPE_META[e.type] || TYPE_META.game;
    const accent = e.color || m.accent;
    const days = daysOn(e.start, e.end);
    const tags = (e.tags || []).slice(0, 4).map(t => `<span class="mini-tag">${escHtml(t)}</span>`).join('');
    return `
      <div class="log-entry" onclick="openReview(${e.id})">
        <div class="entry-icon" style="border-color:${accent}33">${m.icon}</div>
        <div class="entry-info">
          <div class="entry-name">${escHtml(e.title)}</div>
          <div class="entry-meta">${m.label}${e.creator ? ' &middot; ' + escHtml(e.creator) : ''}${e.progress ? ' &middot; ' + escHtml(e.progress) : ''}</div>
          ${tags ? `<div class="entry-tags">${tags}</div>` : ''}
        </div>
        <div class="entry-right">
          <div><span class="status-pill ${sMap[e.status] || 's-active'}">${e.status}</span></div>
          <div class="entry-dates">
            <div>▶ ${fmt(e.start)}</div>
            ${e.end ? `<div>■ ${fmt(e.end)}</div>` : ''}
            ${days !== null ? `<div>${days}d</div>` : ''}
          </div>
          ${e.rating ? `<div class="entry-rating">${'★'.repeat(e.rating)}</div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderTagFilters(entries) {
  const tagCounts = {};
  entries.forEach(e => (e.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const top = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([t])=>t);
  const row = document.getElementById('tag-filter-row');
  if (!top.length) { row.innerHTML=''; return; }
  row.innerHTML = top.map(t =>
    `<span class="tag-filter-chip${window.activeTagFilter===t?' active':''}" onclick="filterByTag('${escAttr(t)}')">${escHtml(t)}</span>`
  ).join('');
}

function renderReviewModal(entry) {
  const m = TYPE_META[entry.type] || TYPE_META.game;
  const accent = entry.color || m.accent;
  const days = daysOn(entry.start, entry.end);
  document.getElementById('rv-title').textContent = entry.title;
  const stars = entry.rating ? starStr(entry.rating) : 'not rated';
  const tagsHtml = (entry.tags || []).map(t => `<span class="review-tag">${escHtml(t)}</span>`).join('');

  document.getElementById('review-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
      <div style="font-size:40px;line-height:1">${m.icon}</div>
      <div>
        <div style="font-size:12px;font-family:var(--font-mono);color:var(--muted);margin-bottom:2px">${m.label}${entry.creator ? ' · ' + escHtml(entry.creator) : ''}</div>
        <div class="status-pill s-${entry.status}" style="margin-bottom:0">${entry.status}</div>
      </div>
    </div>
    <div class="review-meta-grid">
      <div class="review-meta-cell"><div class="rv-label">started</div><div class="rv-val">${fmt(entry.start)}</div></div>
      <div class="review-meta-cell"><div class="rv-label">finished</div><div class="rv-val">${fmt(entry.end)}</div></div>
      <div class="review-meta-cell"><div class="rv-label">time spent</div><div class="rv-val">${days !== null ? days + ' days' : '—'}</div></div>
    </div>
    <div class="review-meta-cell" style="margin-bottom:12px">
      <div class="rv-label">progress</div>
      <div class="review-progress-wrap" style="margin:6px 0 4px">
        <div class="review-progress-bar" style="width:${entry.pct||0}%;background:${accent}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--muted);font-family:var(--font-mono)">
        <span>${escHtml(entry.progress || 'in progress')}</span><span>${entry.pct||0}%</span>
      </div>
    </div>
    <div style="font-size:11px;font-family:var(--font-mono);color:var(--muted);margin-bottom:4px">rating</div>
    <div style="font-size:22px;color:var(--accent4);margin-bottom:12px">${stars}</div>
    ${tagsHtml ? `<div class="review-tags">${tagsHtml}</div>` : ''}
    ${entry.review ? `<div class="review-text">${escHtml(entry.review)}</div>` : ''}
  `;
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(s) {
  if (!s) return '';
  return String(s).replace(/'/g,"\\'");
}
