# Weather and nearby sea conditions

The Explore hero loads read-only `/api/weather` in portfolio mode. Expand **Sea conditions** to see Sibale weather, an offshore wave reference, and 24 hourly wind/wave estimates. All displayed times use Asia/Manila (PHT). **Refresh weather** retries immediately; automatic refresh runs every 15 minutes while the component is mounted. No account, API key, or database migration is required.

## Sources and location

- [Open-Meteo weather API](https://open-meteo.com/en/docs): requested at 12.9131° N, 121.7204° E (Concepcion, Sibale).
- [Open-Meteo marine API](https://open-meteo.com/en/docs/marine-weather-api): requested at 12.9300° N, 121.6200° E (offshore west of Sibale), with sea-grid selection.
- The panel displays both requested reference coordinates and the actual grid coordinates returned by the provider. Neither is a surveyed ferry route. Wind is for the island weather point, not a measurement of offshore wind along the crossing.
- Weather data is attributed to Open-Meteo under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The [free API is for noncommercial use](https://open-meteo.com/en/pricing); reassess service access before a commercial launch.

## Meaning and limits

These are model estimates, not local observations. Significant wave height is the average height of the highest third of waves; individual waves can be higher. Wave period is time between waves, not wave force. Direction indicates where the waves come from, clockwise from north. No automated wave/wind threshold classifies a ferry as safe or operating.

The panel always displays **Ferry safety not assessed**. One offshore point cannot represent the entire crossing, breaking waves near shore, port conditions, a vessel's capabilities, or sailing permission. Check current [PAGASA gale warnings](https://www.pagasa.dost.gov.ph/marine/gale-warning) and [tropical cyclone bulletins](https://www.pagasa.dost.gov.ph/tropical-cyclone/severe-weather-bulletin), then confirm status with the local Coast Guard/port and ferry operator. The app links to official advisories but does not automatically read or interpret them.

## Availability and freshness

The backend fetches weather and marine data concurrently with separate eight-second timeouts, validates the response coordinates, units, timestamps and measurement ranges, and deduplicates concurrent loads. A process-local cache lasts five minutes when both sources are available, or 30 seconds on a partial/full outage. Browser retries may return that cached result; valid and retrieval times remain visible.

Each source independently reports `available`, `outdated`, or `unavailable`. Null, absent, negative wave/wind measurements and mismatched units never become zero. Current model times over two hours old are outdated; times more than 30 minutes ahead are unavailable. Browser data expires 30 minutes after retrieval, checked every 30 seconds. A failed browser refresh withholds previous values. Forecast rows align by UTC timestamp and show missing values as unavailable. The 24-row outlook starts at the current hour; its first row may precede the current minute.

Internet connectivity to `api.open-meteo.com` and `marine-api.open-meteo.com` is required on the backend. Provider downtime affects only the corresponding source; the app must never interpret missing data as calm seas or travel clearance.
