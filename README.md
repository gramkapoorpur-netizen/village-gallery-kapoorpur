# Village Gallery Kapoorpur

Hindi-first PWA website for Kapoorpur village memories, photo/video gallery, admin Gmail login, public submissions, and community sharing.

## What is included

- Mobile-first PWA that works well on Android browsers.
- Hindi default UI with optional English display for gallery titles.
- Memory Gallery, festivals, events, temples, school, agriculture, people, and places.
- Cinematic Memory Book for turning village memories like pages and sharing each story.
- Village Circle community feed with local posts, reactions, comments, saved posts, daily prompts, and sharing.
- Free Hindi helper: voice search where supported, text-to-speech, FAQ answers, smart suggestions, and admin Hindi description helper.
- Firebase Google/Gmail admin login.
- Firestore gallery records and Firebase Storage media upload hooks.
- Public submissions for admin approval.
- Cookie consent, Analytics hook, privacy pages, and community-safe content controls.
- GitHub Pages workflow.
- Firebase Firestore and Storage rules.

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. `VITE_ADMIN_EMAIL` is already set to `singhmanoj2704@gmail.com`; change it only if the admin Gmail changes.
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
6. In `firebase.rules`, confirm the admin Gmail is `singhmanoj2704@gmail.com`.
7. In `storage.rules`, confirm the admin Gmail is `singhmanoj2704@gmail.com`.
8. Publish those rules in Firebase console.

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
4. Add repository secrets for Firebase, admin Gmail, and Analytics when ready.
5. Push to `main`.
6. The workflow builds and publishes `dist`.

There is also a local helper for the first push:

```powershell
.\scripts\publish-github.ps1 -Token "TEMPORARY_GITHUB_TOKEN" -RepoName "village-gallery-kapoorpur"
```

Use a temporary GitHub token with `repo` and `workflow` access, then revoke it after publishing.

## Android app path

This is the best first step because it is a PWA. Villagers can open it in Chrome and use "Add to Home screen". If later publishing to Play Store as a native Android app, wrap the same community features in a native shell.
