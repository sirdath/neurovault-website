# API gateway boundary

The authenticated gateway is implemented in NeuroVault Core. Its purpose is to let custom agents and self-hosted workflows use the memory engine without weakening the local desktop and MCP trust boundary.

Canonical implementation: [`src/memory/api_gateway.rs`](https://github.com/sirdath/neurovault-core/blob/main/src/memory/api_gateway.rs).

## The invariant

The unauthenticated service stays on `127.0.0.1`. The authenticated gateway is a separate, opt-in listener.

```text
local UI / MCP bridge / local script
                 │
                 ▼
       127.0.0.1:8765 /api/*
       loopback only, no bearer key

authenticated integration
                 │
                 ▼
       configurable :8767 /v1/*
       bearer key → scope → brain allowlist → audit
```

The two listeners can share engine handlers without sharing their security policy. A gateway change must not make the loopback listener remotely reachable or add a public unauthenticated route.

## What the gateway guarantees

- External routes use the versioned `/v1/*` namespace.
- Every request requires a valid bearer key.
- Keys have read, write or admin scope.
- A key can be limited to named brains.
- Plaintext key material is shown only at creation; the stored form is hashed.
- Requests produce a local audit trail.
- The gateway is off unless explicitly configured or started.

## What it does not guarantee

- **Native HTTPS:** terminate TLS with Caddy, nginx or another trusted proxy, or keep traffic inside a VPN.
- **Multi-tenant SaaS isolation:** Core is self-hosted and its brain model is not a hosted tenancy boundary.
- **Automatic AI context:** HTTP is a transport. Automatic Claude Code context comes from the separate local hook path.
- **Every internal endpoint:** the external route set is deliberately narrower than `/api/*`.

## Headless setup

```bash
git clone https://github.com/sirdath/neurovault-core.git
cd neurovault-core
cargo build --release --bin neurovault-api
./target/release/neurovault-api --mint-key "automation"
./target/release/neurovault-api --bind 127.0.0.1 --port 8767
```

Use `--help` for the options supported by the exact Core version you built. Start on loopback; only choose a LAN bind after putting an authenticated TLS or VPN boundary in place.

## Desktop relationship

NeuroVault Desktop will provide a guided consumer interface around the same local engine, but the public Core does not depend on that app. Until Desktop ships on the Mac App Store, public instructions should use the Core CLI and source repository, not screenshots of private in-app settings or old release installers.
