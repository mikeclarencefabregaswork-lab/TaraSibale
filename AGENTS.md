# TaraSibale workspace

- React/TypeScript frontend: `Frontend/`; Express/TypeScript API: `Backend/`.
- Use root npm workspace commands. Checks: `npm run typecheck`, `npm run lint`,
  `npm test`, `npm run test:integration`, and `npm run build`.
- PostgreSQL uses `Backend/.env`. Never print or commit credentials. The local
  database is `tarasibale` on port 5432, owned by existing role `gemini.psql`.
- Preserve the default portfolio mode. The integration suite opts out only
  for its isolated test app; unit tests cover the portfolio restrictions.
- Applied migrations are immutable. Add a new numbered migration for changes.
- Local Graphify is installed. Build with `npm run graph:build`; inspect with
  `graphify query "question"` or `graphify explain Symbol`. Treat graph output
  as a snapshot; read source if stale, empty, or partially extracted.
- Export linked notes with `npm run graph:obsidian`. See
  `docs/knowledge-tools.md` for the existing Obsidian vault export and parser
  limitations. Generated graphs and vault notes are ignored by Git.
