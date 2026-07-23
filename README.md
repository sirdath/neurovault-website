# NeuroVault website

The public landing page and concise documentation site for
[NeuroVault](https://github.com/sirdath/NeuroVault), the free, open-source,
local-first memory system for AI agents.

NeuroVault is one product, maintained in one repository, with two ways to use
the same memory engine:

- **Desktop app:** download the current app from
  [GitHub Releases](https://github.com/sirdath/NeuroVault/releases/latest).
  The supported Mac build requires Apple Silicon and macOS 14 or newer.
- **Headless:** build the MCP and HTTP service from the same source repository.
  The planned `@neurovault/mcp` package has not had its first npm publication,
  so the website must not present an `npx` command as available yet.

This repository contains only the static website. There is no application
binary or package registry release here.

## Local preview

```bash
python -m http.server 8080
# landing page -> http://localhost:8080/
# docs         -> http://localhost:8080/docs/
```

Serve over HTTP, not `file://`, because the docs loader fetches Markdown
content.

## Public structure

- `index.html`: landing page
- `script.js`: shared navigation, product tabs and copy behaviour
- `styles.css`: landing-page styles
- `assets/`: public visual assets
- `docs/index.html`, `docs/docs.js`, `docs/docs.css`: documentation shell
- `docs/content/overview.md`: product, install surfaces and trust boundaries
- `docs/content/quickstart.md`: desktop download and headless source build
- `docs/content/http-api.md`: loopback and authenticated gateway boundary
- `docs/content/api-gateway-design.md`: concise gateway architecture note

Prototype and legacy files may remain in the repository for design history,
but the Pages workflow deploys an explicit allowlist. They are not part of the
public artifact.

## Deploy

GitHub Actions (`.github/workflows/pages.yml`) builds an allowlisted `_site`
directory and deploys that artifact on pushes to `main`.

In **Settings -> Pages**, use **GitHub Actions** as the source.

### Custom domain

The `CNAME` file pins the site to `https://neurovault.dathproject.com`.
Configure this DNS record at the domain provider:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `neurovault` | `sirdath.github.io` |

Then enable **Enforce HTTPS** in the repository's Pages settings after the
certificate is ready.

## Accuracy rule

Public install instructions must match the current
[NeuroVault README](https://github.com/sirdath/NeuroVault/blob/main/README.md).
Do not restore the retired split-repository links, describe the current desktop
app as unavailable, invent a published npm package, or imply that MCP tool
access automatically injects context in every client.
