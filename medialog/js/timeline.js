/* js/timeline.js — timeline view rendering */

function renderTimeline(entries, typeFilter) {
  let list = [...entries];
  if (typeFilter && typeFilter !== 'all') list = list.filter(e => e.type === typeFilter);
  list = list.filter(e => e.start);
  list.sort((a, b) => a.start.localeCompare(b.start));

  const wrap = document.getElementById('timeline-wrap');
  if (!list.length) {
    wrap.innerHTML = '<div class="empty"><div class="big">no entries with dates yet</div></div>';
    return;
  }

  // date range
  const today = new Date();
  today.setHours(0,0,0,0);
  const allDates = list.flatMap(e => [new Date(e.start), e.end ? new Date(e.end) : today]);
  let minDate = new Date(Math.min(...allDates));
  let maxDate = new Date(Math.max(...allDates));
  // pad
  minDate.setDate(1);
  maxDate.setMonth(maxDate.getMonth() + 1, 1);
  const totalMs = maxDate - minDate;

  function pct(d) { return ((new Date(d) - minDate) / totalMs) * 100; }

  // group by year
  const byYear = {};
  list.forEach(e => {
    const yr = e.start.slice(0, 4);
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(e);
  });

  // build month headers
  function buildMonthHeaders(yearStart, yearEnd) {
    const months = [];
    const d = new Date(yearStart);
    d.setDate(1);
    const endDate = new Date(yearEnd);
    while (d <= endDate) {
      months.push({ label: d.toLocaleString('default',{month:'short'}), pct: pct(d.toISOString().slice(0,10)) });
      d.setMonth(d.getMonth() + 1);
    }
    return months;
  }

  // legend
  const usedTypes = [...new Set(list.map(e=>e.type))];
  document.getElementById('timeline-legend').innerHTML = usedTypes.map(t => {
    const m = TYPE_META[t];
    return `<div class="legend-item"><div class="legend-dot" style="background:${m.tlColor}"></div><span>${m.icon} ${m.label}</span></div>`;
  }).join('');

  // today marker pct
  const todayPct = Math.max(0, Math.min(100, pct(today.toISOString().slice(0,10))));

  let html = '';

  Object.keys(byYear).sort().forEach(yr => {
    html += `<div class="tl-year-header">${yr}</div>`;

    // months for this year
    const yrStart = new Date(yr, 0, 1);
    const yrEnd = new Date(parseInt(yr)+1, 0, 1);
    const yrStartClamped = minDate > yrStart ? minDate : yrStart;
    const yrEndClamped = maxDate < yrEnd ? maxDate : yrEnd;
    const months = buildMonthHeaders(yrStartClamped, yrEndClamped);

    // month labels row
    html += `<div style="display:flex;padding-left:130px;position:relative;margin-bottom:4px">`;
    months.forEach(m => {
      const left = ((new Date(yrStartClamped) - minDate) / totalMs * 100);
      const mPct = m.pct;
      html += `<div style="position:absolute;left:${mPct}%;transform:translateX(-50%);font-size:9px;font-family:var(--font-mono);color:var(--muted);letter-spacing:0.05em">${m.label}</div>`;
    });
    html += `</div>`;

    // rows
    byYear[yr].forEach(e => {
      const m = TYPE_META[e.type] || TYPE_META.game;
      const accent = e.color || m.tlColor;
      const startPct = pct(e.start);
      const endPct = e.end ? pct(e.end) : todayPct;
      const widthPct = Math.max(0.5, endPct - startPct);
      const ongoing = !e.end && e.status === 'active';

      html += `
        <div class="timeline-row">
          <div class="timeline-row-label" title="${escHtml(e.title)}">${m.icon} ${escHtml(e.title)}</div>
          <div class="timeline-track" style="position:relative">
            <div class="timeline-bar${ongoing?' ongoing':''}"
              style="left:${startPct}%;width:${widthPct}%;background:${accent};color:rgba(255,255,255,0.85)"
              onclick="openReview(${e.id})"
              title="${escHtml(e.title)} · ${fmt(e.start)} → ${e.end ? fmt(e.end) : 'ongoing'}">
              ${widthPct > 5 ? escHtml(e.title) : ''}
            </div>
            ${todayPct >= 0 && todayPct <= 100 ? `
              <div class="timeline-today" style="left:${todayPct}%">
                <div class="timeline-today-label">today</div>
              </div>` : ''}
          </div>
        </div>`;
    });
  });

  wrap.innerHTML = html;
}
