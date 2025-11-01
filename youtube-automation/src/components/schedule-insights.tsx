import type { ScheduleInsight } from "@/types/youtube";

type ScheduleInsightsProps = {
  schedule: ScheduleInsight;
};

export function ScheduleInsightsCard({ schedule }: ScheduleInsightsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-gradient-to-r from-red-500/10 via-white to-white p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-red-500">
          Publishing Blueprint
        </p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-900">
          Recommended cadence
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ScheduleItem label="Best Day" value={schedule.bestDay} />
        <ScheduleItem label="Time Window" value={schedule.bestTimeWindow} />
        <ScheduleItem label="Cadence" value={schedule.uploadCadence} />
      </div>
    </div>
  );
}

function ScheduleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
