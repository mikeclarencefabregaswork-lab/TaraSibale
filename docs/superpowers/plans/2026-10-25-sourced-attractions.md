# Sourced Sibale attractions

User authorized replacing demo attractions with researched data and credited external photographs for local preview. Scope: the attraction catalog, sources/credits in cards and detail views, map accuracy labels, and an additive database migration. Preserve user accounts, bookings, reviews and unrelated catalog kinds.

- Publish source-supported Guiwanon, Tonggo, Tabunan, Quebrada, Lambirongan Stone Arch and Immaculate Conception Grotto entries.
- Archive the original six unsupported demo records rather than reassign their IDs or delete referenced history. The old church's name was incorrect; verified parish is Immaculate Conception, but this batch uses the photographed grotto as the cultural attraction.
- No invented entrance fees, hours, ratings or safety claims. Community ratings remain computed by the API. Link sources and photo credits; no claim of public reuse permission. Images remain external links for the authorized local preview.
- Mapped coordinates use OpenStreetMap object centers; unconfirmed sites have no visible pin. Existing numeric coordinate compatibility fields for those entries are a town reference only, clearly identified by coordinateStatus=unconfirmed and never shown as an exact site location.
- Keep provenance through administrator edits. Seed and applied migration agree. Public reads and new reviews exclude archived attractions, and admin updates retain archived referenced rows.
- Verify publication/reference behavior with an isolated database test, then full checks and browser card/detail/filter/map/image loading on desktop/mobile.

Research sources and photo status are recorded in docs/attraction-sources.md.

## Verification

- Primary/secondary tourism references and source photo captions checked. OpenStreetMap queried for coordinate provenance; no precise pins fabricated for the other three entries.
- All six external photograph URLs return HTTP200 image/jpeg and render as the original linked photos in headless Edge.
- Regression tests observed hidden-archive and metadata-preservation failures, then passed after API changes. Root tests4 frontend+6 backend pass; database integration17/17 pass.
- Migrations004005 applied to native PostgreSQL. Both canonical seed files and resulting migration payload match field-for-field (independently checked).
- Root typecheck/build pass. Lint exits0 with the two existing React effect warnings.
- Browser validation: six real photos, detail sources/credits, unconfirmed coordinates suppressed, category filters, mobile390px without horizontal overflow; no runtime/console errors. Evidence saved outside repo in task visualization folder.
- Fresh independent review found no critical/important issues. Its minor missing detail-image fallback was corrected before handoff.
