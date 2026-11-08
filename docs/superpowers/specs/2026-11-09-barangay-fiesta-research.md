# Barangay fiesta coverage: research and proposed approach

Research checked 9 November 2026. The user subsequently approved the directory approach; the separate design records implementation scope. This is not a verified fiesta calendar.

## Requested outcome

Add every barangay's fiesta to Fiestas & Customs. The user does not currently have a local calendar or dates to supply.

## Existing implementation

The festival view renders event/tradition culture records. Existing content covers the municipality's December 8 Immaculate Conception feast, Biniray, and fiesta hospitality. Source-backed entries live in frontend reference data, backend seed data and numbered immutable SQL migrations; a new migration is needed for existing installations.

## Geographic coverage

The [PSA municipality directory](https://psa.gov.ph/classification/psgc/barangays/1705905000) lists these nine barangays. This source verifies names and membership, not fiestas, patron saints, or feast dates.

| Barangay | Individually verified fiesta date/patron |
| --- | --- |
| Bachawan | Not established |
| Calabasahan | Not established |
| Dalajican | Not established |
| Masadya | Not established |
| Masudsud | Not established |
| Poblacion | Not established separately from the municipal feast |
| Sampong | Not established |
| San Pedro | Not established |
| San Vicente | Not established |

## Evidence and excluded leads

- [Romblon News's 2017 report, updated 2021](https://romblonnews.net/2017/12/kapistahan-ng-immaculada-concepcion-ipinagdiriwang-ng-bayan-ng-sibale/) and the [parish-information page](https://www.theoldchurches.com/philippines/romblon/concepcion-romblon/immaculate-conception-church-concepcion-3/) support December 8 for the municipality/parish. They do not provide nine barangay dates.
- Searches for Bachawan fiestas returned Bachawan in San Agustin, Romblon. Those records are geographically unrelated and must not be used for Sibale.
- A [1994 court decision](https://lawphil.net/judjuris/juri1994/oct1994/gr_109131_1994.html) mentions a coronation ball on May 2, 1991 in connection with Calabasahan's fiesta. This is not sufficient to establish its recurring feast date, patron, or current schedule. Do not turn it into a May 2 annual event.
- The Masudsud Public Information Office mirror was discoverable, but its contents could not be fetched. Its search listing does not substantiate a fiesta date.
- Search results for San Pedro, San Vicente and Sampong frequently concerned other municipalities or unrelated text. A saint's general feast day or a barangay name does not establish a local fiesta.

## Approaches for the user's choice

1. Recommended: add a barangay fiesta directory covering all nine names, with dates/patrons explicitly “To be confirmed” until reliable local evidence is available. Preserve the sourced town feast and customs separately. This provides complete geographic coverage without claiming a complete verified fiesta calendar.
2. Wait to publish barangay entries until a municipal/parish/barangay calendar is available. This keeps only verified celebrations visible but does not yet satisfy coverage of every barangay.

Neither approach permits invented dates, patrons, images, current-year activities or claims that one fiesta per barangay is exhaustive. Once the user selects an approach, produce the short implementation design for approval under the requested Superpowers workflow.
