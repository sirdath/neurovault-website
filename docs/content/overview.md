# Introduction

NeuroVault is a local-first memory system for AI agents. Its canonical memories are plain Markdown files on your machine; SQLite, sqlite-vec, BM25, embeddings and the knowledge graph are rebuildable local indexes.

There are now two clearly separated products:

- **[NeuroVault Core](https://github.com/sirdath/neurovault-core)** is available now. It is the free, MIT-licensed engine for developers and self-hosters. It includes the local memory service, native MCP server, Claude Code hooks, authenticated HTTP gateway, journaling and consolidation APIs.
- **NeuroVault Desktop** is the consumer Mac application. It adds the visual Memories, Graph and Review experiences, themes, guided setup, service lifecycle management and official support. It is coming to the Mac App Store and is not currently available for public purchase or download.

Core is not a trial and does not require Desktop.

> [!TIP]
> Ready to run Core? The [Quickstart](#quickstart) builds it from the public source repository.

## Three integration paths

These paths are related, but they are not the same thing:

1. **Automatic context for Claude Code.** Optional local hooks retrieve and inject relevant context before Claude handles a prompt. The model does not have to decide to call a memory tool.
2. **MCP tools for compatible clients.** Claude Code, Claude Desktop, Cursor, Codex and other MCP clients can explicitly call `recall`, `remember` and the rest of the selected tool tier.
3. **HTTP for custom software.** Local programs can use the unauthenticated loopback API. Authenticated integrations can use the separate opt-in gateway.

Installing the MCP server alone does not make every MCP client inject context automatically. Automatic injection currently depends on a compatible host hook, such as the Claude Code hook supplied by Core.

## Core concepts

- **Engram:** one memory backed by Markdown and indexed locally.
- **Brain:** an isolated vault and database, useful for keeping work, personal and client contexts separate.
- **Recall:** hybrid retrieval across semantic vectors, BM25 and graph relationships, fused and optionally reranked.
- **Remember:** the write path that stores Markdown and updates the local indexes.
- **Experience journal:** append-only events that preserve what happened, when it happened and what evidence later consolidation used.
- **MCP:** the [Model Context Protocol](https://modelcontextprotocol.io), used by compatible agents to call Core's tools.

## How Core fits together

```text
Claude Code hooks ────────────────┐
MCP client → stdio MCP bridge ────┼──▶ Core loopback service ──▶ local brains
local program → HTTP /api/* ──────┘       127.0.0.1:8765          Markdown + SQLite

authenticated integration ───────────▶ optional /v1/* gateway
```

`neurovault-server` owns the local memory engine and loopback service. In `--mcp-only` mode, the same binary runs as a native stdio MCP bridge and can start the headless backend when needed.

## What's on disk

By default Core uses `~/.neurovault`:

```text
~/.neurovault/
├── brains.json
├── brains/<brain-id>/
│   ├── vault/       # canonical Markdown
│   ├── brain.db     # rebuildable index
│   ├── journal/     # append-only experience events
│   └── audit.jsonl  # local tool audit
└── .fastembed_cache/
```

Set `NEUROVAULT_HOME` to use a different root. The embedding and reranker models are downloaded on first semantic use. Core sends no telemetry.

## License and status

NeuroVault Core is open source under the [MIT License](https://github.com/sirdath/neurovault-core/blob/main/LICENSE). The NeuroVault name and official visual identity remain trademarks and are not granted by the MIT license.

The old public desktop releases are no longer the supported public distribution channel. Use Core from its public repository today; watch this site for the Mac App Store release of Desktop.
