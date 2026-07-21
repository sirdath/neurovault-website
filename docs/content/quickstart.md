# Quickstart

This guide builds the free, MIT-licensed NeuroVault Core from its public source. NeuroVault Desktop is coming to the Mac App Store; there is no current public Desktop installer.

## 1. Build Core

Requirements:

- Rust stable
- a compatible sqlite-vec loadable extension in `resources/`, or a path supplied through `NEUROVAULT_VEC_EXTENSION`

```bash
git clone https://github.com/sirdath/neurovault-core.git
cd neurovault-core
cargo build --release --bin neurovault-server --bin neurovault-api
```

Start the local service:

```bash
./target/release/neurovault-server
```

It binds to loopback only by default. In another terminal, check it:

```bash
curl http://127.0.0.1:8765/api/health
```

The first semantic recall downloads the on-device embedding and reranker models into `~/.neurovault/.fastembed_cache`. Core has no telemetry.

## 2. Choose how your agent gets memory

### Automatic context in Claude Code

Install Core's local hooks:

```bash
./target/release/neurovault-server hook install
./target/release/neurovault-server hook status
```

The hooks retrieve and inject relevant context before Claude handles a prompt, so this path does not depend on the model deciding to call a memory tool. The installer makes a backup before editing Claude Code settings, and every hook fails open if Core is unavailable.

To remove them:

```bash
./target/release/neurovault-server hook uninstall
```

### Callable memory through MCP

MCP is the explicit tool path. Build the server as above, then point your client at the absolute binary path.

Claude Code:

```bash
claude mcp add --scope user neurovault /absolute/path/to/neurovault-core/target/release/neurovault-server -- --mcp-only
```

Claude Desktop, Cursor and other JSON-configured MCP clients:

```json
{
  "mcpServers": {
    "neurovault": {
      "command": "/absolute/path/to/neurovault-core/target/release/neurovault-server",
      "args": ["--mcp-only"]
    }
  }
}
```

Restart the client after changing its configuration. If `mcpServers` already exists, merge the `neurovault` entry instead of replacing the block.

Set `NEUROVAULT_MCP_TIER` to `minimal`, `lite`, `standard` or `full` to control how many tools the client receives. `lite` is the default.

> [!IMPORTANT]
> MCP access and automatic hook injection solve different problems. MCP lets the agent call memory tools. Claude Code hooks can add relevant context automatically before the prompt is handled. You can enable either or both.

## 3. Use HTTP instead

For a local integration, leave `neurovault-server` running and use its loopback `/api/*` routes. For a bearer-authenticated integration, build and configure `neurovault-api` as described in the [HTTP API](#http-api) reference.

## Build confidence

Before relying on a source build, run the same checks used by Core development:

```bash
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
```

## What to read next

- **[HTTP API](#http-api):** local and authenticated network boundaries.
- **[API gateway boundary](#api-gateway-design):** why the loopback API and external gateway remain separate.
- **[Core repository](https://github.com/sirdath/neurovault-core):** canonical source, security policy and contribution guide.
