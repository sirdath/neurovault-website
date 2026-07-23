# Quickstart

NeuroVault is one free, open-source product with two install surfaces. Use the
desktop app for the complete visual experience, or build the same engine
headless for your own MCP and HTTP setup.

## Option 1: download the desktop app

The current supported Mac download requires **Apple Silicon and macOS 14 or
newer**.

1. Open the [latest NeuroVault release](https://github.com/sirdath/NeuroVault/releases/latest).
2. Download `NeuroVault_*_aarch64.dmg`.
3. Open the DMG, drag NeuroVault to Applications, then launch it from
   Applications.

Official Mac artifacts are Developer ID signed and notarized. When a release
includes `SHA256SUMS.txt`, compare the installer against that manifest before
opening it. Do not bypass a Gatekeeper warning; delete the installer and report
the release URL instead.

The release page can also contain Linux x64 packages and a Windows x64 preview.
Linux targets glibc 2.35 or newer, with Ubuntu 22.04 as the tested baseline.
Current Windows installers are not Authenticode-signed and may trigger
SmartScreen, so they are a preview rather than a fully verified consumer build.

## Option 2: build headless from source

The headless build runs the same local memory engine without the visual app.
It currently requires Node.js 22 or newer, the stable Rust toolchain and the
native prerequisites described in the
[main build guide](https://github.com/sirdath/NeuroVault#quick-start-developers).

```bash
git clone https://github.com/sirdath/NeuroVault.git
cd NeuroVault
node scripts/build-headless.mjs
```

The build writes `neurovault-server` (`neurovault-server.exe` on Windows) to
`src-tauri/target/release/` and stages it with the matching sqlite-vec extension
under `dist-npm/packages/<platform>/bin/`.

The repository contains the verified extension for macOS Apple Silicon and
Windows x64. Linux x64 builders must download and verify the pinned `vec0.so`
artifact first. Follow the exact checksums and commands in the
[headless build guide](https://github.com/sirdath/NeuroVault/blob/main/dist-npm/README.md#build-from-source),
then set `NEUROVAULT_VEC_EXTENSION` to the staged extension's absolute path.

> [!IMPORTANT]
> `@neurovault/mcp` has not had its first npm publication. An `npx` install will
> fail today. Use the server bundled with the desktop app or this source build
> until the package is actually published.

## Connect an MCP client

Point the client at the absolute path to your built binary.

Claude Code:

```bash
claude mcp add --scope user neurovault /absolute/path/to/NeuroVault/src-tauri/target/release/neurovault-server -- --mcp-only
```

Claude Desktop, Cursor and other JSON-configured clients:

```json
{
  "mcpServers": {
    "neurovault": {
      "command": "/absolute/path/to/NeuroVault/src-tauri/target/release/neurovault-server",
      "args": ["--mcp-only"],
      "env": {
        "NEUROVAULT_VEC_EXTENSION": "/absolute/path/to/staged/vec0.extension"
      }
    }
  }
}
```

Restart the client after changing its configuration. If `mcpServers` already
exists, merge the `neurovault` entry instead of replacing the block. Set
`NEUROVAULT_MCP_TIER` to `minimal`, `lite`, `standard` or `full` to control how
many tools the client receives. `lite` is the default.

MCP makes memory tools callable. It does **not** automatically inject context
in every MCP client.

## Optional: automatic context in Claude Code

The supplied Claude Code hooks can retrieve and inject relevant context before
Claude handles a prompt. This is currently the automatic path; it is distinct
from ordinary MCP tool access.

```bash
/absolute/path/to/neurovault-server hook install
/absolute/path/to/neurovault-server hook status
```

The installer backs up Claude Code settings, and the hooks fail open if
NeuroVault is unavailable. Remove them with:

```bash
/absolute/path/to/neurovault-server hook uninstall
```

## Use HTTP instead

For a local integration, use the loopback `/api/*` routes. For a
bearer-authenticated integration, build and configure `neurovault-api` as
described in the [HTTP API](#http-api) reference.

## Data and provider boundary

Note and engram content is stored as Markdown. SQLite also owns structured state
such as drafts, core memory, history and proposals. NeuroVault has no telemetry,
but selected memories returned to a cloud-backed AI client can be sent to that
client's configured provider under its own privacy terms.

## What to read next

- **[HTTP API](#http-api):** local and authenticated network boundaries.
- **[API gateway boundary](#api-gateway-design):** why the loopback API and
  external gateway remain separate.
- **[NeuroVault repository](https://github.com/sirdath/NeuroVault):** canonical
  source, install guide, privacy policy and contribution guide.
