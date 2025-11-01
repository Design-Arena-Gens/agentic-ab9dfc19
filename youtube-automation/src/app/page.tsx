'use client';

import { useEffect, useMemo, useState } from "react";
import { AutomationIdeas } from "@/components/automation-ideas";
import { AutomationPlanner } from "@/components/automation-planner";
import { ChannelOverviewCard } from "@/components/channel-overview";
import { KeywordSummary } from "@/components/keyword-summary";
import { ScheduleInsightsCard } from "@/components/schedule-insights";
import { VideoPerformanceGrid } from "@/components/video-performance";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { ChannelAutomationPayload } from "@/types/youtube";

type FetchState = "idle" | "loading" | "error" | "success";

export default function Home() {
  const [rememberedApiKey, setRememberedApiKey] = useLocalStorage<string>(
    "youtube-api-key",
    "",
  );
  const [channelMemory, setChannelMemory] = useLocalStorage<string>(
    "youtube-last-channel",
    "",
  );

  const [apiKey, setApiKey] = useState("");
  const [channelId, setChannelId] = useState("");
  const [rememberApiKey, setRememberApiKey] = useState(
    () => rememberedApiKey.length > 0,
  );
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ChannelAutomationPayload | null>(null);

  useEffect(() => {
    if (rememberApiKey) {
      setApiKey(rememberedApiKey);
    }
  }, [rememberApiKey, rememberedApiKey]);

  useEffect(() => {
    if (channelMemory) {
      setChannelId(channelMemory);
    }
  }, [channelMemory]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!apiKey.trim() || !channelId.trim()) {
      setError("Provide both an API key and channel handle/ID.");
      setState("error");
      return;
    }
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          channelId: channelId.trim(),
          maxResults: 12,
        }),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error ?? "Failed to fetch channel insights");
      }

      const data = (await response.json()) as ChannelAutomationPayload;
      setPayload(data);
      setState("success");

      if (rememberApiKey) {
        setRememberedApiKey(apiKey.trim());
      }
      setChannelMemory(channelId.trim());
    } catch (fetchError) {
      setState("error");
      setError((fetchError as Error).message);
    }
  };

  useEffect(() => {
    if (!rememberApiKey) {
      setRememberedApiKey("");
    }
  }, [rememberApiKey, setRememberedApiKey]);

  const hasData = useMemo(() => state === "success" && payload, [state, payload]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100 pb-20">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-24 pt-12 lg:px-6">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-red-500">
                YouTube Automation Assistant
              </p>
              <h1 className="mt-2 max-w-2xl text-3xl font-semibold text-zinc-900 md:text-4xl">
                Plug in your channel to unlock automated growth systems
              </h1>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              Secure: keys stay in your browser
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-4 md:grid-cols-[2fr,2fr,auto] md:items-end"
          >
            <Field
              label="YouTube Data API key"
              value={apiKey}
              placeholder="AIza..."
              onChange={setApiKey}
              type="password"
            />
            <Field
              label="Channel handle or ID"
              value={channelId}
              placeholder="@youtubecreators or UC..."
              onChange={setChannelId}
            />
            <button
              type="submit"
              className="h-[52px] rounded-2xl bg-red-500 px-6 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              disabled={state === "loading"}
            >
              {state === "loading" ? "Analyzing..." : "Generate playbook"}
            </button>
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <input
                type="checkbox"
                checked={rememberApiKey}
                onChange={(event) => setRememberApiKey(event.target.checked)}
                className="h-4 w-4 rounded border border-zinc-300 text-red-500"
              />
              Remember API key for this device
            </label>
          </form>
          {state === "error" && error ? (
            <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}
        </section>

        {state === "idle" ? (
          <section className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center">
            <p className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-red-500">
              Ready when you are
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Connect a channel to generate automation insights
            </h2>
            <p className="max-w-2xl text-sm text-zinc-500">
              Drop your API key and channel handle above to surface performance
              analytics, keyword clusters, and prebuilt automation ideas tailored
              to your audience.
            </p>
          </section>
        ) : null}

        {state === "loading" ? (
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-zinc-500">
              Crunching channel intelligence...
            </p>
          </section>
        ) : null}

        {hasData && payload ? (
          <>
            <ChannelOverviewCard channel={payload.channel} />

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-red-500">
                    Recent Performance
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                    Top videos fueling growth
                  </h2>
                </div>
                <VideoPerformanceGrid videos={payload.videos.slice(0, 6)} />
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-red-500">
                    Keyword Hubs
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                    Phrases sparking engagement
                  </h2>
                  <div className="mt-4">
                    <KeywordSummary keywords={payload.insights.keywords} />
                  </div>
                </div>
                <ScheduleInsightsCard schedule={payload.insights.schedule} />
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-red-500">
                    Automation Playbook
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
                    High-leverage workflows to deploy
                  </h2>
                </div>
              </div>
              <div className="mt-4">
                <AutomationIdeas ideas={payload.insights.automationIdeas} />
              </div>
            </section>

            <AutomationPlanner />
          </>
        ) : null}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "password";
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-[52px] rounded-2xl border border-zinc-200 bg-white px-4 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
      />
    </label>
  );
}
