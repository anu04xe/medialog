/* js/import.js — CSV import / export */

let pendingImport = [];

function handleCSVImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const rows = parseCSV(text);
    if (!rows.length) { alert('No rows found in CSV.'); return; }
    pendingImport = rows;
    showImportPreview(rows);
  };
  reader.readAsText(file);
  event.target.value = '';
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g,''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const vals = splitCSVLine(raw);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] || '').trim().replace(/^"|"$/g,''); });

    // Detect Letterboxd format: Name, Year, URI, Rating, WatchedDate
    const isLetterboxd = headers.includes('name') && headers.includes('watcheddate');
    // Detect MAL format: series_title, my_status, my_score, my_start_date, my_finish_date
    const isMAL = headers.includes('seriestitle') || headers.includes('myscore');

    let entry;
    if (isLetterboxd) {
      entry = {
        title: row.name || row.title || '',
        type: 'film',
        status: 'done',
        creator: '',
        start: row.watcheddate || '',
        end: row.watcheddate || '',
        progress: 'Watched',
        pct: 100,
        rating: row.rating ? Math.round(parseFloat(row.rating)) : 0,
        tags: [],
        review: '',
        color: '#f9c97a',
      };
    } else if (isMAL) {
      const statusMap = { 'Completed':'done','Watching':'active','Plan to Watch':'planned','Dropped':'dropped','On-Hold':'active' };
      entry = {
        title: row.seriestitle || row.title || '',
        type: 'anime',
        status: statusMap[row.mystatus] || 'done',
        creator: '',
        start: row.mystartdate || '',
        end: row.myfinishdate || '',
        progress: '',
        pct: row.mystatus === 'Completed' ? 100 : 0,
        rating: row.myscore ? Math.round(parseFloat(row.myscore) / 2) : 0,
        tags: [],
        review: '',
        color: '#f7a8c0',
      };
    } else {
      // Generic medialog CSV
      const statusMap = { 'active':'active','done':'done','completed':'done','finished':'done','watching':'active','reading':'active','playing':'active','planned':'planned','dropped':'dropped' };
      entry = {
        title: row.title || row.name || '',
        type: row.type || 'film',
        status: statusMap[(row.status||'').toLowerCase()] || 'done',
        creator: row.creator || row.studio || row.author || '',
        start: row.start || row.startdate || '',
        end: row.end || row.enddate || row.finisheddate || '',
        progress: row.progress || '',
        pct: parseInt(row.pct || row.percent || 0) || 0,
        rating: parseInt(row.rating || 0) || 0,
        tags: row.tags ? row.tags.split(';').map(t=>t.trim()).filter(Boolean) : [],
        review: row.review || row.notes || '',
        color: row.color || '',
      };
    }

    if (entry.title) results.push(entry);
  }
  return results;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += c; }
  }
  result.push(current);
  return result;
}

function showImportPreview(rows) {
  const preview = document.getElementById('import-preview');
  preview.innerHTML = `
    <div style="font-size:12px;color:var(--muted);font-family:var(--font-mono);margin-bottom:12px">
      found ${rows.length} entries to import
    </div>` +
    rows.slice(0, 20).map((e, i) => `
      <div class="import-item">
        <input type="checkbox" class="import-check" id="imp-${i}" checked />
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500">${escHtml(e.title)}</div>
          <div style="font-size:10px;color:var(--muted);font-family:var(--font-mono)">${(e.type||'').toUpperCase()} · ${e.status} · ${fmt(e.start)}</div>
        </div>
      </div>`).join('') +
    (rows.length > 20 ? `<div style="font-size:11px;color:var(--muted);padding:8px 0">...and ${rows.length - 20} more</div>` : '');

  document.getElementById('import-modal').classList.add('open');
}

function confirmImport() {
  const checkboxes = document.querySelectorAll('.import-check');
  const toImport = pendingImport.filter((_, i) => i >= checkboxes.length || checkboxes[i]?.checked);
  toImport.forEach(entry => {
    entry.id = nextId++;
    entries.push(entry);
  });
  saveEntries(entries);
  closeImport();
  renderAll();
  pendingImport = [];
}

function closeImport() {
  document.getElementById('import-modal').classList.remove('open');
}

function downloadCSV() {
  const headers = ['id','title','type','status','creator','start','end','progress','pct','rating','tags','review','color'];
  const rows = entries.map(e => headers.map(h => {
    let v = h === 'tags' ? (e.tags || []).join(';') : (e[h] ?? '');
    v = String(v).replace(/"/g,'""');
    return `"${v}"`;
  }).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'medialog-export.csv'; a.click();
  URL.revokeObjectURL(url);
}
