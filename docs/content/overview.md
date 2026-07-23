# Introduction

NeuroVault is a free, open-source, local-first memory system for AI agents. It
gives the agents you choose a durable brain across sessions, without putting a
NeuroVault account or hosted database between you and your knowledge.

There is one NeuroVault product and one canonical repository:
[github.com/sirdath/NeuroVault](https://github.com/sirdath/NeuroVault).
Choose the surface that fits how you work:

- **Desktop app:** the complete visual experience for Memories, Graph, Review,
  themes, setup and service management. Download the current build from
  [GitHub Releases](https://github.com/sirdath/NeuroVault/releases/latest).
- **Headless:** build the same Rust engine from source and connect it to an MCP
  client or your own HTTP integration. No desktop interface is required.

Both use the same data under `~/.neurovault/`. You do not need to install both,
and switching later does not require a vault migration.

> [!TIP]
> Ready to install it? The [Quickstart](#quickstart) covers both the Mac app and
> a headless source build.

## Current platforms

| Surface | Current support |
|---|---|
| macOS desktop and headless | Apple Silicon, macOS 14 or newer |
| Linux desktop and headless | x64, glibc 2.35 or newer; Ubuntu 22.04 tested |
| Windows desktop and headless | x64 preview; desktop installer is not Authenticode-signed |

Intel Macs, ARM or musl Linux, iOS and Android are not current release targets.

## Three integration paths

These paths are related, but they are not the same thing:

1. **Automatic context for Claude Code.** Optional local hooks retrieve and
   inject relevant context before Claude handles a prompt. The model does not
   have to decide to call a memory tool.
2. **MCP tools for compatible clients.** Claude Code, Claude Desktop, Cursor,
   Codex and other MCP clients can call `recall`, `remember` and the rest of the
   selected tool tier.
3. **HTTP for custom software.** Local programs can use the unauthenticated
   loopback API. Authenticated integrations can use the separate opt-in
   gateway.

Installing the MCP server alone does not make every MCP client inject context
automatically. Automatic injection currently depends on the supplied Claude
Code hooks. Other clients receive callable memory tools unless they implement
their own automatic policy.

## Core concepts

- **Engram:** one durable memory whose content is backed by Markdown and
  indexed locally.
- **Brain:** an isolated vault and database, useful for keeping work, personal
  and client contexts separate.
- **Recall:** hybrid retrieval across semantic vectors, BM25 and graph
  relationships, fused and optionally reranked.
- **Remember:** the write path that stores Markdown and updates local indexes.
- **Experience journal:** append-only events that preserve what happened, when
  it happened and what evidence later consolidation used.
- **MCP:** the [Model Context Protocol](https://modelcontextprotocol.io), used
  by compatible agents to call NeuroVault tools.

## How it fits together

```text
Claude Code hooks --------------------------------┐
MCP client -> stdio MCP bridge -------------------+--> loopback service --> local brains
local program -> HTTP /api/* ---------------------┘    127.0.0.1:8765      Markdown + SQLite

authenticated integration ----------------------------> optional /v1/* gateway
```

`neurovault-server` owns the local memory engine and loopback service. In
`--mcp-only` mode, the same binary runs as a native stdio MCP bridge and can
start the headless backend when needed.

## What is stored where

By default NeuroVault uses `~/.neurovault`:

```text
~/.neurovault/
├── brains.json
├── brains/<brain-id>/
│   ├── vault/       # note and engram content in Markdown
│   ├── brain.db     # search indexes and structured application state
│   ├── journal/     # append-only experience events
│   └── audit.jsonl  # local tool audit
└── .fastembed_cache/
```

Markdown owns note and engram content. SQLite contains rebuildable search
indexes and structured state that is not represented in Markdown, including
drafts, core-memory blocks, version history and consolidation proposals. A
complete backup therefore requires a stopped NeuroVault process and the whole
data directory, not only the Markdown folder.

Set `NEUROVAULT_HOME` to use a different root. The embedding and reranker models
are downloaded on first use. NeuroVault has no telemetry and does not upload an
entire vault. It does return selected context to the MCP or HTTP clients you
authorize; a cloud-backed AI client may send that context to its configured
provider under that provider's terms.

## License and status

NeuroVault is open source under the
[MIT License](https://github.com/sirdath/NeuroVault/blob/main/LICENSE). The
NeuroVault name and official visual identity remain trademarks and are not
granted by the MIT license.

The desktop app and headless engine are developed together in the main
repository. The planned `@neurovault/mcp` package is not published yet, so use
the desktop app's bundled server or build headless from source today.
