# Village Gallery Kapoorpur

Hindi-first PWA website for Kapoorpur village memories, photo/video gallery, admin Gmail login, public submissions, and AdSense-ready monetization.

## What is included

- Mobile-first PWA that works well on Android browsers.
- Hindi default UI with optional English display for gallery titles.
- Memory Gallery, festivals, events, temples, school, agriculture, people, and places.
- Free Hindi helper: voice search where supported, text-to-speech, FAQ answers, smart suggestions, and admin Hindi description helper.
- Firebase Google/Gmail admin login.
- Firestore gallery records and Firebase Storage media upload hooks.
- Public submissions for admin approval.
- AdSense script support, ad-safe placement, cookie consent, Analytics hook, and policy pages.
- GitHub Pages workflow.
- Firebase Firestore and Storage rules.

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Fill `VITE_ADMIN_EMAIL` with the admin Gmail.
4. Add Firebase values after creating a Firebase project.
5. Run:

```bash
pnpm install
pnpm run dev
```

The app also works without Firebase keys by showing sample Kapoorpur content and setup instructions.

## Firebase setup

1. Create a Firebase project.
2. Enable Authentication -> Google provider.
3. Enable Firestore Database.
4. Enable Firebase Storage.
5. Add a web app and copy its config values into `.env`.
6. In `firebase.rules`, replace `YOUR_ADMIN_GMAIL@gmail.com` with the real admin Gmail.
7. In `storage.rules`, replace `YOUR_ADMIN_GMAIL@gmail.com` with the real admin Gmail.
8. Publish those rules in Firebase console.

## AdSense setup

1. Publish the site first.
2. Replace placeholder contact/domain values.
3. Add 20-30 real, original Kapoorpur posts before applying.
4. Apply for Google AdSense.
5. After approval, add:

```bash
VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
VITE_ADSENSE_SLOT_ID=xxxxxxxxxx
```

6. Replace `public/ads.txt` with the exact line Google provides.

Never click your own ads and never ask visitors to click ads.

## Google Analytics

Add this to `.env`:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Analytics loads after cookie consent.

## GitHub Pages

The repository includes `.github/workflows/deploy.yml`. After pushing to GitHub:

1. Open repository Settings.
2. Go to Pages.
3. Select GitHub Actions as the source.
4. Add repository secrets for Firebase, admin Gmail, AdSense, and Analytics when ready.
5. Push to `main`.
6. The workflow builds and publishes `dist`.

There is also a local helper for the first push:

```powershell
.\scripts\publish-github.ps1 -Token "TEMPORARY_GITHUB_TOKEN" -RepoName "village-gallery-kapoorpur"
```

Use a temporary GitHub token with `repo` and `workflow` access, then revoke it after publishing.

## Android app path

This is the best first step because it is a PWA. Villagers can open it in Chrome and use "Add to Home screen". If later publishing to Play Store as a native Android app, use AdMob for ads instead of AdSense.
