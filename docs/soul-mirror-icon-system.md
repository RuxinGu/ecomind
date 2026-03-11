# EcoMind Icon System (MVP)

This app now includes an 8-dimension, 3-band icon system (24 icons total) in the mobile results UI.

## Implemented

- 24 structured icons (`high` / `mid` / `low`) for dimensions `A`..`H`
- Shape-first encoding (not color-only) for accessibility
- Visible labels/chips next to icon states
- 24x24 default icon size with consistent stroke-like construction
- Accessible labels via `accessibilityRole="image"` and `accessibilityLabel`

## Files

- `/Users/guruxin/Documents/Playground/apps/mobile/src/components/DimensionIcons.tsx`
- `/Users/guruxin/Documents/Playground/apps/mobile/src/screens/ResultsScreen.tsx`

## Palette Tokens (Light)

- A Reflection: `#0072B2`
- B Cognitive: `#4B9DCC`
- C Emotional: `#009E73`
- D Secure: `#CC79A7`
- E Social: `#C68900`
- F Structure: `#2D2D2D`
- G Conflict: `#D55E00`
- H Growth: `#9F972C`

## Usage Rules

- Always pair icon with visible text (`band`, title, and/or label).
- Do not rely on color alone.
- Keep meaningful icons at 24x24 when possible; avoid below 16x16.
- If icon is interactive, use a minimum 48x48 tap target.
- Keep motion brief (100–500ms) and only for state change emphasis.

## Export Naming (for design handoff)

- `A_mirror_star`, `A_mirror_glint`, `A_mirror_arrow`
- `B_path_branching`, `B_path_split_rejoin`, `B_path_straight`
- `C_wave_calm`, `C_wave_settling`, `C_wave_surge`
- `D_rings_interlock`, `D_rings_touch`, `D_rings_bridge`
- `E_orbit_one`, `E_orbit_two`, `E_orbit_three`
- `F_blocks_aligned`, `F_blocks_staggered`, `F_blocks_floating`
- `G_bubbles_loop`, `G_bubbles_link`, `G_bubbles_pause`
- `H_sprout`, `H_bud`, `H_seed`

