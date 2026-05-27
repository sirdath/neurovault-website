# Brain diagnostic

The brain diagnostic is a one-glance **health scorecard** for a vault. Instead of a wall of raw analytics, it distils the graph into five graded categories plus a single headline letter grade, and hands you a worst-first list of concrete fixes.

Open it from the **Diagnostic** button in the graph toolbar. It's instant — computed from your brain with no embeddings and no network call.

```
NeuroVault brain diagnostic — work
Overall: B  (84/100, 412 notes)

Connectivity  ██████████████████████░░  88%
Interlinking  ███████████████░░░░░░░░░  63%
Cohesion      ███████████████████████░  94%
Freshness     ██████████████████░░░░░░  74%
Organization  ████████████░░░░░░░░░░░░  51%

Top fixes:
  - 49 orphan notes with no links — connect or merge them
  - 201 unfiled notes in the root — sort into folders
```

## The five categories

Each scores 0–100%; the overall grade is their weighted mean.

| Category | Weight | What it measures |
|---|---|---|
| **Connectivity** | 25% | Share of notes that have at least one link. Low = lots of orphans. |
| **Interlinking** | 20% | Average links per note (≈3 is "well-linked"). |
| **Cohesion** | 20% | Share of notes in the single largest connected cluster. Low = scattered islands. |
| **Freshness** | 20% | Share of notes that aren't dormant. |
| **Organization** | 15% | Share of notes filed into a folder (vs. loose in the root). |

The grade is an **A–F** band over the weighted score — a fast signal of what maintenance would help most, not an absolute IQ for your brain.

> [!NOTE]
> The in-app panel and the agent both read the **same** DB-backed report, so the numbers always match. (The grade reflects dormant notes too, which the graph view hides.)

## Let your agent fix it

The diagnostic is most powerful as the start of an **agent-driven maintenance loop**. Click **Copy report** to put the plain-text scorecard on your clipboard and paste it to your connected agent — or, if the agent is connected over MCP, just ask it to *"diagnose my brain and fix the top issues."*

The agent has a read-only **`diagnose_brain`** tool that returns the same `{grade, score, total, categories, issues}` report. A typical loop:

1. `diagnose_brain()` — see what's weak.
2. **Orphans / islands** → find the notes and add `[[wikilinks]]` between related ones, or merge near-duplicates.
3. **Unfiled** → rename notes into folders (e.g. `research/embeddings.md`).
4. **Dormant** → revisit the still-relevant ones; let the rest decay.
5. `diagnose_brain()` again — confirm the grade improved.

`diagnose_brain` never changes the vault itself; the agent makes the edits with the normal write tools (`remember`, save, rename). This is the maintenance work memory wants an agent to own — write-time curation, not just retrieval.

## HTTP

The same report is available on the loopback API:

```bash
curl "http://127.0.0.1:8765/api/diagnostic?brain=default"
```

Returns `{ grade, score, total, categories[], issues[] }`. See the [HTTP API](#http-api) reference.
