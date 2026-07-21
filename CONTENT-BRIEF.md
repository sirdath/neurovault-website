# NeuroVault landing-page content brief

> Source of truth for public product language. Every claim must match a public artifact or an explicitly labelled future product.

## Product boundary

- **NeuroVault Core:** available now at [github.com/sirdath/neurovault-core](https://github.com/sirdath/neurovault-core). Free, MIT-licensed, local-first, source distribution.
- **NeuroVault Desktop:** consumer Mac app with Memories, Graph, Review, themes, guided setup and lifecycle management. Coming to the Mac App Store. Do not publish a price or a download link until the listing is live.
- Core is complete software, not a crippled trial. Desktop sells convenience, visual workflows, packaging and support rather than exclusive ownership of the memory engine.

## One-liner

**Claude forgets you after every conversation. NeuroVault does not.**

## Hero

- Headline: *Give your AI a memory that survives the window close.*
- Sub: Core stores durable memory in local Markdown. Claude Code can receive relevant context automatically through optional local hooks; other MCP clients receive explicit memory tools.
- Primary CTA: Explore NeuroVault Core.
- Secondary CTA: NeuroVault Desktop, coming to the Mac App Store.
- Badge: Core: free + MIT · Desktop: Mac App Store · local-first.

## Integration language

Always distinguish these paths:

1. **Claude Code hooks:** retrieve and inject context automatically before the model handles a prompt. The model does not need to initiate a tool call.
2. **MCP:** gives compatible clients callable `recall`, `remember` and related tools. MCP alone does not promise automatic injection.
3. **HTTP:** lets custom local or authenticated self-hosted software use the engine directly.

Never describe MCP as automatically adding context in every client.

## The problem

- Giant static instruction files bloat prompts and go stale.
- Past sessions disappear, forcing users to repeat decisions and context.
- Cloud memory can trap private knowledge in one vendor's custody and format.

## Core pillars

1. **Local-first:** no account or telemetry; Markdown is canonical; the default service is loopback only.
2. **On-device retrieval:** embeddings, BM25, sqlite-vec, graph traversal and reranking happen locally.
3. **Durable and inspectable:** Markdown survives index rebuilds and can be opened by ordinary editors.
4. **Hybrid retrieval:** semantic, lexical and relational signals are fused into ranked recall.
5. **Evidence discipline:** append-only experience events and evidence-backed consolidation preserve why memory changed.
6. **Open integrations:** MCP, Claude Code hooks and HTTP cover different host capabilities without pretending they are identical.

## Proof

- The homepage currently reports 97.45% hit@5 and 93.83% recall@5 on the 470-question LongMemEval retrieval run.
- Frame this as retrieval recall, not end-to-end question-answering accuracy.
- Link the public reproducible harness at `src/bin/nv-bench.rs`. Do not link private benchmark notes.

## Calls to action

- Explore Core on GitHub
- Build Core from source
- Read the public docs
- Desktop coming to the Mac App Store

Do not show old GitHub release installers, Windows downloads, a Desktop purchase price, or a fake package-manager command.

## Voice

Confident, direct and receipt-honest. Technical claims should be verifiable. Future features must say “coming” rather than appearing available.
