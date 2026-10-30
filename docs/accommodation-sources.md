# Sibale accommodation evidence

Checked 26 October 2026. The catalog publishes two named accommodation references from [Sibalenhon Backpacker’s firsthand report, 9 March 2019](https://sibalenhonbackpacker.wordpress.com/2019/03/09/sibale-island-a-hidden-paradise-of-romblon/): **TDL Lodge** and **Mimi’s Accommodation**.

The article supports the names and island. It does not establish that either still operates, or provide current rates, exact addresses, public contacts, room inventory, capacity, amenities, or verified property photographs. The UI states the source year and current uncertainty, and links directly to the report. The source-check date is not a property verification date.

Both are reference-only listings. Unknown price, capacity, and coordinates are JSON null; phone and room/amenity arrays are empty. No artificial nightly rate, availability claim, verified partner badge, stock resort photo, or precise map marker is published. Lodging category filters are broad editorial categories, not accreditation claims. Native reservations are disabled in both the UI and API for reference-only listings, even when booking permissions are enabled.

Migration 008 archives the four demo stays while preserving IDs for existing references. It adds the two new records and permits explicit null lodging facts only when `bookingMode` is `reference-only`. Other resource validation, including the strict trail-coordinate fix, is retained. The seed and frontend reference catalog match the migration. Existing user reservations remain stored against their original records.

The admin catalog API preserves the source metadata and reference-only mode. General-copy edits in the existing admin form preserve unknown source facts rather than substituting its numeric defaults. Enabling real reservations requires confirmed property details, rates, room inventory and capacity, plus an explicit change to booking mode through a future verified listing workflow.

Excluded research results:

- Accommodation on Tablas, Romblon Island, Sibuyan and Calatrava is outside Sibale/Concepcion.
- Sea Breeze Paradiso Resort on another island called Sibale is in Surigao, not Romblon.
- A [2018 visitor report](https://jessica198112511.wordpress.com/2018/08/19/sibale-island/) mentions Won Dive Resort, but similarly named property results point to Puerto Galera. Its identity and present operation were insufficiently established for this catalog.
- Older references to Municipal Guest House, Celangel Suites and private family stays are not current public listings or evidence of present availability.

Validation includes a PostgreSQL integration regression for null facts, metadata preservation, and rejected reservation attempts with no booking row created. Browser checks cover the live stay cards and map in light/dark desktop/mobile views.
