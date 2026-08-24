import type { PagesConfig } from "../types";

export const PAGES: PagesConfig = {
    home: {
        title: "About Me",
        subtitle: "",
        isActive: true,
    },
    blog: {
        title: "Blog",
        subtitle: "Thoughts and updates.",
        isActive: false,
    },
    publications: {
        title: "Publications",
        subtitle: "A collection of papers, essays, and articles.",
        isActive: true,
    },
    suggestions: {
        title: "Suggestions & Presentations",
        subtitle: "Stuff that has helped me get here.",
        isActive: true,
    },
    projects: {
        title: "Code & Projects",
        subtitle: "Open source contributions and experiments.",
        isActive: false,
    },
    teaching: {
        title: "Teaching",
        subtitle: "My notes and educational materials.",
        isActive: true,
    },
    tags: {
        title: "Tags",
        subtitle: "Explore content by topic.",
        isActive: false,
    },
    cv: {
        title: "Curriculum Vitae",
        subtitle: "Postgrad studying Development-Security at Newcastle University. Fast and adaptive learner with growing independent study in CFD and GIS analysis. Strong grounding in analytical reasoning, and strategic evaluation across geographical, strategic, and technical domains gained through both academic studies and personal interests.",
        isActive: true,
    },
};
