// src/utils/works.ts
import fs from "node:fs";
import path from "node:path";

export interface WorksFileMeta {
    title?: string;
    abstract?: string;
    status?: string; // e.g. "Complete", "Ongoing"
}

export interface WorksNode {
    name: string;
    path: string;
    type: "folder" | "file";
    ext?: string;
    meta?: WorksFileMeta;
    children?: WorksNode[];
}

const WORKS_ROOT = path.resolve("public/works");

function naturalSort(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function readMeta(dir: string): Record<string, WorksFileMeta> {
    const metaPath = path.join(dir, "_meta.json");
    if (!fs.existsSync(metaPath)) {
        return {};
    }
    try {
        const raw = fs.readFileSync(metaPath, "utf-8");
        return JSON.parse(raw);
    } catch (err) {
        console.warn("Failed to parse _meta.json at " + metaPath, err);
        return {};
    }
}

export function buildWorksTree(dir: string = WORKS_ROOT, relative: string = ""): WorksNode[] {
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const metaMap = readMeta(dir);

    const folders = entries
        .filter((e) => e.isDirectory())
        .sort((a, b) => naturalSort(a.name, b.name))
        .map((e) => {
            const relPath = relative ? relative + "/" + e.name : e.name;
            return {
                name: e.name,
                path: relPath,
                type: "folder" as const,
                children: buildWorksTree(path.join(dir, e.name), relPath),
            };
        });

    const files = entries
        .filter((e) => e.isFile() && e.name !== "_meta.json")
        .sort((a, b) => naturalSort(a.name, b.name))
        .map((e) => {
            const relPath = relative ? relative + "/" + e.name : e.name;
            return {
                name: e.name,
                path: relPath,
                type: "file" as const,
                ext: path.extname(e.name).slice(1).toLowerCase(),
                meta: metaMap[e.name] || undefined,
            };
        });

    return [...folders, ...files];
}

export function findNode(tree: WorksNode[], segments: string[]): WorksNode[] | null {
    if (segments.length === 0) return tree;
    const head = segments[0];
    const rest = segments.slice(1);
    const node = tree.find((n) => n.name === head && n.type === "folder");
    if (!node || !node.children) return null;
    return findNode(node.children, rest);
}

export function getAllFolderPaths(tree: WorksNode[]): string[][] {
    let result: string[][] = [];
    for (const node of tree) {
        if (node.type === "folder") {
            result.push(node.path.split("/"));
            if (node.children) result = result.concat(getAllFolderPaths(node.children));
        }
    }
    return result;
}