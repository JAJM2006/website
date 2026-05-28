# jajm2006.uk — Personal Portfolio & CV

Personal portfolio and academic CV of Joshua McManus (JAJM2006). Built with Astro, deployed via Cloudflare Workers.

🌐 **Live site:** [www.jajm2006.uk](https://www.jajm2006.uk)

---

## Overview

A static portfolio site showcasing academic works, personal projects, and a curriculum vitae. Designed for researchers, collaborators, and postgraduate networks in the fields of geostrategy, security, and development studies.

## Stack

- **Framework:** [Astro](https://astro.build) with Svelte and MDX support
- **Styling:** Vanilla CSS with dark/light theme toggle
- **Fonts:** EB Garamond + JetBrains Mono (Google Fonts)
- **Deployment:** Cloudflare Workers (via GitHub → Cloudflare Pages CI)
- **Domain:** `jajm2006.uk` (registered UK domain)

## Project Structure

```
/
├── public/
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   └── pages/
│       └── index.html       # Main portfolio page
├── astro.config.mjs
└── package.json
```

## Local Development

```bash
npm install
npm run dev        # Dev server at localhost:4321
npm run build      # Build to ./dist/
npm run preview    # Preview production build locally
```

## Deployment

This site deploys automatically via Cloudflare Workers on every push to the `main` branch. No manual deployment steps required.

## SEO

- Sitemap available at [`/sitemap-index.xml`](https://www.jajm2006.uk/sitemap-index.xml)
- Submitted to Google Search Console and Bing Webmaster Tools
- OpenGraph and canonical tags configured

## Contact

**Joshua McManus**
- Email: [Joshua@jajm2006.uk](mailto:Joshua@jajm2006.uk)
- GitHub: [github.com/JAJM2006](https://github.com/JAJM2006)
- LinkedIn: [linkedin.com/in/JAJM2006](https://linkedin.com/in/JAJM2006)
- ORCID: [0009-0004-5910-7707](https://orcid.org/0009-0004-5910-7707)

---

*"Onwards Forevermore"*
