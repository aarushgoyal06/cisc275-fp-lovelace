import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "../../store/useAppStore";
import type { AttributeType } from "../../types";

const ATTR_TYPES: AttributeType[] = ["string", "number", "boolean", "list", "custom"];

export function StateDesigner() {
  const {
    getCurrentProject,
    updateStateModelClassName,
    addStateAttribute,
    updateStateAttribute,
    deleteStateAttribute,
    setSecondaryDataclass,
    addSecondaryAttribute,
    updateSecondaryAttribute,
    deleteSecondaryAttribute,
    setView,
  } = useAppStore();

  const project = getCurrentProject();
  if (!project) return null;

  const { stateModel } = project;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setView("project")} className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1">
          ← {project.name}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">State Model Designer</h1>

        {/* Primary State */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Primary State</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Class Name:</label>
              <input
                type="text"
                value={stateModel.primaryClassName}
                onChange={(e) => updateStateModelClassName(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            {stateModel.attributes.map((attr) => (
              <div key={attr.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="text"
                  value={attr.name}
                  onChange={(e) => updateStateAttribute(attr.id, { name: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm font-mono w-32"
                  placeholder="name"
                />
                <select
                  value={attr.type}
                  onChange={(e) => updateStateAttribute(attr.id, { type: e.target.value as AttributeType })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
                >
                  {ATTR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="text"
                  value={attr.description}
                  onChange={(e) => updateStateAttribute(attr.id, { description: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                  placeholder="Description..."
                />
                <button onClick={() => deleteStateAttribute(attr.id)} className="text-gray-400 hover:text-red-500">×</button>
              </div>
            ))}
          </div>
          <button
            onClick={addStateAttribute}
            className="mt-3 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 w-full"
          >
            + Add Attribute
          </button>
        </div>

        {/* Secondary Dataclass */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Secondary Dataclass</h2>
            {!stateModel.secondaryDataclass ? (
              <button
                onClick={() => setSecondaryDataclass({ id: uuidv4(), name: "Item", attributes: [] })}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                + Create
              </button>
            ) : (
              <button
                onClick={() => setSecondaryDataclass(null)}
                className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>

          {stateModel.secondaryDataclass && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm text-gray-600">Class Name:</label>
                <input
                  type="text"
                  value={stateModel.secondaryDataclass.name}
                  onChange={(e) => setSecondaryDataclass({ ...stateModel.secondaryDataclass!, name: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm font-mono"
                />
              </div>

              <div className="space-y-3">
                {stateModel.secondaryDataclass.attributes.map((attr) => (
                  <div key={attr.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => updateSecondaryAttribute(attr.id, { name: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm font-mono w-32"
                      placeholder="name"
                    />
                    <select
                      value={attr.type}
                      onChange={(e) => updateSecondaryAttribute(attr.id, { type: e.target.value as AttributeType })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
                    >
                      {ATTR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="text"
                      value={attr.description}
                      onChange={(e) => updateSecondaryAttribute(attr.id, { description: e.target.value })}
                      className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                      placeholder="Description..."
                    />
                    <button onClick={() => deleteSecondaryAttribute(attr.id)} className="text-gray-400 hover:text-red-500">×</button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSecondaryAttribute}
                className="mt-3 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 w-full"
              >
                + Add Attribute
              </button>
            </>
          )}
          {!stateModel.secondaryDataclass && (
            <p className="text-sm text-gray-400 text-center py-6">No secondary dataclass defined. Click "+ Create" to add one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
