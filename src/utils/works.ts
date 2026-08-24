import fs from "node:fs";
import path from "node:path";

export interface WorksNode {
    name: string;
    path: string;
    type: "folder" | "file";
    ext?: string;
    children?: WorksNode[];
}

const WORKS_ROOT = path.resolve("public/works");

function naturalSort(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function buildWorksTree(dir: string = WORKS_ROOT, relative: string = ""): WorksNode[] {
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const folders = entries
        .filter((e) => e.isDirectory())
        .sort((a, b) => naturalSort(a.name, b.name))
        .map((e) => {
            const relPath = relative ? `${relative}/${e.name}` : e.name;
            return {
                name: e.name,
                path: relPath,
                type: "folder" as const,
                children: buildWorksTree(path.join(dir, e.name), relPath),
            };
        });

    const files = entries
        .filter((e) => e.isFile())
        .sort((a, b) => naturalSort(a.name, b.name))
        .map((e) => {
            const relPath = relative ? `${relative}/${e.name}` : e.name;
            return {
                name: e.name,
                path: relPath,
                type: "file" as const,
                ext: path.extname(e.name).slice(1).toLowerCase(),
            };
        });

    return [...folders, ...files];
}

export function findNode(tree: WorksNode[], segments: string[]): WorksNode[] | null {
    if (segments.length === 0) return tree;
    const [head, ...rest] = segments;
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