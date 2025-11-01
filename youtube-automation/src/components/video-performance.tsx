import type { VideoInsight } from "@/types/youtube";

type VideoPerformanceProps = {
  videos: VideoInsight[];
};

export function VideoPerformanceGrid({ videos }: VideoPerformanceProps) {
  if (!videos.length) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500">
        No recent videos found. Publishing new content will unlock deeper
        automation insights.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {videos.map((video) => (
        <article
          key={video.id}
          className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
            {video.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
            <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
              {video.duration || "N/A"}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div>
              <h3 className="text-base font-semibold leading-6 text-zinc-900 line-clamp-2">
                {video.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                {video.publishedDay} · {video.publishedTime}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Metric label="Views" value={video.viewCount.toLocaleString()} />
              <Metric
                label="Likes"
                value={video.likeCount.toLocaleString()}
              />
              <Metric
                label="Comments"
                value={video.commentCount.toLocaleString()}
              />
            </div>
            <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600">
              Engagement {Math.round(video.engagementRate * 1000) / 10}%
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
