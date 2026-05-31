```markdown
# jajm2006.uk | Personal Portfolio & CV

A personal portfolio and online CV. Built with Astro, deployed via Cloudflare Pages.

🌐 **Live site:** [www.jajm2006.uk](https://www.jajm2006.uk)

---

## Overview

A static portfolio site showcasing academic works, personal projects, and a curriculum vitae. Designed for researchers, collaborators, and postgraduate networks in the fields of geostrategy, security, and development studies.

## Stack

- **Framework:** [Astro](https://astro.build) with Svelte and MDX support
- **Styling:** Vanilla CSS with dark/light theme toggle
- **Fonts:** EB Garamond + JetBrains Mono (Google Fonts)
- **Deployment:** Cloudflare Pages (via GitHub CI)
- **Domain:** `jajm2006.uk` (registered UK domain)

## Project Structure

```
/
├── public/
│   ├── favicon/
│   ├── works/
│   │   ├── UG/
│   │   │   ├── Year 1/      # Undergraduate Essays (Year 1, 2024-2025)
│   │   │   └── Year 2/      # Undergraduate Essays (Year 2, 2025-2026)
│   │   └── PG/
│   │        └── Masters/    # Postgraduate Essays (Masters, 2026-2027)
│   ├── 404.html
│   ├── cv.pdf
│   ├── og-image.png
│   ├── robots.txt
│   └── site.webmanifest
├── src/
│   └── pages/
│       ├── index.html       # Main portfolio & CV
│       ├── works/
│       │   └── index.html   # Academic works archive
│       └── spark/
│           └── index.html   # The SPARK Group
├── LICENSE                  # The original License that accompanied the Astro Template
├── README.md
├── astro.config.mjs
├── package.json
├── sandbox.config.json
└── tsconfig.json
```

## Pages

- **Home** — Portfolio, academic works summary, projects, CV, and contact
- **Works** — Full academic works archive, arranged by term with abstracts and PDF downloads
- **SPARK** — The SPARK Group open-source collective and project documentation

## Deployment

Deploys automatically via Cloudflare Pages on every push to `main`.

## SEO

- Sitemap at [`/sitemap-index.xml`](https://www.jajm2006.uk/sitemap-index.xml)
- Submitted to Google Search Console and Bing Webmaster Tools
- OpenGraph image, canonical tags, and Twitter card configured

## Contact

**Joshua McManus**
- GitHub: [github.com/JAJM2006](https://github.com/JAJM2006)
- LinkedIn: [linkedin.com/in/JAJM2006](https://linkedin.com/in/JAJM2006)
- ORCID: [0009-0004-5910-7707](https://orcid.org/0009-0004-5910-7707)

---

*"Onwards Forevermore"*
```
