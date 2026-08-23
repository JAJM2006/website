import type { NavLink } from "../types";

export const NAV_LINKS: NavLink[] = [
    { href: "/", label: "About", isActive: true },
    { href: "/publications", label: "Publications", isActive: true },
    { href: "/suggestions", label: "Suggestions", isActive: true },
    { href: "/teaching", label: "Teaching", isActive: true },
    { href: "/projects", label: "Code", isActive: false },
    { href: "/posts", label: "Blog", isActive: false },
    { href: "/tags", label: "Tags", isActive: false },
    { href: "/cv", label: "CV", isActive: true },
];
