# TaraSibale color theme

The shared theme uses an oceanic travel palette, replacing the earlier muted Coolors theme:

| Color | Role |
| --- | --- |
| `#073b4c` | Deep ocean navy: footer and brand surfaces |
| `#2ec4b6` | Turquoise: primary controls and active selections |
| `#22b5d6` | Ocean blue: supporting accents and gradients |
| `#f4fbfc` | Sea mist: light page background |
| `#ead8b0` | Sand: supporting badges and accents |
| `#ff8a75` | Coral: decorative highlights |

`Frontend/src/theme.css` owns the named colors and derived shades for readable text, hover states, borders, and dark surfaces. Existing Tailwind utility families map to these shared values: teal/sky/blue use turquoise, cyan uses ocean blue, indigo/purple use coral, amber uses sand, and slate uses cool neutrals and navy. Error and success colors retain their meaning. The existing `rosewood` token now holds coral for compatibility.

Light primary buttons pair turquoise with navy ink. Darker buttons pair deep teal with white and retain a dark hover state. Dark mode uses deep ocean surfaces with pale seafoam text. Overlays, glows, map highlights and Leaflet controls are aligned to the palette too. Photographs and the existing logo are unchanged.

Validation covers the frontend production build, lint, and browser checks at desktop and mobile sizes in both themes. Browser plugin is not available in this session; local Playwright with Edge is used for visual checks.
