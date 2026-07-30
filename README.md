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
website/
├── .gitignore
├── .npmrc
├── .stackblitzrc
├── LICENSE
├── MEDIA_SETUP.md
├── README.md
├── astro.config.mjs
├── cv.html
├── functions/
│   ├── _utils.js
│   └── api/
│       ├── admin/
│       │   ├── file.js
│       │   ├── galleries.js
│       │   ├── login.js
│       │   ├── logout.js
│       │   ├── otp.js
│       │   └── upload-url.js
│       └── media/
│           ├── file/
│           │   └── [[path]].js
│           ├── list.js
│           ├── login.js
│           ├── logout.js
│           └── otp.js
├── package.json
├── public/
│   ├── 404.html
│   ├── _redirects
│   ├── cv-old.pdf
│   ├── cv.pdf
│   ├── favicon.ico
│   ├── favicon/
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   └── favicon.ico
│   ├── og-image.png
│   ├── robots.txt
│   ├── site.webmanifest
│   └── works/
│       ├── PG/
│       │   └── MSc/
│       │       ├── T1/
│       │       │   └── potatoes.potato
│       │       └── T2/
│       │           └── potato.potato
│       └── UG/
│           ├── Y1/
│           │   ├── 24T4/
│           │   │   ├── DPMA-ESSAY.pdf
│           │   │   ├── INPT-ESSAY.pdf
│           │   │   └── ITTB-ESSAY.pdf
│           │   ├── 25T1/
│           │   │   ├── CYCH-ESSAY.pdf
│           │   │   ├── FIOS-ESSAY.pdf
│           │   │   └── FOGS-ESSAY.pdf
│           │   ├── 25T2/
│           │   │   ├── DSEC-ESSAY.pdf
│           │   │   ├── NSCA-ESSAY.pdf
│           │   │   └── TECO-ESSAY.pdf
│           │   └── 25T3/
│           │       └── IIEM-ESSAY.pdf
│           └── Y2/
│               ├── 25T4/
│               │   ├── CCSD-ESSAY.pdf
│               │   ├── DNAC-CANNABIS.pdf
│               │   └── DNAC-FGG.pdf
│               ├── 26T1/
│               │   ├── GSIL-ESSAY.pdf
│               │   └── MSSC-ESSAY.pdf
│               ├── 26T2/
│               │   ├── NACI-CELLULAR.pdf
│               │   └── NACI-MONEY.pdf
│               └── 26T3/
│                   └── dissertation.md
├── sandbox.config.json
├── src/
│   ├── pages/
│   │   ├── index.html
│   │   ├── media/
│   │   │   ├── admin.html
│   │   │   └── index.html
│   │   ├── spark/
│   │   │   └── index.html
│   │   └── works/
│   │       └── index.html
│   └── potato/
│       └── potato.potato
└── tsconfig.json

```

## Pages

- **Home** — Portfolio, academic works summary, projects, CV, and contact
- **Works** — Full academic works archive, arranged by term with abstracts and PDF downloads
- **SPARK** — The SPARK Group open-source collective and project documentation
- **Media** (`/media/`) — Password-protected photo/video galleries, backed by Cloudflare
  R2 + KV + Pages Functions. See [`MEDIA_SETUP.md`](./MEDIA_SETUP.md) for one-time
  Cloudflare dashboard setup (bindings + secrets) and usage.

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
