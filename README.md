# EKY Yoga Games 

**Interactive web-based yoga learning & breathing minigames** for [EKY Yoga Co. LLC](https://your-wix-site.com) — a non-profit focused on wellness in Eastern Kentucky.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsczach%2Feky-yoga-games)

## Overview

A collection of engaging, accessible browser-based minigames designed to help people learn yoga poses, practice mindful breathing, and build body awareness. The games are lightweight, mobile-friendly, and easily embeddable into your Wix website's "Play" page via iframe.

**Core Games (MVP):**

1. **Pose Connection / Matching Game** — Learn by connecting images of yoga poses with their names, benefits, or cues.
2. **Sun Salutation Breathing Game** — Guided Surya Namaskar flow where a visual breath timer pulses and you click/tap at the right moments to transition between poses.

**Future Minigames ideas:**
- Pose Quiz (multiple choice or image identification)
- Flow Sequence Builder (drag & drop correct order)
- Pranayama Breath Timer with guided counts
- Yoga Memory Match (pairs of pose images)
- Gentle Movement Challenges or posture hold timers

## Tech Stack & Philosophy

- **Vanilla HTML + CSS + JavaScript** (no heavy frameworks for simplicity and embed-friendliness)
- **Tailwind CSS via CDN** for rapid beautiful UI (playground + production friendly)
- **HTML5 Canvas or pure CSS/JS animations** for breath visuals and interactions
- **Single-page app (SPA) structure** or lightweight multi-page with shared nav
- **Fully self-contained** where possible (or minimal external assets)
- Deploy to **Vercel** (free tier, instant previews, GitHub integration) — same as your Chord Wars project

This keeps everything simple for you + Claude Code to iterate quickly, and makes embedding into Wix straightforward and performant.

## Project Structure (Planned)

```
eky-yoga-games/
├── README.md
├── index.html          # Main hub / menu + game launcher
├── styles.css          # Or Tailwind inline + custom
├── script.js           # Shared logic, game manager
├── games/
│   ├── pose-match.js   # Or inline modules
│   ├── breath-game.js
│   └── ...
├── assets/
│   ├── poses/          # Images or SVGs of asanas
│   └── icons/          # UI icons, breath visuals
├── vercel.json       # Optional config
└── .gitignore
```

Start simple: one `index.html` with everything for rapid prototyping, then modularize.

## Game 1: Pose Connection / Matching Game

**Goal:** Help users learn the visual appearance + Sanskrit/English names + key alignment cues or benefits of foundational poses.

**Gameplay ideas:**
- Grid of pose images (cards that flip or are clickable)
- Separate column or modal of text cards (name + short description)
- Match by clicking image then text, or drag-and-drop, or classic memory flip pairs
- Scoring: accuracy, time, streaks. Levels by difficulty (beginner foundational vs advanced)
- Hint system or "learn mode" toggle
- Progress tracker (localStorage) — "You've mastered 12/30 poses"

**Visuals:** Clean cards with high-quality pose photos or beautiful line-art/SVG illustrations. Soft earth tones, calming greens/blues.

**Accessibility:** Alt text on images, keyboard navigation, ARIA labels, high-contrast mode.

## Game 2: Sun Salutation Breathing Game (Core Experience)

**Concept:** A dynamic, guided Surya Namaskar practice where the breath leads the movement. Visual breath indicator + pose sequence that advances on correct timing.

**Breath Mechanics:**
- Visual "breath orb" or expanding/contracting circle (CSS transform + transition or Canvas)
- Phases synced to traditional or accessible counts, e.g.:
  - Inhale 4 counts → Expand + Mountain Pose (Tadasana)
  - Exhale 4 → Forward Fold (Uttanasana)
  - Inhale 4 → Half Lift / Flat Back
  - Exhale 4 → Plank or Chaturanga
  - etc. through full flow (or simplified accessible version)
- User clicks "Next / Transition" button or the orb itself when they feel the breath cue to change posture.
- Real-time feedback: "Perfect timing!" / "A little early/late" with visual/audio cues (gentle chimes or silent for meditation focus)
- Completion score based on timing accuracy across the sequence. Multiple rounds or progressive flows.

**Pose Sequence (Classic Sun Sal A adapted for game):**
1. Mountain Pose (Tadasana)
2. Forward Fold (Uttanasana)
3. Halfway Lift (Ardha Uttanasana)
4. Plank (Phalakasana) or Low Plank (Chaturanga)
5. Upward-Facing Dog (Urdhva Mukha Svanasana)
6. Downward-Facing Dog (Adho Mukha Svanasana)
7. Forward Fold
8. Halfway Lift
9. Mountain
(Repeat or flow variations)

**Features to build:**
- Breath phase indicator (text + color + animation speed)
- Current pose large visual + upcoming pose preview
- Adjustable breath pace (slow for beginners, faster for flow)
- Sound options (optional gentle guidance voice or just tones)
- Session history / best scores (local)

This game teaches the critical mind-breath-body connection at the heart of yoga.

## Wix Embedding Guide (for your "Play" webpage)

### Recommended Approach (Best UX & Maintainability)

1. **Develop & Deploy the full games hub to Vercel**
   - Connect this GitHub repo to Vercel (one-click)
   - Every push = instant preview deploy + production
   - Get a URL like `https://eky-yoga-games.vercel.app`

2. **Embed into Wix (free plan works)**
   - Go to your Wix Editor → "Play" page
   - Click **Add Elements** → **Embed & Social** → **Embed Code** (or HTML iFrame element)
   - Choose **Embed a Site** and paste your full Vercel URL
   - Or paste a custom `<iframe>` snippet for more sizing control:
     ```html
     <div style="position: relative; padding-bottom: 75%; height: 0; overflow: hidden; max-width: 100%;">
       <iframe 
         src="https://eky-yoga-games.vercel.app" 
         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"
         allowfullscreen
         title="EKY Yoga Games - Play & Learn">
       </iframe>
     </div>
     ```
   - Adjust height/width in Wix element settings. Make it tall enough for comfortable play (800–1200px recommended).

### Why this is better than pasting raw multi-file HTML/JS directly into Wix embed:
- Full control over game code, assets, updates (no copy-paste hell)
- Better performance & caching via Vercel CDN
- Easy version control + Claude Code collaboration
- Sandbox limitations in Wix HTML embed are avoided for complex interactions
- Responsive design works great inside iframe

### Tips for Smooth Integration
- Add a big **"Play Fullscreen / Open in New Tab"** button at top of game hub (important for mobile/iframe UX)
- Use consistent branding (EKY Yoga colors, logo placeholder)
- Test on mobile — many users will play on phones
- Keep initial load fast (<3s ideal)
- Consider a lightweight loading screen with yoga quote or breath animation

**Wix Free vs Premium note:** Embeds work on free. Premium removes Wix ads from your site and allows custom domain (e.g. play.ekyyoga.org) which looks more professional as the project grows.

## Development Roadmap & How to Contribute / Iterate

**Phase 1 (MVP - 1-2 weeks with Claude Code):**
- [ ] Basic hub UI with Tailwind (menu cards for each game)
- [ ] Pose matching game core (static images + matching logic, scoring)
- [ ] Sun Sal breath game core (animated breath orb + timed pose transitions + basic scoring)
- [ ] Responsive design + accessibility basics
- [ ] Deploy to Vercel + test embed in Wix

**Phase 2:**
- Polish animations, sound (Web Audio API gentle tones), levels, local progress saving
- Add 1-2 more minigames
- Pose image assets (high quality or beautiful SVGs)
- Theming & EKY branding

**Phase 3:**
- User accounts / progress sync (optional, later)
- Shareable scores or community features
- Integration with your broader EKY Yoga site (e.g. link to classes, donation, events)

## Getting Started (You + Claude Code)

1. Clone or work directly in this repo
2. Open `index.html` in browser or use Live Server / Vercel dev
3. Prompt Claude with specific tasks, e.g.:
   - "Build the pose matching game UI and logic in a new section of index.html using Tailwind cards and JS matching"
   - "Create a smooth CSS/JS breathing orb animation synced to 4-second inhale/exhale phases"
   - "Implement the full Sun Salutation sequence with clickable transitions and timing score"
4. Commit & push → Vercel auto-deploys preview
5. Test embed in your Wix site

## Assets & Images

- Yoga pose images/SVGs: We can use free sources (Unsplash, Pexels with attribution, or Wikimedia) or generate clean line-art style with tools. Commit to `/assets/poses/`.
- For rapid prototyping: Use placeholder services or simple emoji + text first, then upgrade.
- I (Grok) can help generate initial pose illustrations via image tools if you describe the exact poses/styles needed.

## Accessibility & Wellness Focus

All games should feel calming, not gamified in a stressful way. Prioritize:
- Clear instructions & gentle feedback
- Adjustable pacing
- No harsh sounds or flashing
- Mobile touch-friendly large targets
- Screen reader support
- Option for "guided mode" vs "challenge mode"

This project supports EKY Yoga Co.'s mission of accessible wellness education in the community.

## License & Vision

Open for personal/educational use. As the non-profit grows, we can decide on licensing.

Let's build something beautiful that helps people connect with their breath and body. 

**Next step:** Tell me which game to prototype first or what starter files you'd like me to add to the repo (e.g. basic index.html scaffold with Tailwind + two game placeholders). I'm ready to help build it out with you and Claude Code.

---

*Part of EKY Yoga Co. LLC — Eastern Kentucky wellness initiatives*