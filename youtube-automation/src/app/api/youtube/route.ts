import { format, parseISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  apiKey: z.string().min(10, "API key is required"),
  channelId: z.string().min(1, "Channel ID or handle is required"),
  maxResults: z.number().int().min(1).max(25).optional().default(12),
});

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "your",
  "what",
  "about",
  "will",
  "have",
  "how",
  "you",
  "into",
  "best",
  "easy",
  "make",
  "free",
  "why",
  "when",
  "into",
  "new",
  "official",
  "video",
  "shorts",
]);

type ChannelSnippet = {
  title: string;
  description: string;
  thumbnails?: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  customUrl?: string;
  publishedAt?: string;
};

type ChannelStatistics = {
  viewCount: string;
  subscriberCount: string;
  videoCount: string;
};

type VideoInsight = {
  id: string;
  title: string;
  publishedAt: string;
  description: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  engagementRate: number;
  publishedDay: string;
  publishedTime: string;
};

type SearchItem = {
  id?: {
    videoId?: string;
  };
};

type SearchResult = {
  items?: SearchItem[];
};

type VideoSnippet = {
  title?: string;
  description?: string;
  publishedAt?: string;
  thumbnails?: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
};

type VideoStatistics = {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
};

type VideoDetailsItem = {
  id: string;
  snippet?: VideoSnippet;
  statistics?: VideoStatistics;
  contentDetails?: {
    duration?: string;
  };
};

type VideoDetailsResult = {
  items?: VideoDetailsItem[];
};

const handleChannelId = (channelId: string) =>
  channelId.startsWith("@") ? channelId.slice(1) : channelId;

const normalizeNumber = (value: string | undefined) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const computeKeywordScores = (videos: VideoInsight[]) => {
  const counts = new Map<string, number>();
  videos.forEach((video) => {
    const words = `${video.title} ${video.description}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    const uniqueWords = new Set(words);
    uniqueWords.forEach((word) => {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([keyword, score]) => ({ keyword, score }));
};

const humanizeNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

const deriveScheduleInsight = (videos: VideoInsight[]) => {
  if (!videos.length) {
    return {
      bestDay: "Monday",
      bestTimeWindow: "12:00 PM - 3:00 PM",
      uploadCadence: "Publish 1 video per week to gather more data.",
    };
  }

  const byDay = new Map<string, number>();
  const byHour = new Map<number, number>();
  const sortedVideos = [...videos].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );

  for (const video of videos) {
    const date = parseISO(video.publishedAt);
    const dayKey = format(date, "EEEE");
    const hourKey = Number(format(date, "H"));
    byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + video.viewCount);
    byHour.set(hourKey, (byHour.get(hourKey) ?? 0) + video.viewCount);
  }

  const bestDay =
    Array.from(byDay.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "Monday";
  const bestHour = Array.from(byHour.entries()).sort((a, b) => b[1] - a[1])[0];

  const windowHour = bestHour ? bestHour[0] : 15;
  const bestTimeWindow = `${format(new Date().setHours(windowHour, 0), "h a")} - ${format(new Date().setHours(windowHour + 2, 0), "h a")}`;

  const recentUploads = sortedVideos.slice(0, 6);
  let cadence = "Publish 1 video per week to gather more data.";
  if (recentUploads.length >= 2) {
    const diffs = [];
    for (let i = 0; i < recentUploads.length - 1; i++) {
      const current = parseISO(recentUploads[i].publishedAt);
      const next = parseISO(recentUploads[i + 1].publishedAt);
      const diffDays = Math.max(
        1,
        Math.round(
          Math.abs(+current - +next) / (1000 * 60 * 60 * 24),
        ),
      );
      diffs.push(diffDays);
    }
    if (diffs.length) {
      const avg = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      cadence =
        avg <= 2
          ? "Maintain a 2-3 uploads per week cadence."
          : avg <= 5
            ? "Aim for 1-2 uploads per week for steady growth."
            : "Increase posting frequency. Target at least 1 video per week.";
    }
  }

  return {
    bestDay,
    bestTimeWindow,
    uploadCadence: cadence,
  };
};

const deriveAutomationIdeas = (
  channelSnippet: ChannelSnippet,
  stats: ChannelStatistics,
  keywords: { keyword: string; score: number }[],
  videos: VideoInsight[],
) => {
  const subscriberCount = normalizeNumber(stats.subscriberCount);
  const highPerformers = videos
    .filter((video) => video.viewCount > subscriberCount * 0.2)
    .slice(0, 3);

  const topKeywordList = keywords.slice(0, 3).map((item) => item.keyword);
  const ideas = [
    {
      title: "Keyword-Aware Upload Automation",
      description: `Auto-queue videos that include ${topKeywordList.join(", ")} in the title or description to capitalize on topics already resonating with viewers.`,
    },
    {
      title: "High Performer Refresh",
      description:
        highPerformers.length > 0
          ? `Refresh thumbnails and end screens on videos like "${highPerformers
              .map((video) => video.title)
              .join(
                '", "',
              )}" to extend their lifespan via end card automations.`
          : "Identify your top performing videos weekly and automatically add them to a 'Start Here' playlist.",
    },
    {
      title: "Smart Community Posts",
      description: `Schedule community posts to recap videos published on ${format(
        new Date().setDate(new Date().getDate() - 1),
        "EEEE",
      )}, nudging subscribers who missed recent uploads.`,
    },
  ];

  if (channelSnippet.customUrl) {
    ideas.push({
      title: "Pinned Comment CTA",
      description: `Automate pinned comments on new uploads with a CTA to ${channelSnippet.customUrl} to funnel traffic to your flagship offer.`,
    });
  }

  return ideas;
};

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { apiKey, channelId, maxResults } = parsed.data;
    const channelQuery = new URLSearchParams({
      part: "snippet,statistics,contentDetails",
      forHandle: channelId.startsWith("@") ? handleChannelId(channelId) : "",
      id: channelId.startsWith("@") ? "" : channelId,
      key: apiKey,
    });

    if (!channelQuery.get("id")) {
      channelQuery.delete("id");
    }
    if (!channelQuery.get("forHandle")) {
      channelQuery.delete("forHandle");
    }

    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?${channelQuery.toString()}`,
      { next: { revalidate: 60 } },
    );

    if (!channelResponse.ok) {
      const message = await channelResponse.text();
      return NextResponse.json(
        { error: "Failed to fetch channel data", message },
        { status: channelResponse.status },
      );
    }

    const channelJson = await channelResponse.json();
    const channel = channelJson.items?.[0];

    if (!channel) {
      return NextResponse.json(
        { error: "Channel not found. Check the handle or ID." },
        { status: 404 },
      );
    }

    const uploadsPlaylist =
      channel.contentDetails?.relatedPlaylists?.uploads ?? "";

    const searchParams = new URLSearchParams({
      part: "snippet",
      channelId: channel.id,
      maxResults: maxResults.toString(),
      order: "date",
      type: "video",
      key: apiKey,
    });

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;
    const searchResponse = await fetch(searchUrl, { cache: "no-cache" });

    if (!searchResponse.ok) {
      const message = await searchResponse.text();
      return NextResponse.json(
        { error: "Failed to fetch channel videos", message },
        { status: searchResponse.status },
      );
    }

    const searchJson = (await searchResponse.json()) as SearchResult;
    const videoIds = searchJson.items
      ?.map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    const videos: VideoInsight[] = [];

    if (videoIds?.length) {
      const detailsParams = new URLSearchParams({
        part: "snippet,statistics,contentDetails",
        id: videoIds.join(","),
        key: apiKey,
      });

      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`;
      const detailsResponse = await fetch(detailsUrl, { cache: "no-cache" });

      if (!detailsResponse.ok) {
        const message = await detailsResponse.text();
        return NextResponse.json(
          { error: "Failed to fetch video details", message },
          { status: detailsResponse.status },
        );
      }

      const detailsJson = (await detailsResponse.json()) as VideoDetailsResult;
      detailsJson.items?.forEach((item) => {
        const snippet: VideoSnippet = item.snippet ?? {};
        const stats: VideoStatistics = item.statistics ?? {};
        const engagementRate =
          normalizeNumber(stats.likeCount) + normalizeNumber(stats.commentCount);
        const viewCount = normalizeNumber(stats.viewCount);
        const publishedAt = snippet.publishedAt ?? new Date().toISOString();

        videos.push({
          id: item.id,
          title: snippet.title ?? "Untitled video",
          description: snippet.description ?? "",
          thumbnail:
            snippet.thumbnails?.high?.url ??
            snippet.thumbnails?.medium?.url ??
            snippet.thumbnails?.default?.url ??
            "",
          duration: item.contentDetails?.duration ?? "",
          publishedAt,
          publishedDay: format(parseISO(publishedAt), "EEE, MMM d yyyy"),
          publishedTime: format(parseISO(publishedAt), "h:mm a"),
          viewCount,
          likeCount: normalizeNumber(stats.likeCount),
          commentCount: normalizeNumber(stats.commentCount),
          engagementRate:
            viewCount > 0 ? Number((engagementRate / viewCount).toFixed(3)) : 0,
        });
      });
    }

    const keywordScores = computeKeywordScores(videos);
    const schedule = deriveScheduleInsight(videos);
    const ideas = deriveAutomationIdeas(
      channel.snippet,
      channel.statistics,
      keywordScores,
      videos,
    );

    return NextResponse.json({
      channel: {
        id: channel.id,
        title: channel.snippet?.title ?? "Untitled Channel",
        description: channel.snippet?.description ?? "",
        thumbnail:
          channel.snippet?.thumbnails?.high?.url ??
          channel.snippet?.thumbnails?.medium?.url ??
          channel.snippet?.thumbnails?.default?.url ??
          "",
        publishedAt: channel.snippet?.publishedAt ?? "",
        subscriberCount: humanizeNumber(
          normalizeNumber(channel.statistics?.subscriberCount),
        ),
        viewCount: humanizeNumber(
          normalizeNumber(channel.statistics?.viewCount),
        ),
        videoCount: humanizeNumber(
          normalizeNumber(channel.statistics?.videoCount),
        ),
        customUrl: channel.snippet?.customUrl ?? "",
        uploadsPlaylist,
      },
      videos,
      insights: {
        keywords: keywordScores,
        schedule,
        automationIdeas: ideas,
      },
    });
  } catch (error) {
    console.error("YouTube automation API error:", error);
    return NextResponse.json(
      { error: "Unexpected error", message: (error as Error).message },
      { status: 500 },
    );
  }
}
