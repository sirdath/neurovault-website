# NeuroVault landing-page content brief

> Source of truth for public product language. Every claim must match a public
> artifact or be explicitly labelled as future work.

## Product boundary

- **One product and one repository:**
  [github.com/sirdath/NeuroVault](https://github.com/sirdath/NeuroVault).
- **Free and open source:** the visual app and the headless engine are two ways
  to use the same local memory system, not separate paid and free products.
- **Desktop app:** the complete visual experience, including Memories, Graph,
  Review, themes, guided setup and service lifecycle management. Download the
  current Mac app from GitHub Releases.
- **Headless source build:** the same Rust engine as an MCP and HTTP service,
  for people who want to configure their own clients without the app.
- **Headless npm package:** `@neurovault/mcp` is prepared but has not had its
  first publication. Do not present `npx` as a working install path yet.

## One-liner

**A local brain for every agent you use.**

## Hero

- Headline: *Give every agent a brain that survives the window close.*
- Sub: NeuroVault builds an increasingly useful memory base from knowledge you
  choose to keep. Retrieval and ingest run locally, so routine memory work does
  not require a paid model call.
- Primary CTA: Download for Mac.
- Secondary CTA: Build the headless engine.
- Supporting link: View the source on GitHub.
- Badge: Free + open source · local-first · one memory for many agents.

Do not imply that NeuroVault has human consciousness, perfect recall, or
unlimited knowledge. It can retain more durable written context than a person
could reliably keep in working memory, while keeping that context inspectable.

## Integration language

Always distinguish these paths:

1. **Claude Code hooks:** retrieve and inject context automatically before the
   model handles a prompt. The model does not need to initiate a tool call.
2. **MCP:** gives compatible clients callable `recall`, `remember` and related
   tools. MCP alone does not promise automatic injection.
3. **HTTP:** lets custom local or authenticated self-hosted software use the
   engine directly.

Never describe MCP as automatically adding context in every client.

## The problem

- Giant static instruction files bloat prompts and go stale.
- Past sessions disappear, forcing users to repeat decisions and context.
- Repeatedly asking a hosted model to reconstruct old context wastes tokens and
  money.
- Cloud memory can trap private knowledge in one vendor's custody and format.

## Product pillars

1. **Local-first:** no NeuroVault account or telemetry; the default service is
   loopback only.
2. **On-device retrieval:** embeddings, BM25, sqlite-vec, graph traversal and
   reranking happen locally.
3. **Durable and inspectable:** note and engram content lives in ordinary
   Markdown. SQLite stores indexes and structured state such as drafts, core
   memory, history and proposals.
4. **Hybrid retrieval:** semantic, lexical and relational signals are fused
   into ranked recall.
5. **Evidence discipline:** append-only experience events and evidence-backed
   consolidation preserve why memory changed.
6. **Open integrations:** MCP, Claude Code hooks and HTTP cover different host
   capabilities without pretending they are identical.

## Privacy language

NeuroVault does not upload a vault or require a hosted NeuroVault account.
Selected context returned to a connected cloud-backed AI client may be sent to
that client's configured provider under the provider's own terms. Never shorten
this to “nothing ever leaves your device.”

## Platform language

- macOS desktop: Apple Silicon, macOS 14 or newer, signed and notarized direct
  download.
- Windows x64 desktop: preview; current installers are not Authenticode-signed.
- Linux desktop/headless: x64 with glibc 2.35 or newer; Ubuntu 22.04 is the
  tested baseline.
- Intel Mac, ARM/musl Linux and mobile are not current release targets.

## Proof

- The homepage currently reports 97.45% hit@5 and 93.83% recall@5 on the
  470-question LongMemEval retrieval run.
- Frame this as retrieval recall, not end-to-end question-answering accuracy.
- Link the public reproducible harness at `src/bin/nv-bench.rs` in the main
  repository. Do not link private benchmark notes.

## Calls to action

- Download for Mac from the latest GitHub release
- Build headless from the main repository
- Explore the source on GitHub
- Read the public docs

Do not restore the retired split-repository links, describe the current desktop
app as future-only, publish a price, or show a fake package-manager command.

## Voice

Confident, direct and receipt-honest. Technical claims should be verifiable.
Future features must say “planned” rather than appearing available.
