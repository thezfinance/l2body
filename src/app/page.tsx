import Link from "next/link";

const sections = [
  { href: "/guides", title: "Guides", text: "Leveling, farming spots, builds, quests and x10 rates." },
  { href: "/events", title: "Events", text: "Server events and times, in your own time zone." },
  { href: "/videos", title: "Videos", text: "Latest uploads from lolThez." },
  { href: "/crafts", title: "Crafts", text: "Recipes and a profit calculator." },
  { href: "/market", title: "Market", text: "Adena prices, trends and a watchlist." },
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
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-panel-edge bg-panel p-6 transition hover:border-gold"
          >
            <h2 className="text-xl">{s.title}</h2>
            <p className="mt-2 text-sm text-muted">{s.text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
