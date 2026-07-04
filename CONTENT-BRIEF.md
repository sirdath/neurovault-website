# NeuroVault — Landing Page Content Brief

> Source of truth for the landing page (and any redesign). Everything we say
> about NeuroVault, consolidated. Receipt-honest: don't publish a number or
> claim we haven't verified.

## One-liner
**Claude forgets you after every conversation. NeuroVault doesn't.**

## Hero
- Headline: *Give your AI a memory that survives the window close.*
- Sub: Say it once — any MCP agent (Claude Code, Claude Desktop, Cursor, Codex) recalls it the moment it's relevant. 100% on your machine.
- Primary CTA: Download for Mac (Apple Silicon, DMG) · Download for Windows · Star on GitHub
- Badges: Free · MIT-licensed · local-first

## The problem (what it replaces)
- Cram everything into a 22k-token CLAUDE.md that bloats every prompt — and still goes stale.
- Past chats vanish the moment you close the window. The agent starts from zero every time.
- Your "memory" lives in one vendor's cloud, in a format you can't read or move.

## The pillars (value props)
1. **Local-first, actually.** No cloud, no account, no telemetry, no API keys. Plain markdown files on your disk. Backend binds to `127.0.0.1:8765` (loopback only); refuses outside connections. Only outbound call by default: downloading the embedding model on first run.
2. **Zero-LLM, on-device ingest.** Embeddings only (BGE-small ONNX) — no LLM ever reads or summarizes your data at write time. Privacy is *structural*. (Contrast: competitors run a cloud LLM over everything you say; we never do.)
3. **Markdown is canonical.** Your vault is a folder of `.md` files (10,000 notes ≈ 130 MB); the database is a rebuildable index. Own it, sync it, move it, delete it. Obsidian-compatible.
4. **Hybrid retrieval that's benchmarked in the open.** Semantic (sqlite-vec) + BM25 + knowledge-graph, fused via RRF. Recall returns the handful of passages that matter — not the whole file.
5. **Graphify — code-aware memory.** Point it at your repo: tree-sitter parses it on-device into a living graph of every symbol, import, and call. `where_defined`, `who_calls`, `blast_radius`, `whats_in_file`. Langs: Rust, Python, TypeScript, TSX, Go, Java, C#, Ruby. (1,887 files in 8.4s, 100% on-device.)
6. **54 MCP tools, tiered.** minimal(3) / lite(8, default) / standard(20) / full(54). Pick a slice, not the kitchen sink.
7. **NEW — multi-agent coordination.** `handoff` / `agent_inbox`: agents route work to each other and read their own inbox through one shared local brain. `session_start(agent=X)` gives each agent its own view. A coordination *substrate*, not an orchestrator (it never runs/schedules agents).
8. **NEW — confidence on recall.** Every recalled fact carries a 0–1 trust signal (distinct from relevance), so an agent knows what to rely on — especially facts written by other agents. Zero-LLM (structural).

## Proof / benchmark (receipt-honest)
- **97% recall@5 on LongMemEval** — one of the hardest memory benchmarks (long multi-session histories, updated/contradicted facts, temporal reasoning). Full 470-question set, NeuroVault's real `recall()` path, 100% on-device embeddings.
- hit@5 ≈ 0.97 (right memory in top 5), hit@10 ≈ 0.99, median query over a 120k-token haystack, zero cloud / no API keys.
- Honest framing: this is **retrieval recall**, not an end-to-end QA-leaderboard number. Reproducible harness.

## Uses ("one brain, countless uses")
Ask your own notes in plain language (get the actual passage, not a keyword miss); a memory for your coding agent; research/dissertation/life memory; anything private/proprietary/privileged — because it never leaves your machine.

## Brand
- Voice: confident, direct, technical-but-human. Short sentences. No hype, no exclamation-points-for-excitement. Receipt-honest.
- Identity: the inverted split-colour brain/vault icon (black+blue brain / blue+black vault). Neural-network motif.
- Palette: deep navy bg (#0b0b12), blue primary accent (#2F7BF6), pale-blue secondary (#7FB0FF). Cyan variant matches the icon. MUST ship first-class **light AND dark** themes.
- Type: JetBrains Mono (logo/code), Inter (prose).

## CTAs / links
Download (Mac DMG / Windows) · Star on GitHub · Docs · Privacy · MIT License.

## Footer
© 2026 NeuroVault contributors · local-first AI memory.
