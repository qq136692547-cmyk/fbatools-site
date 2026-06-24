# FBATools

Free Amazon FBA calculator and seller tools.

- Domain: https://fbatools.zh.kg
- Stack: Static HTML + CSS + vanilla JavaScript (no build step)
- Hosting: GitHub Pages

## Pages

- `/` — Home
- `/tools/fba-calculator/` — Amazon FBA fee & profit calculator
- `/tools/profit-calculator/` — FBA vs FBM profit comparison
- `/tools/fba-vs-fbm/` — Redirects to profit calculator
- `/blog/` — Blog index
- `/blog/amazon-fba-fees-2026/` — 2026 fee breakdown
- `/about/` — About page
- `/privacy/` — Privacy policy

## Local preview

```bash
# From the project root:
python -m http.server 8000
# Then open http://localhost:8000
```

## Deploy

```bash
git push origin main
# GitHub Pages auto-deploys from the `main` branch.
```

## License

MIT