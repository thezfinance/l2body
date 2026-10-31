import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import YouTubeEmbed from "@/components/guides/YouTubeEmbed";
import { CATEGORIES, getAllGuides, getGuide } from "@/lib/guides";

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ category: g.category, slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[category]/[slug]">) {
  const { category, slug } = await params;
  const guide = getGuide(category, slug);
  return guide ? { title: guide.title, description: guide.summary } : {};
}

export default async function GuidePage({ params }: PageProps<"/guides/[category]/[slug]">) {
  const { category, slug } = await params;
  const guide = getGuide(category, slug);
  if (!guide) notFound();

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-sm text-muted">
        <Link href="/guides" className="hover:text-gold-bright">
          Guides
        </Link>
        {" / "}
        <Link href={`/guides/${category}`} className="hover:text-gold-bright">
          {CATEGORIES[category].label}
        </Link>
      </p>
      <h1 className="mt-2 text-3xl sm:text-4xl">{guide.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {guide.updated && <>Updated {guide.updated} · </>}
        {guide.tags.map((t) => `#${t}`).join(" ")}
      </p>
      {guide.youtube && (
        <div className="mt-6">
          <YouTubeEmbed id={guide.youtube} title={guide.title} />
        </div>
      )}
      <div className="guide-body mt-8">
        <MDXRemote source={guide.content} />
      </div>
    </article>
  );
}
