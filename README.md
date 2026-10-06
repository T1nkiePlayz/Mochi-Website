<p align="center">
  <img src="https://github.com/T1nkiePlayz/Mochi-Website/blob/main/mochi.png?raw=true" alt="Mochi Logo" width="300">
</p>
<h1 align="center">Mochi Website</h1>


Mochi Web is the public-facing website and authenticated portal for Mochi, a flexible game launcher designed around local-first gaming and cloud metadata sync.


## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase


## Quick start

```bash
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 4173
```


## Included pages

- Home
- Features
- How Mochi Works
- Download
- Documentation
- FAQ
- Status
- Sign In
- Dashboard
- Account settings
- Admin metadata-access panel


## Notes

The site is intentionally designed to be GitHub Pages friendly and uses a hash router for static hosting compatibility. Cloud sync messaging stays local-first and clarifies that large game files remain on the user’s device while metadata is synchronized.
