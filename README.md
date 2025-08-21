
# FastFlow

A lightweight, privacy-first intermittent fasting tracker with a Material UI design. Runs entirely on your device (IndexedDB), works offline, and can be installed as a PWA.

## Features
- Circular live timer with target ring
- Start fast quickly: 16/8, 18/6, 20/4, OMAD
- Phase badges: 3h blood sugar drop, 5h gluconeogenesis, 8h ketosis, 12h fat burning, 18h autophagy
- Weekly history chart + streak counter
- Export/Import JSON for backup/migration
- PWA-ready (install on phone), offline support

## Local Dev
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages
This repo already includes a GitHub Action at `.github/workflows/deploy.yml`.
Push to `main` and Pages will publish automatically.

If your repository is **not** a user/organization site (i.e., it's a project page), the workflow sets the proper `BASE_URL` so assets work at `/<repo>/`.
