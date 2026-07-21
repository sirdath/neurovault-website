# NeuroVault website

The public landing page and concise documentation site for NeuroVault.

The product is intentionally split:

- [NeuroVault Core](https://github.com/sirdath/neurovault-core) is the free, MIT-licensed local memory engine available now.
- NeuroVault Desktop is the consumer Mac application and is coming to the Mac App Store. It is not currently offered as a public installer.

This repository contains only the static website. There is no application binary or package registry release here.

## Local preview

```bash
python -m http.server 8080
# landing page → http://localhost:8080/
# docs         → http://localhost:8080/docs/
```

Serve over HTTP, not `file://`, because the docs loader fetches Markdown content.

## Public structure

- `index.html`: landing page
- `script.js`: shared theme, reveal and terminal behaviour
- `styles.css`: shared docs styling
- `assets/`: public visual assets
- `fx/nv-brain-points.js`: landing-page mark data
- `docs/index.html`, `docs/docs.js`, `docs/docs.css`: documentation shell
- `docs/content/overview.md`: Core/Desktop product boundary
- `docs/content/quickstart.md`: public Core source build
- `docs/content/http-api.md`: loopback and authenticated gateway boundary
- `docs/content/api-gateway-design.md`: concise gateway architecture note

Prototype and legacy files may remain in the repository for design history, but the Pages workflow deploys an explicit allowlist. They are not part of the public artifact.

## Deploy

GitHub Actions (`.github/workflows/pages.yml`) builds an allowlisted `_site` directory and deploys that artifact on pushes to `main`.

In **Settings → Pages**, use **GitHub Actions** as the source.

### Custom domain

The `CNAME` file pins the site to `https://neurovault.dathproject.com`. Configure this DNS record at the domain provider:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `neurovault` | `sirdath.github.io` |

Then enable **Enforce HTTPS** in the repository's Pages settings after the certificate is ready.

## Accuracy rule

Public install instructions must come from the current [Core README](https://github.com/sirdath/neurovault-core/blob/main/README.md). Do not restore links to the old private Desktop releases, invent npm install commands, or imply that MCP tool access automatically injects context in every client.
