# AMBAR — Design Contract

## Character
A calm archive and well-kept workshop notebook—not a SaaS dashboard.

## Tokens
- Paper: `#F6F3EC`; night: `#141311`
- Ink: `#1B1A17`; night ink: `#E9E4D8`
- Amber action: `#B8621B`; hover: `#9E4F13`
- Success: `#3E6B3A`; warning: `#8A6A1F`; error: `#8A2A1F`
- Warm neutral borders/surfaces only
- Display: Fraunces; UI: Inter; numbers/meta: JetBrains Mono

## Layout
Desktop uses a restrained left library rail, central content surface, and contextual right drawer. Tablet collapses collections into a sheet. Mobile uses a top bar and compact bottom navigation; detail becomes full-screen.

## beUI usage
Use owned beUI source selectively for command palette, morphing quick-save modal, drawer/sheet, animated tabs, and toast. Retheme all components to AMBAR tokens. Motion communicates state only.

## Motion
120ms micro, 220ms transition, 320ms panel. No stagger spectacle. `prefers-reduced-motion` removes transforms and nonessential transitions.

## Accessibility
Visible 2px amber focus with offset; semantic landmarks/lists/tables; keyboard-complete primary loop; 44px touch targets on mobile; WCAG AA contrast; icon buttons have names; charts include textual values.

## Forbidden
Purple/blue SaaS gradients, glassmorphism, neon, stock illustration, decorative dashboard charts, fake AI affordances, copying a single beUI demo composition.
