import { BookOpen, Coins, Hammer, Video } from "lucide-react";
import Link from "next/link";

const sections = [
  { href: "/guides", title: "Guides", text: "Leveling, hunting zones, epic bosses, quests and x10 rates.", Icon: BookOpen },
  { href: "/videos", title: "Videos", text: "Latest uploads from lolThez.", Icon: Video },
  { href: "/crafts", title: "Crafts", text: "Recipes and a profit calculator.", Icon: Hammer },
  { href: "/market", title: "Market", text: "Adena prices, trends and a watchlist.", Icon: Coins },
];

export default function Home() {
  return (
    <>
      <section className="py-10 text-center">
        <h1 className="text-4xl sm:text-5xl">L2body</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          A personal hub for Lineage 2 Interlude on L2 Reborn x10 Eternal.
        </p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ href, title, text, Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-panel-edge bg-panel p-6 transition hover:border-gold"
          >
            <Icon className="h-6 w-6 text-gold" aria-hidden="true" />
            <h2 className="mt-3 text-xl">{title}</h2>
            <p className="mt-2 text-sm text-muted">{text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
