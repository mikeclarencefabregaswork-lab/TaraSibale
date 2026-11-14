# Sibale attraction sources and linked photography

Checked 25 October 2026. Scope is Concepcion municipality on Sibale/Maestro de Campo Island, Romblon; similarly named sites in Iloilo, Banton, and other municipalities are excluded.

## Published records

| Entry | Text and photograph evidence | Map location |
|---|---|---|
| Guiwanon Beach | House Bill 4026 names Guiwanon; Sibalenhon Backpacker identifies its photograph and credits HashTravel. | OpenStreetMap way 649425598, polygon center 12.9286917, 121.6837495. |
| Tonggo Beach | House Bill 4026 and Sibalenhon Backpacker both name Tonggo. Photograph is captioned Tonggo in the latter. | OpenStreetMap node 6094862561, Tonggo Point Beaches, 12.9005267, 121.7218913. |
| Tabunan Beach (Sibale) | House Bill 4026 and Sibalenhon Backpacker. Photo selected from the Sibale account, not the Commons photos of Tabunan Beach on Banton. | Exact site pin unconfirmed; no pin rendered. |
| Quebrada Beach & Poblacion Bay | Sibalenhon Backpacker captions a wider bay/beach image and credits JustGoPH. It is labeled as a bay view, not a close-up of the beach. | OpenStreetMap way 649436843, polygon center 12.9029094, 121.7203386. |
| Lambirongan Stone Arch | Named in House Bill 4026. Sibalenhon Backpacker captions its photo as Lambirungan Stone Arch. | Exact site pin unconfirmed; no pin rendered. |
| Immaculate Conception Grotto | Sibalenhon Backpacker photograph, supported by Romblon Paradise's description of the Mount Batareya grotto. It is distinct from the parish church. | Exact site pin unconfirmed; no pin rendered. |

OpenStreetMap positions are community-mapped reference locations, not surveyed access points. Unconfirmed records retain a municipal reference coordinate in legacy numeric fields for compatibility; `coordinateStatus=unconfirmed` prevents those coordinates from being used as site pins. Do not infer a route from them. OSM data is available under ODbL; attribute [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Sources

- [House of Representatives, HB 4026](https://docs.congress.hrep.online/legisdocs/basic_20/HB04026.pdf): a proposed tourism-development bill listing attractions, not evidence of enacted law, current prices or operating hours.
- [Sibalenhon Backpacker, 9 March 2019](https://sibalenhonbackpacker.wordpress.com/2019/03/09/sibale-island-a-hidden-paradise-of-romblon/): named photographs and local travel account. Old fares, timetables and contact numbers from this post were not imported.
- [Romblon Paradise, Concepcion travel guide](https://romblonparadise.com/concepcion-romblon-island/): secondary corroboration for named beaches and the Mount Batareya grotto.
- [Immaculate Conception Church information](https://www.theoldchurches.com/philippines/romblon/concepcion-romblon/immaculate-conception-church-concepcion-3/): corrects the former St. Joseph naming. No separately licensed church photo was found, so the photographed grotto is the cultural entry in this batch.
- OpenStreetMap object links are stored on each mapped record and were retrieved through Overpass on the check date.

## Photo permission and implementation

**Portfolio update, 31 October 2026:** Default portfolio API presentation now withholds these six photographs and galleries, showing an original labeled placeholder instead. The database retains source/permission metadata unchanged. The implementation below describes the earlier local-preview selection, not permission for public distribution.

The user explicitly selected **linked real photographs with credits for local preview**. All six images link directly to the original WordPress-hosted photographs; no copies were downloaded or bundled. Each card links its credit to the source; the detail view includes the original caption context and supporting references. The source captions separately credit HashTravel for Guiwanon and JustGoPH for Poblacion/Quebrada. Other credits identify the source publication, without claiming a photographer attribution it did not state.

No open reuse license was found for these photos. Attribution alone does not establish a license. Obtain the rights holders' permission or replace them with permission-cleared images before public publication. External availability is outside the app's control; cards use a local unavailable-photo fallback on load failure. The linked photos are older reference photography, not a claim about current conditions.

## Data migration

Migration `004_sourced_sibale_attractions.sql` archives the six original demo attraction IDs and inserts six new, independently named IDs. It does not delete catalog entries, reviews, user accounts or private data. Published catalog reads and new reviews exclude archived entries. Administrator catalog edits skip archived history and preserve source/credit metadata. New installations seed the same sourced records from `Backend/seed/catalog.json`; `Backend/seed/sourced-attractions.json` is the compact provenance-bearing dataset.

There are no verified fee schedules, hours or popularity rankings in these sources, so none are asserted. Ratings and review counts continue to come from actual stored community reviews. The former claim of a Sibale Spanish watchtower, specific Masaguisi sanctuary, Mount Tingarac itinerary and Dampali cave attractions was not independently established in this research; the old records remain unpublished pending evidence.
