# EKY Yoga Games

Interactive browser-based yoga learning and wellness games for **EKY Yoga Co. LLC** (Salyersville, Kentucky).

**Community Wellness for Everyone** — Accessible tools to move, breathe, and connect.

## Games

### 1. Pose Matching (two levels)
A single matching game with two levels you switch between with tabs:
- **Level 1 · Pose Connection** — match pose images to their names, Sanskrit, and alignment cues by clicking two cards or dragging one onto the other.
- **Level 2 · Energy Lines** — click a pose, then the gift it brings the body; an animated SVG "energy rope" draws between them. Completing Level 1 offers a shortcut into Level 2.

### 2. Sun Salutation Breath
Guided breath-timed flow through the full 12-pose sequence with an animated figure and clock progress. Hold arrows or drag to inhale/exhale.

### 3. Wellness Guide
Gamified resolver: select how you feel (anxious, low energy, stiff, short of breath, restless, scattered) → receive tailored asana + pranayama recommendations → build a personal sequence → log sessions (persisted in localStorage).

## Branding & Design
- Official logos (centered rainbow, icon, color variations) integrated.
- Palette: Rainbow arcs (#C8472A, #E8A07A, #2B6B5E, #7580BE, #F5E535) with warm neutrals.
- Calming, joyful, community-focused UI.

## Tech Stack
Single self-contained `index.html` — vanilla HTML/CSS/JS, no build step. Fonts and Font Awesome via CDN. Logos served from `./uploads/`. Ready for Wix iframe embed or Vercel standalone.

## Development
- Pose library of 60+ poses with rich metadata (Sanskrit, alignment cue, energy/gift, category). Each round draws a fresh random subset, so the matching levels stay varied across plays.
- LocalStorage stores the Wellness Guide sequence and session log.
- Responsive, mobile-friendly layout.

Deployed via Vercel. Embed URL for Wix Play page.

**EKY Yoga Co. | Salyersville, KY**

Repo: https://github.com/sczach/eky-yoga-games