# Modern web audit follow-up

Implement the eight findings accepted in the preceding audit. Preserve the visual design, default portfolio restrictions, API contracts, and immutable migrations. Use React, TypeScript, native dialog and form APIs, and existing test tools; add no runtime dependencies or OpenAI API integration.

## Approach

Use native modal behavior, guarded storage, an explicit System/Light/Dark theme setting, accessible navigation and forms, responsive hero delivery, and conditional imports. A framework migration or UI library replacement would add scope without addressing these defects more directly. The user's instruction to proceed authorizes this bounded implementation; no additional design approval is needed.

## Acceptance

- Account dialogs move focus inside, prevent background interaction, close with Escape, and restore the invoker's focus.
- Storage denial does not prevent initial render. System theme follows OS changes without saving an override; explicit choices persist, including across tabs.
- A skip link reaches main content without changing the selected view. View transitions update the title and move focus to an identified content heading after lazy content resolves.
- Account fields have associated labels and autofill hints; password visibility controls have names and states. Admin tag entry preserves IME composition.
- The hero offers responsive image candidates and early discovery; below-fold lodging photos load lazily. Secondary review, chat, and account views load on demand without blank loading states.
- CI runs typecheck, lint, unit, integration and production build checks, plus desktop Chromium/Firefox/WebKit and mobile Chromium browser regressions.

## Validation and limits

Use meaningful browser regressions for focus, storage, theme and navigation; unit/markup regressions for full-mode account fields and composition handling. Compare production bundle output to the audit baseline (513.57 kB entry / 147.85 kB gzip). Do not promise improved field Core Web Vitals without field measurements. Keep existing server-side portfolio protection and no-store handling for private APIs.
