import type { KeywordScore } from "@/types/youtube";

type KeywordSummaryProps = {
  keywords: KeywordScore[];
};

export function KeywordSummary({ keywords }: KeywordSummaryProps) {
  if (!keywords.length) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
        Publish a few more videos to surface the strongest keyword clusters.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {keywords.map((keyword) => (
        <span
          key={keyword.keyword}
          className="rounded-full border border-red-200 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600"
        >
          #{keyword.keyword} · {keyword.score}
        </span>
      ))}
    </div>
  );
}
