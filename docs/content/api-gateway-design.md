# API gateway boundary

The authenticated gateway lets custom agents and self-hosted workflows use the
NeuroVault memory engine without weakening the local desktop and MCP trust
boundary. It is part of the same free, open-source NeuroVault repository as the
desktop app and headless server.

Canonical implementation:
[`src/memory/api_gateway.rs`](https://github.com/sirdath/NeuroVault/blob/main/src-tauri/src/memory/api_gateway.rs).

## The invariant

The unauthenticated service stays on `127.0.0.1`. The authenticated gateway is
a separate, opt-in listener.

```text
local UI / MCP bridge / local script
                 |
                 v
       127.0.0.1:8765 /api/*
       loopback only, no bearer key

authenticated integration
                 |
                 v
       configurable :8767 /v1/*
       bearer key -> scope -> brain allowlist -> audit
```

The two listeners can share engine handlers without sharing their security
policy. A gateway change must not make the loopback listener remotely reachable
or add a public unauthenticated route.

## What the gateway guarantees

- External routes use the versioned `/v1/*` namespace.
- Every request requires a valid bearer key.
- Keys have read, write or admin scope.
- A key can be limited to named brains.
- Plaintext key material is shown only at creation; the stored form is hashed.
- Requests produce a local audit trail.
- The gateway is off unless explicitly configured or started.

## What it does not guarantee

- **Native HTTPS:** terminate TLS with Caddy, nginx or another trusted proxy,
  or keep traffic inside a VPN.
- **Multi-tenant SaaS isolation:** NeuroVault is self-hosted and its brain model
  is not a hosted tenancy boundary.
- **Automatic AI context:** HTTP is a transport. Automatic Claude Code context
  comes from the separate local hook path.
- **Every internal endpoint:** the external route set is deliberately narrower
  than `/api/*`.
- **Provider-side privacy:** selected context returned to a cloud-backed client
  may be sent to that client's configured provider under its own terms.

## Headless setup

```bash
git clone https://github.com/sirdath/NeuroVault.git
cd NeuroVault
node scripts/build-headless.mjs
cargo build --manifest-path src-tauri/Cargo.toml --release \
  --no-default-features --bin neurovault-api
./src-tauri/target/release/neurovault-api --mint-key "automation"
./src-tauri/target/release/neurovault-api --bind 127.0.0.1 --port 8767
```

The build also needs the matching, verified sqlite-vec extension. Linux x64
builders must fetch the pinned archive first. Follow the exact platform steps
in the
[headless build guide](https://github.com/sirdath/NeuroVault/blob/main/dist-npm/README.md#build-from-source).

Use `--help` for the options supported by the exact version you built. Start on
loopback; only choose a LAN bind after putting an authenticated TLS or VPN
boundary in place.

## Desktop and headless relationship

The desktop app wraps the same local engine with Memories, Graph, Review,
themes and guided service management. The headless build exposes the engine for
custom integrations without a visual interface. They share the same data under
`~/.neurovault/`, and both are maintained in
[`sirdath/NeuroVault`](https://github.com/sirdath/NeuroVault).

The planned `@neurovault/mcp` package has not been published yet. Until its
first verified release, use the MCP server bundled with the desktop app or
build the headless target from source.
