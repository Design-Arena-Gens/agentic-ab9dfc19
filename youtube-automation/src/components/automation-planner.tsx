'use client';

import { ChangeEvent, useMemo, useState } from "react";
import { format } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { AutomationTask } from "@/types/youtube";

const defaultTask: Omit<AutomationTask, "id" | "createdAt" | "status"> = {
  name: "",
  trigger: "",
  action: "",
  cadence: "",
  owner: "",
  goal: "",
};

const presetIdeas = [
  {
    title: "Comment Nurturing",
    trigger: "New comment on videos with engagement rate above 8%",
    action: "Send templated reply and invite viewer to subscribe",
    cadence: "Daily",
    goal: "Boost community engagement",
  },
  {
    title: "Playlist Refresh",
    trigger: "Video views fall below 48-hour average",
    action: "Move video to evergreen playlist and refresh thumbnail",
    cadence: "Weekly",
    goal: "Increase long-tail traffic",
  },
  {
    title: "Short-to-Long Bridge",
    trigger: "Short hits 50k views",
    action: "Publish community post linking to related long-form video",
    cadence: "Continuous",
    goal: "Drive watch time on pillar content",
  },
];

export function AutomationPlanner() {
  const [tasks, setTasks] = useLocalStorage<AutomationTask[]>(
    "youtube-automation-tasks",
    [],
  );
  const [form, setForm] = useState(defaultTask);
  const [statusFilter, setStatusFilter] =
    useState<AutomationTask["status"] | "all">("all");

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const createTask = () => {
    if (!form.name.trim() || !form.trigger.trim() || !form.action.trim()) {
      return;
    }
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const task: AutomationTask = {
      ...form,
      id,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    setForm(defaultTask);
  };

  const upsertFromPreset = (idea: (typeof presetIdeas)[number]) => {
    setForm({
      name: idea.title,
      trigger: idea.trigger,
      action: idea.action,
      goal: idea.goal,
      cadence: idea.cadence,
      owner: "Automation Team",
    });
  };

  const updateTaskStatus = (id: string, status: AutomationTask["status"]) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <section className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <header>
        <p className="text-xs uppercase tracking-wide text-red-500">
          Automation Control Center
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          Orchestrate your YouTube workflows
        </h2>
      </header>
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <div className="space-y-4 rounded-3xl border border-zinc-100 bg-red-500/5 p-5">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Automation name
            </label>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Community Accelerator"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
          <Field
            label="Trigger condition"
            value={form.trigger}
            placeholder="When a new video crosses 10k views within 48 hours"
            multiline
            onChange={(value) =>
              setForm((prev) => ({ ...prev, trigger: value }))
            }
          />
          <Field
            label="Automation action"
            value={form.action}
            placeholder="Publish a community post amplifying the video"
            multiline
            onChange={(value) =>
              setForm((prev) => ({ ...prev, action: value }))
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Cadence"
              value={form.cadence}
              placeholder="Weekly"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, cadence: value }))
              }
            />
            <Field
              label="Owner"
              value={form.owner}
              placeholder="Automation Team"
              onChange={(value) =>
                setForm((prev) => ({ ...prev, owner: value }))
              }
            />
          </div>
          <Field
            label="Primary goal"
            value={form.goal}
            placeholder="Increase watch time by 12%"
            multiline
            onChange={(value) =>
              setForm((prev) => ({ ...prev, goal: value }))
            }
          />
          <button
            type="button"
            onClick={createTask}
            className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Add automation
          </button>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Preset automations
            </p>
            <div className="space-y-3">
              {presetIdeas.map((idea) => (
                <button
                  key={idea.title}
                  type="button"
                  onClick={() => upsertFromPreset(idea)}
                  className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-left text-sm text-zinc-600 transition hover:border-red-200 hover:text-zinc-900"
                >
                  <span className="block font-semibold text-zinc-900">
                    {idea.title}
                  </span>
                  <span className="text-xs text-zinc-500">{idea.trigger}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">
              {filteredTasks.length} automations
            </p>
            <div className="flex gap-2">
              <FilterButton
                label="All"
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
              />
              <FilterButton
                label="Draft"
                active={statusFilter === "draft"}
                onClick={() => setStatusFilter("draft")}
              />
              <FilterButton
                label="Active"
                active={statusFilter === "active"}
                onClick={() => setStatusFilter("active")}
              />
            </div>
          </div>
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {task.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Created {format(new Date(task.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          task.status === "active" ? "draft" : "active",
                        )
                      }
                      className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                        task.status === "active"
                          ? "bg-green-500/15 text-green-600 hover:bg-green-500/25"
                          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      }`}
                    >
                      {task.status === "active" ? "Active" : "Draft"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      className="text-xs font-semibold text-red-500 transition hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </header>
                <Detail label="Trigger" value={task.trigger} />
                <Detail label="Action" value={task.action} />
                <div className="grid gap-3 md:grid-cols-3">
                  <Detail label="Cadence" value={task.cadence || "—"} />
                  <Detail label="Owner" value={task.owner || "—"} />
                  <Detail label="Goal" value={task.goal || "—"} />
                </div>
              </article>
            ))}
            {!filteredTasks.length ? (
              <p className="rounded-3xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500">
                No automations yet. Draft your first workflow to kickstart your
                channel operations.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
      <p className="text-[11px] uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-sm text-zinc-700">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const baseClass =
    "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200";
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => onChange(event.target.value);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          className={`${baseClass} min-h-[100px]`}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          className={baseClass}
        />
      )}
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? "bg-red-500 text-white shadow-sm"
          : "bg-white text-zinc-600 hover:bg-red-500/10 hover:text-red-500"
      }`}
    >
      {label}
    </button>
  );
}
