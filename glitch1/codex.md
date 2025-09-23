# Neon//Glitch Codex

## Overview
- Single-page experience built with vanilla HTML, inline CSS, and a short JavaScript snippet for timed glitch/flicker effects.
- Cyberpunk-inspired layout that relies on skewed/rotated positioning, absolute placement, and overlapping decorative layers.
- No build tooling or external dependencies besides a Google Fonts import and inline SVG cursor.

## Tech Stack
- **Markup:** `glitch1.html` (static HTML5 document).
- **Styling:** Inline `<style>` block using modern CSS (flex-free, absolute positioning) and multiple `@keyframes` animations (`glitch`, `noise`, `pulse`, `float`, `hover`, `scan`).
- **Typography:** Google Font `VT323` applied globally for a retro terminal aesthetic.
- **Scripting:** Inline `<script>` with `setInterval` timers that randomly add horizontal jitter to key elements and flicker arrow opacity.
- **Assets:** Custom neon cursor delivered via data URI SVG; no raster graphics.

## Layout & Components
- **Container:** Absolute-positioned collage of headings, text blocks, buttons, and decorative arrows/scribbles layered with `z-index` for depth.
- **Headers:** Rotated neon title (`.main-header`) with animated glitch transform; sub-headers framed with clip-path and dashed borders.
- **Content Panels:** Two text blocks featuring translucent backgrounds and neon outlines (`.text-block-1`, `.text-block-2`).
- **CTA Buttons:** `.neon-button` variations with color-specific hover states and glowing box-shadows.
- **Floating Panel:** Status card (`.floating-panel`) using double borders and hover animation to simulate levitation.
- **Navigation Stack:** Fixed-position vertical nav (`.nav-container`) with per-link color accents and hover scaling.
- **Overlays:** `div.scan-line` animated sweep and `.glitch-overlay` repeating gradient noise layer.
- **Footer HUD:** Fixed status bar broadcasting connection metrics.

## Color Palette
| Role | Hex |
| --- | --- |
| Background base | `#0a0a0f`
| Primary neon magenta | `#ff00ff`
| Cyan accents | `#00ffff`
| Green accents | `#00ff88`
| Deep purple accent | `#aa00ff`
| Body text | `#e0e0e0`
| Panel text highlight | `#e0e0ff`
| Secondary text glow | `#ccffff`
| Light HUD text | `#f0f0ff`

## Effects & Motion
- **Glitch animation:** Rapid position shifts on `.main-header` to mimic signal distortion.
- **Noise overlay:** `repeating-linear-gradient` animated by `@keyframes noise` for scanline shimmer.
- **Pulse & float:** Rotational + translation loops on decorative arrows and scribbles.
- **Hover states:** Buttons/nav links scale and intensify glow; floating status panel oscillates vertically.
- **Scanline:** Vertical sweep via `@keyframes scan` to keep the HUD active.

## Interaction Notes
- JavaScript timers run every 2s (glitch) and 1s (arrow flicker) with random thresholds; transforms appended then cleaned using regex replace.
- Absolute positioning assumes desktop viewport; responsive behavior is minimal beyond `meta viewport` tag.
- All interactivity is cosmetic; buttons and nav anchors are placeholders with `href="#"`.

## Responsive Roadmap
- Current layout locks elements with fixed widths/absolute coordinates; introduce breakpoint-driven adjustments before shipping to tablets or mobile.
- Suggested breakpoints: `@media (max-width: 1024px)` to relax rotations/padding, `@media (max-width: 768px)` to stack panels vertically, and `@media (max-width: 480px)` to swap absolute positioning for flow layout.
- Replace fixed pixel widths (`400px`, `350px`, etc.) with percentage or clamp-based sizing, and constrain neon text to avoid overflow.
- Consider reducing animation intensity on smaller screens (prefers-reduced-motion) to support accessibility.

## Future Sections & Content Hooks
- Navigation placeholders (`[ARCHIVE]`, `[DEEPNET]`, `[TERMINATE]`) can anchor to additional HTML sections once content is available.
- Prepare modular content blocks (e.g., `<section id="archive">`) so they can be toggled without disrupting the existing collage styling.
- Document any new color tokens or component variants in this codex to keep the visual language consistent across future expansions.

## Visual DNA Snapshot
- Dark backdrop drenched in neon magenta, cyan, green, and purple glows.
- Deliberately off-grid composition using `rotate`, `skew`, and `translate` transforms.
- Layered glitch vocabulary: animated header distortion plus JS-triggered jitter bursts.
- Jagged silhouettes with `clip-path` polygons and asymmetrical borders.
- Overlapping modules stacked via `z-index` to create depth and visual noise.
- Free-floating navigation links, each angled uniquely for chaotic rhythm.
- Arrow and scribble glyphs that pulse, linking sections like circuit traces.
- Continuous scan-line sweep animating down the viewport.
- Aggressive hover responses on buttons and nav anchors.
- Hovering status HUD elements that feel untethered.
- Custom SVG cursor echoing a terminal prompt.
- `VT323` typography cementing the retro terminal vibe.
- Overall effect purposefully rejects conventional UI order, embracing a restless, hacker-themed energy.
