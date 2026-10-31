import { ExternalLink } from "lucide-react";
import YouTubeEmbed from "@/components/guides/YouTubeEmbed";
import { CHANNEL, VIDEOS } from "@/config/videos";

export const metadata = { title: "Videos" };

export default function VideosPage() {
  return (
    <section>
      <h1 className="text-3xl">Videos</h1>
      <p className="mt-2 text-muted">
        Videos from{" "}
        <a href={CHANNEL.url} className="inline-flex items-center gap-1 text-gold-bright underline">
          {CHANNEL.name} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        .
      </p>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2">
        {VIDEOS.map((v) => (
          <li key={v.id}>
            <YouTubeEmbed id={v.id} title={v.title} start={v.start} />
            <h2 className="mt-2 text-base">{v.title}</h2>
          </li>
        ))}
      </ul>
      {VIDEOS.length === 0 && <p className="mt-6 text-sm text-muted">No videos yet.</p>}
    </section>
  );
}
