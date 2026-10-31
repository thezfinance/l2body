// Privacy-friendly embed (youtube-nocookie); the video loads lazily.
export default function YouTubeEmbed({
  id,
  title,
  start,
}: {
  id: string;
  title: string;
  start?: number;
}) {
  const query = start ? `?start=${Math.floor(start)}` : "";
  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-panel-edge">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}${query}`}
        title={`Video: ${title}`}
        loading="lazy"
        allow="accelerometer; encrypted-media; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
