# medialog 🎬📖🎮

> your personal media universe — track everything you watch, read, play, and listen to.

**Live demo:** deploy to GitHub Pages (instructions below)

---

## features

- **Now Active widgets** — Discord-style live cards for everything you're currently in
- **Full log** — every piece of media you've ever engaged with, filterable and sortable
- **Timeline view** — a visual strip showing when you started and finished everything, across years
- **Search** — ⌘K / Ctrl+K to search across titles, creators, tags, and reviews
- **Tags & moods** — tag entries with vibes like `devastating`, `cozy`, `OST is 🔥`, `masterpiece`
- **Reviews & ratings** — 5-star ratings + freeform review notes per entry
- **Progress tracking** — free-text progress label + visual progress bar
- **Import from Letterboxd / MAL / CSV** — paste any CSV and it auto-detects the format
- **Export to CSV** — download your full log anytime
- **Stats** — total logged, finished, active, media types, total days spent
- **Persistent storage** — saves to `localStorage`, stays across sessions

## media types supported

🎮 Games · ✨ Anime · 📺 TV Shows · 🎬 Films · 📖 Books · 🖤 Manga · 💿 Albums

---

## deploy to GitHub Pages

1. Fork or clone this repo
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Save — your site will be live at `https://yourusername.github.io/medialog`

That's it. No build step, no dependencies, pure HTML/CSS/JS.

---

## importing data

### from Letterboxd
1. Go to letterboxd.com → Settings → Import & Export → Export your data
2. Unzip and use `watched.csv`
3. In medialog: Log view → **import CSV / Letterboxd / MAL**

### from MyAnimeList (MAL)
1. Go to myanimelist.net → Profile → Export anime list (XML/CSV)
2. Use the CSV file
3. Same import button in medialog

### generic CSV format
Any CSV with these column names works:

```
title, type, status, creator, start, end, progress, pct, rating, tags, review, color
```

- `type`: game / anime / show / film / book / manga / album
- `status`: active / done / planned / dropped
- `tags`: semicolon-separated (e.g. `cozy;devastating;masterpiece`)
- `pct`: 0–100
- `rating`: 0–5

---

## local development

Just open `index.html` in your browser. No server required.

```bash
# or use any local server, e.g.
npx serve .
python3 -m http.server 8080
```

---

## tech stack

- Vanilla HTML, CSS, JavaScript — zero dependencies
- Google Fonts (DM Serif Display, DM Mono, Outfit)
- `localStorage` for persistence
- GitHub Pages for hosting

---

made with ♥ for the people who've seen too many things to remember
