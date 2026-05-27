# NeuroVault website

The marketing landing page **and** documentation site for
[NeuroVault](https://github.com/sirdath/NeuroVault) — a local-first AI
memory layer. Static, no build step, deployed to GitHub Pages.

This repo is *just the site*; the app lives in the main
[NeuroVault](https://github.com/sirdath/NeuroVault) repo.

## Local preview

```bash
python -m http.server 8080
# landing page → http://localhost:8080/
# docs         → http://localhost:8080/docs/
```

(Serve over HTTP, not `file://` — the docs loader `fetch()`es the
markdown content.)

## Structure

- `index.html` — landing page (hero, features, screenshots, how-it-works, privacy, CTA, footer)
- `styles.css` — palette, typography, aurora hero, glass cards, reveal animations
- `script.js` — OS-aware download button, scroll reveal, progress bar
- `fx/` — the canvas "living brain" hero animation + glow/aurora effects
- `docs/` — the documentation site
  - `docs/index.html` + `docs.js` + `docs.css` — the 3-column docs shell (sidebar, content, on-page TOC, Cmd/Ctrl+K search, callouts, prev/next)
  - `docs/content/*.md` — every docs page as plain markdown
  - `docs/lib/` — vendored `marked` + `highlight.js` (no CDN at runtime)
- `assets/` — logo, favicon, screenshots

Adding a docs page = one entry in the `PAGES` array in `docs/docs.js`
plus a `docs/content/<slug>.md` file.

## Deploy

GitHub Actions (`.github/workflows/pages.yml`) deploys the whole repo to
Pages on every push to `main`. In the repo's **Settings → Pages**, set
the source to **GitHub Actions**.

### Custom domain — `neurovault.dathproject.com`

The `CNAME` file pins the site to **https://neurovault.dathproject.com**.
To make it resolve, add this DNS record at your `dathproject.com` provider:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `neurovault` | `sirdath.github.io` |

Then in **Settings → Pages**, set the custom domain to
`neurovault.dathproject.com` and tick **Enforce HTTPS** once the
certificate provisions (a few minutes). Until DNS is live, the site is
also reachable at `https://sirdath.github.io/<repo-name>/`.

## Download link

The primary CTA points at
`https://github.com/sirdath/NeuroVault/releases/latest` — GitHub resolves
that to the newest release, so the button keeps working across versions.
The OS-aware relabelling logic lives in `script.js`.
