import type { SocialLink } from "../types";

export const SOCIALS: SocialLink[] = [
    {
        name: "Github",
        href: "https://github.com/JAJM2006",
        linkTitle: `Follow Joshua on Github`,
        isActive: true,
    },
    {
        name: "Mail",
        href: "mailto:mail@JAJM2006.uk",
        linkTitle: `Send an email to Joshua`,
        isActive: true,
    },
    {
        name: "Google Scholar",
        href: "https://scholar.google.com/citations?user=JAJM2006",
        linkTitle: `Joshua on Google Scholar`,
        isActive: true,
    },
    {
        name: "ORCID",
        href: "https://orcid.org/0009-0004-5910-7707",
        linkTitle: `Joshua on ORCID`,
        isActive: true,
    },
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/JAJM2006/",
        linkTitle: `Joshua on LinkedIn`,
        isActive: true,
    },
];

export const SOCIAL_ICONS: Record<string, string> = {
    Github: "Github",
    Mail: "Mail",
    Linkedin: "LinkedIn",
    "Google Scholar": "GoogleScholar",
    ORCID: "ORCID",
    RSS: "RSS",
};