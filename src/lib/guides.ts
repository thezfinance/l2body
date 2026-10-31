import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

// Folder name -> label shown on the site. To add a category, add a folder and a line here.
export const CATEGORIES: Record<string, { label: string; blurb: string }> = {
  leveling: { label: "Leveling", blurb: "Fastest ways to climb, level by level." },
  farming: { label: "Farming Spots", blurb: "Where to hunt for adena, drops and materials." },
  builds: { label: "Class Builds", blurb: "Skills, gear and playstyle per class." },
  quests: { label: "Quests", blurb: "Quest walkthroughs and rewards." },
  "rates-x10": { label: "x10 Rates", blurb: "What the x10 rates change and how to use them." },
};

export type GuideMeta = {
  category: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  updated: string;
  youtube: string | null; // YouTube video ID, e.g. "dQw4w9WgXcQ"
};

export type Guide = GuideMeta & { content: string };

function readGuide(category: string, file: string): Guide {
  const raw = fs.readFileSync(path.join(GUIDES_DIR, category, file), "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.mdx$/, "");
  return {
    category,
    slug,
    title: String(data.title ?? slug),
    summary: String(data.summary ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    // gray-matter turns bare YAML dates into Date objects; keep a plain string.
    updated:
      data.updated instanceof Date
        ? data.updated.toISOString().slice(0, 10)
        : String(data.updated ?? ""),
    youtube: data.youtube ? String(data.youtube) : null,
    content,
  };
}

export function getAllGuides(): Guide[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  const guides: Guide[] = [];
  for (const category of Object.keys(CATEGORIES)) {
    const dir = path.join(GUIDES_DIR, category);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".mdx")) guides.push(readGuide(category, file));
    }
  }
  return guides.sort((a, b) => b.updated.localeCompare(a.updated));
}

export function getGuide(category: string, slug: string): Guide | null {
  if (!(category in CATEGORIES)) return null;
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(GUIDES_DIR, category, file))) return null;
  return readGuide(category, file);
}

export function toMeta(guide: Guide): GuideMeta {
  const { content, ...meta } = guide;
  void content;
  return meta;
}
