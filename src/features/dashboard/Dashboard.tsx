import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";

export function Dashboard() {
  const { projects, createProject, deleteProject, openProject, loadDemoProjects } = useAppStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = createProject(name.trim(), description.trim());
    openProject(id);
    setName("");
    setDescription("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visual Website Planner</h1>
            <p className="text-gray-500 mt-1">Design, plan, and generate code for your web applications</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadDemoProjects}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium"
            >
              Load Demo
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              + New Project
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome App"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this app do?"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Create Project
                </button>
                <button
                  onClick={() => { setShowForm(false); setName(""); setDescription(""); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">🗂️</div>
            <p className="text-lg">No projects yet. Create one or load a demo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openProject(project.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description || "No description"}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                    className="ml-2 text-gray-400 hover:text-red-500 text-lg"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{project.graph.pages.length} pages</span>
                    <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
