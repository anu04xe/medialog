/* js/data.js — storage, defaults, constants */

const TYPE_META = {
  game:  { icon:'🎮', label:'GAME',   accent:'#b39dfa', glow:'#b39dfa', badge:'rgba(179,157,250,0.15)', badgeColor:'#b39dfa', tlColor:'#7c5cbf' },
  anime: { icon:'✨', label:'ANIME',  accent:'#f7a8c0', glow:'#f7a8c0', badge:'rgba(247,168,192,0.15)', badgeColor:'#f7a8c0', tlColor:'#bf5c84' },
  show:  { icon:'📺', label:'TV',     accent:'#7ee8c0', glow:'#7ee8c0', badge:'rgba(126,232,192,0.15)', badgeColor:'#7ee8c0', tlColor:'#3a9e7e' },
  film:  { icon:'🎬', label:'FILM',   accent:'#f9c97a', glow:'#f9c97a', badge:'rgba(249,201,122,0.15)', badgeColor:'#f9c97a', tlColor:'#b08030' },
  book:  { icon:'📖', label:'BOOK',   accent:'#85b7eb', glow:'#85b7eb', badge:'rgba(133,183,235,0.15)', badgeColor:'#85b7eb', tlColor:'#3a6faa' },
  manga: { icon:'🖤', label:'MANGA',  accent:'#e8a0f0', glow:'#e8a0f0', badge:'rgba(232,160,240,0.15)', badgeColor:'#e8a0f0', tlColor:'#8a4aa0' },
  album: { icon:'💿', label:'ALBUM',  accent:'#7ee8c0', glow:'#7ee8c0', badge:'rgba(126,232,192,0.15)', badgeColor:'#7ee8c0', tlColor:'#2e8f6e' },
};

const ACCENT_COLORS = [
  '#b39dfa','#7ee8c0','#f7a8c0','#f9c97a','#85b7eb',
  '#e8a0f0','#f97b6b','#a8e063','#67d5e8','#ffb347'
];

const TAG_PRESETS = [
  'cozy','devastating','slow-burn','fast-paced','reread-worthy',
  'masterpiece','comfort','dark','funny','emotional','OST is 🔥',
  '10/10 writing','beautiful art','disappointing end','recommend to all',
  'binge-worthy','underrated','overrated','nostalgia','challenging',
  'horror','romance','mystery','sci-fi','fantasy','slice-of-life'
];

const STORAGE_KEY = 'medialog_v2';

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultEntries();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.entries) ? parsed.entries : getDefaultEntries();
  } catch(e) {
    return getDefaultEntries();
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, version: 2 }));
  } catch(e) { console.warn('storage full or disabled'); }
}

function getDefaultEntries() {
  return [
    {
      id: 1, title: 'Disco Elysium', type: 'game', status: 'done',
      creator: 'ZA/UM', start: '2025-03-01', end: '2025-03-30',
      progress: 'Completed (replay)', pct: 100, rating: 5, color: '#b39dfa',
      tags: ['masterpiece','10/10 writing','devastating','challenging'],
      review: 'One of the most profound RPGs ever made. The writing is extraordinary — Harry Du Bois might be my favourite character in any game. Replayed it just to re-experience the dialogue and catch what I missed first time.',
    },
    {
      id: 2, title: 'Skins', type: 'show', status: 'active',
      creator: 'E4', start: '2025-04-01', end: '',
      progress: 'Season 2 / 7', pct: 28, rating: 0, color: '#7ee8c0',
      tags: ['nostalgia','emotional','binge-worthy'],
      review: '',
    },
    {
      id: 3, title: 'My Broken Mariko', type: 'manga', status: 'active',
      creator: 'Waka Hirako', start: '2025-04-02', end: '',
      progress: 'Chapter 3 / 4', pct: 75, rating: 0, color: '#e8a0f0',
      tags: ['devastating','emotional','beautiful art'],
      review: '',
    },
    {
      id: 4, title: 'Serial Experiments Lain', type: 'anime', status: 'done',
      creator: 'Triangle Staff', start: '2024-11-10', end: '2024-11-18',
      progress: 'Complete — 13 eps', pct: 100, rating: 5, color: '#f7a8c0',
      tags: ['dark','challenging','underrated','sci-fi'],
      review: 'Dense, dreamlike, genuinely unsettling. The kind of thing that rewires you a little.',
    },
    {
      id: 5, title: 'Nier: Automata', type: 'game', status: 'done',
      creator: 'PlatinumGames', start: '2024-09-05', end: '2024-10-02',
      progress: 'All endings', pct: 100, rating: 5, color: '#b39dfa',
      tags: ['masterpiece','devastating','10/10 writing','beautiful art','OST is 🔥'],
      review: 'The OST alone would make this worth playing. The story is genuinely philosophical and hits hard.',
    },
    {
      id: 6, title: 'Vinland Saga', type: 'anime', status: 'done',
      creator: 'MAPPA / WIT', start: '2024-07-01', end: '2024-08-15',
      progress: 'Season 1 + 2', pct: 100, rating: 4, color: '#f7a8c0',
      tags: ['slow-burn','recommend to all','emotional','challenging'],
      review: 'Season 2 is quietly one of the best things in anime. The payoff is extraordinary.',
    },
    {
      id: 7, title: 'Beethoven: Moonlight Sonata', type: 'album', status: 'done',
      creator: 'Beethoven', start: '2024-06-01', end: '2024-06-01',
      progress: 'Full listen', pct: 100, rating: 4, color: '#7ee8c0',
      tags: ['cozy','emotional','comfort'],
      review: '',
    },
  ];
}
