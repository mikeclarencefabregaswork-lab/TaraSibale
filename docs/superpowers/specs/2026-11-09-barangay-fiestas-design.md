# Barangay fiesta directory

The user approved the nine-barangay directory approach on 9 November 2026. It adds geographic coverage while explicitly leaving all individual fiesta dates and patron saints unconfirmed. The alternative of waiting for a local calendar was not chosen. See the accompanying research note for evidence and exclusions.

## Behavior and scope

Fiestas & Customs will contain a clearly labeled Barangay Fiestas directory with nine cards: Bachawan, Calabasahan, Dalajican, Masadya, Masudsud, Poblacion, Sampong, San Pedro and San Vicente. Every card shows “To be confirmed” for fiesta date and patron saint. An introductory note explains that the list covers barangays and does not confirm their celebrations. PSA links substantiate names only.

The existing December 8 municipal feast and two documented customs stay in their own section, with all existing evidence preserved. Poblacion does not inherit December 8 as a separately verified barangay date. No guessed saints, annual dates, programs, stock fiesta images or new visitor services are added.

## Implementation decisions

Add a `fiesta-directory` culture category and optional barangay/patron fields. Keep directory records consistent across frontend reference data, seed catalog and a new additive migration 010. Use conflict-do-nothing so a locally updated existing record is never overwritten. Apply the migration to the authorized local development database after isolated verification. Preserve portfolio mode and every unrelated record.

Extract the festivals view into a focused component for rendering tests, preserving the current tab flow and visual styles. Use a responsive one/two/three-column card grid and clear heading hierarchy. No extra filtering, administration controls or dependencies are needed for nine entries.

## Acceptance evidence

Verify nine distinct official barangay names, explicit unknown dates/patrons, source scope, preserved town/custom records, data parity, idempotent migration and catalog API delivery. Run root typecheck, lint, unit tests, database integration and build; inspect the Fiestas & Customs tab on desktop/mobile where available. Source dates and unknown details are content, not proof of a current-year calendar.
