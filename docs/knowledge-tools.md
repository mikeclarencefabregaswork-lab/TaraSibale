# Graphify and Obsidian

The installed local `graphify` CLI builds a code graph without API keys or LLM
requests. This is separate from the Graphify cloud connector: that connection
currently lists no available workspaces, so cloud indexing is unavailable.

## Rebuild and explore

Run from the repository root:

```bash
npm run graph:build
graphify query "How does the API connect to PostgreSQL?" --budget 2000
graphify explain createApp
npm run graph:obsidian
```

`graph:build` also applies the reviewed community rules in
`docs/graphify-communities.json` and enhances `graphify-out/graph.html` with
community purposes, investigation questions, member entry points, related groups,
symbol explanations, and guided reading routes. The default application view
keeps configuration and maintenance groups available through **All communities**.
Use **Inspect a community** for its explanation, or **Start with a question**
to follow a concrete path through the code. Selected symbols and their nearby
neighbors receive visible labels.

`npm run graph:context` reapplies the context and regenerates the HTML without
re-extracting source. Names are matched through source/symbol anchors and exact
file rules rather than numeric community IDs. The algorithm's membership and
edge topology remain intact. Mixed groups are explained as mixed dependencies,
not claimed to be independent services.

Outputs are ignored by Git:

- `graphify-out/graph.json`: machine-readable symbols and relationships.
- `graphify-out/graph.html`: interactive graph.
- `graphify-out/GRAPH_REPORT.md`: community and connectivity report.
- `graphify-out/COMMUNITY_GUIDE.md`: readable purposes and entry points for groups.
- `graphify-out/community-context.json`: viewer explanations and investigation paths.
- `graphify-out/obsidian/`: standalone Obsidian vault with fifteen canonical notes
  and one reading map.
- `graphify-out/obsidian-archive/`: recoverable copies of the previous granular notes,
  stored outside the active vault.

In Obsidian, use **Open folder as vault** and select `graphify-out/obsidian`.
An additional export is installed in the existing **Obsidian Vault**, under
the `TaraSibale` folder. Begin with `00 TaraSibale - Start Here`, then follow
the guides or `00 TaraSibale - Reading Map.canvas`. Graph view can be filtered
to `path:TaraSibale`. The granular code graph remains outside Obsidian.

To refresh that existing-vault copy on this machine:

```bash
npm run graph:obsidian -- '/home/geminionlinux/Documents/Obsidian Vault/TaraSibale'
```

The default export groups declarations inside their owning guide or reference.
Dependencies and version ranges share one package row across workspaces. Repeated
command names, compiler options, component props, and local helpers no longer
create separate notes. Automatic community notes are omitted from the active vault.

The export wrapper migrates old symbol links to canonical sections and validates
links before archiving old managed files. It backs up the previous notes first,
preserves unrelated personal files, and refuses to prune when locally edited
canonical notes conflict. The archive location is printed by the command.
Refreshing an already consolidated vault does not recreate granular notes.
Do not run Graphify's raw Obsidian exporter directly into the active vault.

Edit guide sources in `docs/obsidian/` and reviewed entry explanations in
`docs/obsidian-context/`. Implementation tables and interface contracts are grouped
by source; source links open the checkout. `scripts/obsidian-consolidate.mjs`
maintains the grouping rules. Locally edited canonical notes are preserved and
reported for manual reconciliation rather than silently overwritten.

Repeated prose has one source: a symbol can use `{"fileSummary":"path/to/file"}`
or `{"shared":"definition-key"}` instead of copying text. Shared definitions live
in `docs/obsidian-context/shared.json`. Both exporters use
`scripts/knowledge-context.mjs` to resolve these references to strings and reject
duplicate keys or missing targets. The declaration parser remains in
`scripts/obsidian-note-context.mjs`; the former granular-note publisher is removed.

Rebuild before exporting after source edits. The graph is a snapshot, not a live view.
The SQL parser (`tree-sitter-sql`) is installed in Graphify's tool environment.
SQL DML and top-level scripts may produce no symbols. The current TSX parser
also reports partial extraction for `AuthModal.tsx` and `InteractiveMap.tsx`;
TypeScript compilation passes. Confirm behavior in current source and tests
when graph coverage is incomplete. Community names remain generic because
`--no-label` avoids LLM requests.

`.graphifyignore` excludes credentials, database files, dependencies, builds,
and generated graph output. Do not place secrets in documentation or graph notes.

## Application map

`Frontend/src/App.tsx` coordinates the React interface. Vite forwards `/api`
to Express on port 3001. `Backend/src/server.ts` opens the HTTP listener;
`app.ts` installs health checks and the portfolio boundary; `api.ts` implements
the catalog and authenticated application routes. `db.ts` creates the
node-postgres pool using the ignored backend environment file.

`Backend/gemini.psql` creates the database under the existing `gemini.psql`
role. Numbered SQL migrations define and evolve its schema; the seed script
loads missing reference records. The full-API integration suite creates a
temporary schema and explicitly selects non-portfolio mode for that test app.
The running application retains its default portfolio mode.
