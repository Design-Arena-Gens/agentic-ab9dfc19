import type { AutomationIdea } from "@/types/youtube";

type AutomationIdeasProps = {
  ideas: AutomationIdea[];
};

export function AutomationIdeas({ ideas }: AutomationIdeasProps) {
  if (!ideas.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {ideas.map((idea) => (
        <div
          key={idea.title}
          className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-red-200 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-red-500">{idea.title}</p>
          <p className="mt-2 text-sm text-zinc-600">{idea.description}</p>
        </div>
      ))}
    </div>
  );
}
