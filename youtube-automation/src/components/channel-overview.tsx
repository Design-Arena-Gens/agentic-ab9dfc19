import Image from "next/image";
import type { ChannelOverview } from "@/types/youtube";

const metrics: Array<{
  label: string;
  getter: (channel: ChannelOverview) => string;
}> = [
  { label: "Subscribers", getter: (channel) => channel.subscriberCount },
  { label: "Total Views", getter: (channel) => channel.viewCount },
  { label: "Uploads", getter: (channel) => channel.videoCount },
] as const;

type ChannelOverviewProps = {
  channel: ChannelOverview;
};

export function ChannelOverviewCard({ channel }: ChannelOverviewProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-r from-red-500/10 via-white to-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          {channel.thumbnail ? (
            <Image
              src={channel.thumbnail}
              alt={channel.title}
              width={96}
              height={96}
              className="h-24 w-24 rounded-2xl border border-white/40 object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-red-500/20 text-3xl font-semibold text-red-600">
              {channel.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm uppercase tracking-wide text-red-500">
              YouTube Automation Hub
            </p>
            <h1 className="text-3xl font-semibold text-zinc-900">
              {channel.title}
            </h1>
            {channel.customUrl ? (
              <a
                href={`https://youtube.com/${channel.customUrl}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-red-500 underline underline-offset-4"
              >
                youtube.com/{channel.customUrl.replace(/^@/, "")}
              </a>
            ) : null}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-zinc-200 bg-white/60 p-4 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {metric.getter(channel)}
              </p>
            </div>
          ))}
        </div>
      </div>
      {channel.description ? (
        <p className="mt-6 max-w-3xl text-sm leading-6 text-zinc-600">
          {channel.description}
        </p>
      ) : null}
    </section>
  );
}
