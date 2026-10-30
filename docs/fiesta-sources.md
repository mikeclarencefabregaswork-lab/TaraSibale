# Fiestas and customs: Sibale source notes

Checked 25 October 2026. This change covers only the Fiestas & Customs tab, leaving the phrasebook and food entries outside its verification scope.

## Published entries

- **Feast of the Immaculate Conception — December 8.** The parish-information page gives the feast date. Romblon News's contemporaneous report describes Sibale's 2017 celebration and identifies the same patron and date.
- **Biniray & Parish Processions.** The 2017 local report explicitly mentions Masses, processions and Biniray. The app does not infer a current route, timetable, boat arrangement or 2026 program from that reference.
- **Fiesta Hospitality & Community Gatherings.** The report describes household hospitality and community activities. Visitor wording does not promise free meals, universal participation or public access to private homes.

Sources:

1. [Romblon News, 7 December 2017; page updated 20 October 2021](https://romblonnews.net/2017/12/kapistahan-ng-immaculada-concepcion-ipinagdiriwang-ng-bayan-ng-sibale/).
2. [TheOldChurches: Immaculate Conception Church in Concepcion, Romblon](https://www.theoldchurches.com/philippines/romblon/concepcion-romblon/immaculate-conception-church-concepcion-3/).

The check date is when sources were reviewed, not the publication date or confirmation of this year's program. The app distinguishes the annual feast date from historically documented customs and advises confirmation of current arrangements. No current-year program was verified. Secondary lists mention “Rungawan,” but this batch does not add that name without stronger local corroboration.

## Migration and UI

`006_sourced_fiestas_and_customs.sql` archives the incorrect May 1 St. Joseph demo event and inserts three new culture records. The former stock concert photograph and unsupported parade/open-house promises are not reused. The tab now renders both `event` and `tradition` records, with appropriate labels, dates, evidence context, source links and the source-check date.

The canonical seed and frontend reference data contain the same new records, so fresh installation and the existing database agree. No accounts, private data, attraction records, phrasebook entries or dishes are changed.

## Verification

The browser check first failed because `tradition` records were not rendered; it passed after the tab's filter was corrected. Final desktop/mobile checks verify three cards, both customs, December 8, source links, no obsolete May 1 card, no horizontal overflow, and no JavaScript/console errors. Root typecheck/build and all existing tests pass (4 frontend, 6 backend, 17 database integration). Lint has no errors and retains the two pre-existing React effect warnings. Independent review verified source support and field-for-field consistency across migration, seed and frontend data, with no material findings.
