import GuideBrowser from "@/components/guides/GuideBrowser";
import { CATEGORIES, getAllGuides, toMeta } from "@/lib/guides";

export const metadata = { title: "Guides" };

export default function GuidesPage() {
  const guides = getAllGuides().map(toMeta);
  return (
    <section>
      <h1 className="text-3xl">Guides</h1>
      <p className="mt-2 mb-6 text-muted">Search, or filter by category and tag.</p>
      <GuideBrowser guides={guides} categories={CATEGORIES} />
    </section>
  );
}
