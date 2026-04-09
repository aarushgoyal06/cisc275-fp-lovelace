import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";

export function ProjectOverview() {
  const { getCurrentProject, updateProjectMeta, setView } = useAppStore();
  const project = getCurrentProject();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [saved, setSaved] = useState(false);

  if (!project) return null;

  const handleSave = () => {
    updateProjectMeta(project.id, name, description);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const navCards = [
    { label: "Graph Editor", icon: "🗺️", view: "graph" as const, desc: "Design page structure and navigation routes" },
    { label: "Page Editor", icon: "🖌️", view: "page-editor" as const, desc: "Add and configure UI components" },
    { label: "State Designer", icon: "🧬", view: "state-designer" as const, desc: "Define your app's data model" },
    { label: "Annotations", icon: "📝", view: "annotations" as const, desc: "Annotate logic and flow" },
    { label: "Export", icon: "📦", view: "export" as const, desc: "Generate code and export documents" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setView("dashboard")} className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1">
          ← Back to Dashboard
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card) => (
            <button
              key={card.view}
              onClick={() => setView(card.view)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow hover:border-blue-300"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="text-base font-semibold text-gray-900">{card.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
