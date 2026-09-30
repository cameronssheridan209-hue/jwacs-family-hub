# JWACS Family Hub

Static family dashboard for Cameron Sheridan's household (Owen, Yasmin, Cameron, Sonjia).

## Live URLs

**GitHub Pages** (after deploy — update once live):

- Base: `https://<USER>.github.io/jwacs-family-hub/`
- Index: `https://<USER>.github.io/jwacs-family-hub/index.html`
- Owen: `https://<USER>.github.io/jwacs-family-hub/owen.html`
- Yasmin: `https://<USER>.github.io/jwacs-family-hub/yasmin.html`
- Cameron: `https://<USER>.github.io/jwacs-family-hub/cameron.html`
- Sonjia: `https://<USER>.github.io/jwacs-family-hub/sonjia.html`

**Ephemeral Cloudflare tunnel** (local `server.py` + quick tunnel; URL rotates on restart):

- See `PUBLIC_URL.txt` on the box, or restart with `./start-public.sh`.

## Static files (GitHub Pages)

Served from repo root on `main`:

- `index.html`, `owen.html`, `yasmin.html`, `cameron.html`, `sonjia.html`
- `data.js`, `app.js`, `styles.css`

## Activity sync (`/api/activity`)

GitHub Pages is **static only** — it does **not** run `server.py`.

- On Pages, `/api/activity` returns 404. The frontend already degrades: fetch/post failures set **Sync offline** and keep an in-memory activity state (no cross-device sync).
- For live shared activity, run `python3 server.py` locally (or another host) and expose it (e.g. Cloudflare tunnel via `./start-public.sh`).

`activity.json` is gitignored (local runtime state).

## Local run

```bash
cd /workspace/family-hub
python3 server.py   # 127.0.0.1:8765 with /api/activity
# optional public tunnel:
./start-public.sh
```
