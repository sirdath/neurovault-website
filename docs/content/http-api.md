# HTTP API

NeuroVault exposes two different HTTP surfaces. Treat them as separate trust
boundaries.

## Local loopback API

`neurovault-server` binds to `127.0.0.1:8765` by default and exposes `/api/*`.
This surface has no bearer authentication and is intended only for local
processes such as the app and MCP bridge.

```bash
./src-tauri/target/release/neurovault-server
curl http://127.0.0.1:8765/api/health
curl http://127.0.0.1:8765/api/brains
```

Use `--port <number>` to change the loopback port.

> [!CAUTION]
> Never proxy or port-forward the unauthenticated loopback API. It is safe only
> while it remains bound to loopback.

## Authenticated gateway

`neurovault-api` and the server's optional gateway expose `/v1/*` with:

- bearer API keys;
- read, write and admin scopes;
- optional per-key brain allowlists;
- request controls;
- an append-only local audit log.

Build the headless binaries from the main repository:

```bash
git clone https://github.com/sirdath/NeuroVault.git
cd NeuroVault
cargo build --manifest-path src-tauri/Cargo.toml --release \
  --no-default-features --bin neurovault-server --bin neurovault-api
```

This direct Cargo command does not stage the sqlite-vec native extension. For a
complete supported build, follow the platform steps in the
[headless build guide](https://github.com/sirdath/NeuroVault/blob/main/dist-npm/README.md#build-from-source).

Create an administrator key:

```bash
./src-tauri/target/release/neurovault-api --mint-key "local integration"
```

The plaintext key is displayed once. Save it in your client's secret store.

Start the dedicated gateway on loopback:

```bash
./src-tauri/target/release/neurovault-api --bind 127.0.0.1 --port 8767
```

Then call it with:

```bash
curl -H "Authorization: Bearer nvk_REPLACE_ME" \
  http://127.0.0.1:8767/v1/status
```

Run `./src-tauri/target/release/neurovault-api --help` for the current
command-line options.

## TLS

The gateway speaks HTTP, not native HTTPS. For LAN or remote access:

1. Bind it only to the intended private interface.
2. Put Caddy, nginx or another maintained TLS proxy in front of it.
3. Restrict the upstream so only that proxy can reach it.
4. Prefer a VPN and rotate keys after suspected exposure.

Never transmit a bearer key or memory data over an untrusted plaintext network.

## Endpoint discovery

The MCP registry at
[`src/memory/mcp/tools.json`](https://github.com/sirdath/NeuroVault/blob/main/src-tauri/src/memory/mcp/tools.json)
is the machine-readable map of supported agent operations to local `/api/*`
calls.

The authenticated gateway deliberately exposes a narrower `/v1/*` subset
according to the scope definitions in
[`src/memory/api_gateway.rs`](https://github.com/sirdath/NeuroVault/blob/main/src-tauri/src/memory/api_gateway.rs).
Consult the source for the exact routes in the version you deploy rather than
assuming every internal route is externally available.

## Data, providers and audit files

By default, gateway configuration, hashed keys, data and audit records live
under `~/.neurovault`. Set `NEUROVAULT_HOME` before starting NeuroVault to move
the whole data root.

Note and engram content is Markdown. SQLite stores search indexes and structured
state that is not represented in Markdown, including drafts, core-memory
blocks, history and proposals. Keys are stored hashed; plaintext is not
recoverable after it is first shown.

NeuroVault itself does not require a hosted provider for ingest or retrieval.
It returns selected context to clients you authorize. A connected cloud-backed
AI client may send that context to its configured provider under that
provider's privacy terms.

## Which interface should I use?

| Need | Interface |
|---|---|
| MCP client on the same machine | `neurovault-server --mcp-only` |
| Claude Code automatic context | `neurovault-server hook install` |
| Custom process on the same machine | loopback `/api/*` |
| Authenticated LAN, VPN or server integration | `/v1/*` gateway behind TLS |

The HTTP API is not required for MCP, and MCP is not what makes Claude Code
hook injection automatic.
