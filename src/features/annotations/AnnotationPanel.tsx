import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { AnnotationType } from "../../types";

export function AnnotationPanel() {
  const { getCurrentProject, addAnnotation, deleteAnnotation, updateAnnotation, setView } = useAppStore();
  const project = getCurrentProject();
  const [type, setType] = useState<AnnotationType>("if");
  const [targetId, setTargetId] = useState("");
  const [targetKind, setTargetKind] = useState<"page" | "route">("page");
  const [description, setDescription] = useState("");

  if (!project) return null;

  const targets = targetKind === "page" ? project.graph.pages : project.graph.routes;

  const handleAdd = () => {
    if (!targetId || !description.trim()) return;
    addAnnotation(type, targetId, targetKind, description.trim());
    setDescription("");
    setTargetId("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setView("project")} className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1">
          ← {project.name}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Logic Annotations</h1>

        {/* Add Annotation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Annotation</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as AnnotationType)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="if">if statement</option>
                <option value="for">for loop</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Target Kind</label>
              <select value={targetKind} onChange={(e) => { setTargetKind(e.target.value as "page" | "route"); setTargetId(""); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="page">Page</option>
                <option value="route">Route</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Target</label>
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select target…</option>
                {targets.map((t) => {
                    const label = "name" in t
                      ? t.name
                      : (() => {
                          const src = project.graph.pages.find((p) => p.id === t.sourcePageId);
                          const tgt = project.graph.pages.find((p) => p.id === t.targetPageId);
                          return `${src?.name ?? t.sourcePageId} → ${tgt?.name ?? t.targetPageId} (${t.label})`;
                        })();
                    return (
                      <option key={t.id} value={t.id}>{label}</option>
                    );
                  })}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the logic..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!targetId || !description.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Add Annotation
          </button>
        </div>

        {/* Annotations List */}
        <div className="space-y-3">
          {project.annotations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
              <p>No annotations yet. Add logic annotations above.</p>
            </div>
          ) : (
            project.annotations.map((ann) => {
              const target = [...project.graph.pages, ...project.graph.routes].find((t) => t.id === ann.targetId);
              const targetName = target
                ? ("name" in target ? target.name : (target as { label: string }).label)
                : ann.targetId;
              return (
                <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ann.type === "if" ? "bg-yellow-100 text-yellow-700" : "bg-purple-100 text-purple-700"}`}>
                          {ann.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {ann.targetKind}: <span className="font-medium text-gray-700">{targetName}</span>
                        </span>
                      </div>
                      <textarea
                        value={ann.description}
                        onChange={(e) => updateAnnotation(ann.id, e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50"
                        rows={2}
                      />
                    </div>
                    <button onClick={() => deleteAnnotation(ann.id)} className="text-gray-400 hover:text-red-500 mt-1">×</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
