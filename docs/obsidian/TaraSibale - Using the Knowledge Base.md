---
tags: [tarasibale/guide]
reviewed: 2026-11-07
---

# Using the Knowledge Base

Start at [[00 TaraSibale - Start Here]]. The reading map links fifteen canonical
notes by responsibility. Individual symbols, configuration keys, and versioned
dependencies no longer create separate note files.

## Two layers of notes

**Guides** explain purpose, actual runtime flows, storage, and limitations.
Their editable sources are versioned under `docs/obsidian/`. They include
links to the reviewed local source files. Update them when behavior changes.

**References and implementation sections** group related declarations by source
file, using the reviewed explanations in `docs/obsidian-context/`. Components
and their props share one section. Package versions share a single dependency
row across workspaces. Repeated compiler options and command names are grouped
in the configuration reference. Source links retain access to actual code.

The explanation maps cover the reviewed indexed entries; their prose needs
review when behavior changes. Interface field contracts are parsed from current
source, while indexed line numbers come from the graph snapshot. Neither is
proof of runtime behavior.

Old granular notes are archived outside the vault in the repository's ignored
`graphify-out/obsidian-archive/` directory. They remain recoverable without
cluttering Obsidian search or Graph view. Export does not recreate those notes.
Keep personal notes in separate files. The exporter preserves locally edited
canonical files and reports conflicts instead of silently replacing those edits.

## What the graph cannot prove

- A declared constant is not necessarily imported by the active app.
- A missing edge means no relationship was indexed; it is not proof of no caller.
- The TSX extractor reports partial coverage for `AuthModal.tsx` and
  `InteractiveMap.tsx`; SQL data updates and top-level scripts may yield no symbols.
- Communities are algorithmic groupings. The build applies reviewed names,
  purposes, questions, and entry points from `docs/graphify-communities.json`
  after clustering. Names follow source/symbol anchors rather than numeric IDs;
  no LLM call is needed. Read the context panel in `graphify-out/graph.html`.
- Graphify cloud membership/indexing is separate from the installed local CLI.
  The cloud connector listed no available workspaces during setup.

## Refresh after source changes

```bash
npm run graph:build
npm run graph:obsidian
```

The default command builds the standalone vault at `graphify-out/obsidian`.
To refresh the copy inside the existing vault on this machine:

```bash
npm run graph:obsidian -- '/home/geminionlinux/Documents/Obsidian Vault/TaraSibale'
```

Use this wrapper rather than exporting directly with Graphify: it consolidates
the graph into canonical notes, migrates old links, and creates the reading map
with paths relative to the actual vault root. Running Graphify's raw Obsidian
export directly into this folder would recreate the redundant symbol notes.
Exporting does not re-review the explanations or automatically advance their
review date. Rebuilding the graph alone also does not update these guides.

The output is local and rebuildable. Credentials, database files, dependencies,
and generated graphs are excluded by ignore rules. Exporting this knowledge
base does not upload source to Graphify cloud.

Sources: [export wrapper](../../scripts/export-obsidian.mjs),
[knowledge-tool setup](../knowledge-tools.md), [graph ignore rules](../../.graphifyignore).
