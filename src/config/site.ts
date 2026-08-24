import type { SiteConfig, ThemeConfig, SettingsConfig, UmamiAnalyticsConfig, AnalyticsConfig } from "../types";

export const SITE: SiteConfig = {
    website: "https://www.JAJM2006.uk",
    author: "Joshua McManus",
    desc: "My Website",
    title: "Joshua McManus",
    ogImage: "website.webp",
    postPerPage: 5,
    favicon: "/favicon.png",
    lang: "en",
};

export const THEME_CONFIG: ThemeConfig = {
    lightAndDark: true,
    themeLight: "light_notepad",
    themeDark: "dark_notepad",
};

export const SETTINGS: SettingsConfig = {
    showTagsInNavbar: true,
    showRSSInFooter: true,
    addDevToolsInProduction: true,
};

const umami: UmamiAnalyticsConfig = {
    websiteId: "3c8f8af9-b538-49c5-8f17-efde5e3004f2", // e.g., 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    src: "https://cloud.umami.is/script.js", // Default Umami cloud script URL
}

export const ANALYTICS: AnalyticsConfig = {
    // Google Analytics 4 Measurement ID (e.g., 'G-XXXXXXXXXX')
    ga4Id: "",
    // Umami Analytics configuration
    umami: umami
};
