# Live weather and sea conditions

## Intent

Replace the unavailable weather placeholder with current model estimates for Sibale and nearby sea conditions. The user selected Open-Meteo and wants wave information to help plan ferry travel.

## Approach

Use Open-Meteo weather and marine APIs through the existing Express `/api/weather` endpoint. The selected provider has no API-key requirement for this noncommercial portfolio. A paid keyed provider adds account setup without a demonstrated need. Official bulletins remain a separate source: model output cannot establish ferry clearance.

## Proposed behavior

- Keep the hero weather summary and add an expandable weather/sea conditions panel.
- Show temperature, conditions, humidity, wind speed and gusts for Sibale; show significant wave height, wave period, and wave direction for a labeled nearby offshore model location.
- Show the next 24 hours of hourly wave and wind estimates, with times in Asia/Manila. Identify the selected model location; do not describe a single point as covering the entire ferry crossing.
- Explain significant wave height as the average height of the highest third of waves; individual waves can be higher. Do not present wave height as wave force.
- Label estimates and their valid times, provider attribution, and last successful retrieval. Refresh every 15 minutes and offer manual retry. Use a short backend cache and bounded upstream request timeouts.
- Keep weather and marine availability independent. Missing, stale, invalid, or failed data must be labeled unavailable or outdated, never rendered as zero or calm conditions.
- Display “Ferry safety not assessed” alongside links to current PAGASA gale warnings and tropical cyclone bulletins. Ask visitors to confirm sailing status with the local Coast Guard/port and ferry operator. No automated safe-to-sail label, inferred clearance, or invented cancellation status.

## Scope and constraints

Change only weather API/service, frontend weather UI, focused tests, and relevant documentation. Preserve portfolio mode and existing account/booking restrictions, migrations, stored records, and unrelated Header changes. No AI service or OpenAI API key is needed.

## Verification

Cover successful weather/marine parsing, provider errors/timeouts, missing and stale data, caching, and frontend loading/error/success states. Run root typecheck, lint, unit tests, integration tests, and build; verify live provider connectivity and rendered interaction where available. Report environmental limitations explicitly.

## Sources

- https://open-meteo.com/en/docs
- https://open-meteo.com/en/docs/marine-weather-api (provider states the data is unsuitable for coastal navigation)
- https://www.pagasa.dost.gov.ph/marine/gale-warning
- https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin

## Builder decisions

Exact offshore coordinates, response schema, cache duration, and panel styling are implementation choices to validate against existing map data and provider responses. This proposal does not include automated ingestion or geographic interpretation of official advisories.
