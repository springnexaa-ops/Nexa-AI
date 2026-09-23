---
version: alpha
name: Claude-inspired-design-reference
source: getdesign.md Claude catalog
note: Independent design reference adapted for Nexa AI. Do not use Anthropic or Claude logos, names, or proprietary assets.
---

# Nexa AI — Claude-inspired editorial design reference

This reference is based on the public Claude design analysis distributed by getdesign.md. It is used only as a visual starting point for Nexa AI; Nexa keeps its own SpringNexa identity, logo, copy and product semantics.

## Visual direction

- Warm editorial AI interface.
- Tinted cream canvas rather than pure white.
- Warm terracotta/coral as a restrained action accent.
- Warm near-black ink.
- Dark product surfaces for chat/code/data panels.
- Generous whitespace and 4px spacing rhythm.
- Serif display headlines with a humanist sans-serif UI/body.
- Minimal shadows; depth primarily comes from surface contrast.
- 8px controls, 12px content cards, 16px larger containers, pill badges.
- Responsive 1-column mobile, 2-column tablet, 3-column desktop content grids.
- Preserve Nexa's SpringNexa logo and J&K identity.

## Adapted Nexa tokens

```css
--nexa-canvas:#faf9f5;
--nexa-surface:#f5f0e8;
--nexa-card:#efe9de;
--nexa-ink:#141413;
--nexa-body:#3d3d3a;
--nexa-muted:#6c6a64;
--nexa-line:#e6dfd8;
--nexa-coral:#cc785c;
--nexa-coral-active:#a9583e;
--nexa-dark:#181715;
--nexa-dark-elevated:#252320;
--nexa-on-dark:#faf9f5;
--nexa-success:#5db872;
--nexa-warning:#d4a017;
--nexa-error:#c64545;
```

## Typography

Display:
- Cormorant Garamond / EB Garamond / Georgia, serif
- Weight 400–500
- Tight tracking
- 64px desktop hero, 48px section, 36px subsection, 28px compact display

UI/body:
- Inter / system sans
- 14–16px body
- 12–14px labels
- 500 for controls

Code:
- JetBrains Mono / ui-monospace

## Components

### Navigation
- 64px desktop header.
- Warm canvas.
- Nexa logo at left.
- Compact product navigation.
- Sign-in/account controls at right.
- Mobile collapses to compact navigation.

### Primary button
- Coral background.
- White text.
- 8px radius.
- 40–44px minimum touch height.
- Darker coral on active/pressed state.

### Secondary button
- Canvas or transparent background.
- Ink text.
- 1px warm hairline border.
- 8px radius.

### Feature card
- Warm cream card.
- 12px radius.
- 24–32px internal padding.
- Minimal/no shadow.

### AI product panel
- Near-black warm surface.
- Cream text.
- 12px radius.
- Use for chat output, code, model status and technical data.

### Composer
- Warm cream/light surface in editorial mode.
- Dark product surface in dark mode.
- Clear text area.
- Single primary action.
- File/voice actions remain secondary.

### Healthcare
Nexa Medical retains its own medical safety styling and content. Claude-inspired visual tokens may influence spacing, cards and typography but must not remove medical disclaimers, evidence provenance or clinician-review messaging.

## Responsive

- <768px: single column, touch-first controls, compact header.
- 768–1024px: two-column content where appropriate.
- >1024px: three-column feature grids and generous 1200px max content width.
- Preserve keyboard accessibility and visible focus states.
- Do not hide essential navigation behind hover-only interactions.

## Eco adaptation

- Prefer CSS gradients and solid surfaces over large photographic backgrounds.
- Avoid unnecessary blur and continuous animation.
- Respect prefers-reduced-motion.
- Lazy-load nonessential media.
- Keep decorative imagery optional.
- Use system fonts unless a licensed font is explicitly available.

## Brand boundary

Use the Claude aesthetic as inspiration only. Do not reproduce Anthropic's logo, wordmark, proprietary assets, or imply affiliation or endorsement. Nexa AI remains a SpringNexa product.
