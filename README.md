# Skill Mastery Timer

An offline-first practice tracker for Windows and modern browsers. Track focused time toward a chosen practice horizon. Hour targets help protect practice time; reaching a target does not guarantee mastery.

## Requirements

- Windows 10 or later
- Node.js 20.19+ or 22.12+ (LTS recommended), which includes npm
- A current Chromium-based browser for the most complete PWA and cross-tab support

## Install and run

Open PowerShell in this folder:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Use from VS Code on Windows

This project is stored on the local PC at `C:\Users\f.a\Documents\ChatGPT\cursor\skill-mastery-timer` (it is not cloud-only). In PowerShell, open that folder in VS Code:

```powershell
cd C:\Users\f.a\Documents\ChatGPT\cursor\skill-mastery-timer
code .
```

In VS Code, open **Terminal → New Terminal** and run `npm install` once if dependencies are not installed, then run:

```powershell
npm run dev
```

Keep that terminal running while using the app at `http://localhost:5173/`. Vite is pinned to this localhost port and configured to fail clearly if the port is already in use, instead of silently starting on another port. If the URL already responds, a server is running; reuse it rather than starting a second copy.

## Production build and preview

```powershell
npm run build
npm run preview
```

Vite prints the local preview URL, usually `http://localhost:4173`.

## Install as an app

First open the production preview (or a deployed HTTPS build) in Microsoft Edge or Chrome. Use the install icon in the address bar or the browser menu's **Install Skill Mastery Timer** option. The service worker caches the built application shell and local assets after the first successful load. Personal practice data stays in IndexedDB and is not cached as a network resource.

## XP and achievements

Base XP is derived from verified saved session records: each complete 60 seconds contributes 1 XP. Overlapping recorded intervals are counted once, and duplicate session IDs do not add time. XP is separate from mastery-hour progress and is never awarded for previews, settings, or audio tests. Streak bonuses are a separate XP ledger and never change practiced hours. A local calendar day qualifies at 15 verified minutes; sessions that cross midnight are split at local midnight and multiple sessions on a day are combined. Qualifying streak bonuses are +25 XP at 3 days, +100 at 7 days, +500 at 30 days, and +2,000 at 100 days. Each bonus is recorded by streak start date and milestone in the backup data, so reloads and restores cannot pay the same streak milestone twice. The dashboard shows current and longest streaks and the next milestone; Session History shows a 30-day qualifying-practice heatmap.

Level 1 requires 100 XP to reach Level 2. Each later level costs 50 XP more than the previous level: Level 2 to 3 requires 150 XP, Level 3 to 4 requires 200 XP, and so on. Progress is calculated from the current saved history, so backup restore does not add a second reward. Other achievement-gallery milestones are informational; streak XP is issued only from the durable streak reward ledger.

## Backups

Open **Settings → Export data** and save the JSON backup somewhere safe. To restore it, choose **Import backup**, select the JSON file, and confirm replacement of local data. Unsupported or malformed files are rejected without changing current data. Version 5 backups include the durable streak reward ledger as well as custom celebration audio when selected; versions 1 through 4 remain importable. Imported streak rewards are checked against the saved qualifying practice history, and duplicate or unsupported reward records are rejected. Import and clear operations replace/remove all local app data. Custom MP3, WAV, OGG, or M4A files up to 10 MB are stored locally in IndexedDB; actual playback support depends on the browser.

## Test offline operation

Run `npm run build` and `npm run preview`, open the preview online once, then use browser developer tools to switch to offline mode and reload. For install/update checks, use the production preview or HTTPS, since browser service workers are not enabled on ordinary remote HTTP origins.

## Timing and browser limits

Elapsed time is derived from timestamps and persisted in five-second checkpoints. On reopening after an interrupted run, the app recovers only checkpointed time and marks the session paused. The current uncheckpointed interval is deliberately discarded. Closing/suspending behavior depends on the browser; web apps cannot guarantee that shutdown handlers execute. Web Locks serialize updates across tabs where available. Audio also depends on browser permission and prior interaction; visual alerts always remain available.

## Privacy

No accounts, backend, analytics, or cloud services. Skills and history are stored on this browser profile in IndexedDB. Clear browser site data or use Settings to permanently remove them.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start the local development server
- `npm test` — run deterministic domain tests
- `npm run build` — type-check and produce the production PWA in `dist/`
- `npm run preview` — serve the production build locally
