import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppStore } from "../../store/useAppStore";

export function GraphEditor() {
  const { getCurrentProject, addPage, deletePage, addRoute, deleteRoute, updateNodePosition, updateRouteLabel, setView } = useAppStore();
  const project = getCurrentProject();
  const [newPageName, setNewPageName] = useState("");
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const nodes: Node[] = useMemo(() => {
    if (!project) return [];
    return project.graph.pages.map((page) => ({
      id: page.id,
      data: { label: page.name },
      position: project.graph.nodePositions[page.id] ?? { x: 100, y: 100 },
      style: { background: "#fff", border: "2px solid #3b82f6", borderRadius: "8px", padding: "10px", fontWeight: 600 },
    }));
  }, [project]);

  const edges: Edge[] = useMemo(() => {
    if (!project) return [];
    return project.graph.routes.map((route) => ({
      id: route.id,
      source: route.sourcePageId,
      target: route.targetPageId,
      label: route.label,
      animated: true,
      style: { stroke: "#3b82f6" },
    }));
  }, [project]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((change) => {
      if (change.type === "position" && change.position) {
        updateNodePosition(change.id, change.position.x, change.position.y);
      }
    });
  }, [updateNodePosition]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    changes.forEach((change) => {
      if (change.type === "remove") {
        deleteRoute(change.id);
      }
    });
  }, [deleteRoute]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      addRoute(connection.source, connection.target, "/route");
    }
  }, [addRoute]);

  const handleAddPage = () => {
    if (!newPageName.trim()) return;
    addPage(newPageName.trim());
    setNewPageName("");
  };

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setEditingEdgeId(edge.id);
    setEditingLabel(typeof edge.label === "string" ? edge.label : "");
  };

  const saveLabel = () => {
    if (editingEdgeId) {
      updateRouteLabel(editingEdgeId, editingLabel);
    }
    setEditingEdgeId(null);
  };

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <button onClick={() => setView("project")} className="text-blue-600 hover:underline text-sm">
          ← {project.name}
        </button>
        <h2 className="text-lg font-semibold text-gray-800 flex-1">Graph Editor</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPage()}
            placeholder="Page name..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddPage}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add Page
          </button>
        </div>
      </div>

      {editingEdgeId && (
        <div className="absolute z-10 top-20 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Route Label</label>
          <input
            type="text"
            value={editingLabel}
            onChange={(e) => setEditingLabel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
          />
          <button onClick={saveLabel} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 mr-2">Save</button>
          <button onClick={() => setEditingEdgeId(null)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
        </div>
      )}

      <div className="flex flex-1">
        <div className="flex-1" style={{ height: "calc(100vh - 57px)" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={handleEdgeClick}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
        <div className="w-64 bg-white border-l border-gray-200 p-4 overflow-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pages ({project.graph.pages.length})</h3>
          <div className="space-y-2">
            {project.graph.pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-sm text-gray-700 truncate flex-1">{page.name}</span>
                <button
                  onClick={() => deletePage(page.id)}
                  className="text-gray-400 hover:text-red-500 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-3">Routes ({project.graph.routes.length})</h3>
          <div className="space-y-2">
            {project.graph.routes.map((route) => {
              const src = project.graph.pages.find((p) => p.id === route.sourcePageId);
              const tgt = project.graph.pages.find((p) => p.id === route.targetPageId);
              return (
                <div key={route.id} className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium">{route.label}</span>
                    <button onClick={() => deleteRoute(route.id)} className="text-gray-400 hover:text-red-500">×</button>
                  </div>
                  <div className="text-gray-500 mt-1">{src?.name} → {tgt?.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
