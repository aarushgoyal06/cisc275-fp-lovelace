import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "../../store/useAppStore";
import type { UIComponent, ComponentType } from "../../types";
import { ComponentConfig } from "./ComponentConfig";
import { PreviewComponent } from "./PreviewComponent";

const COMPONENT_TYPES: ComponentType[] = ["Text", "Header", "TextBox", "TextArea", "CheckBox", "SelectBox", "Button"];

function PageStyleEditor({ pageId }: { pageId: string }) {
  const { getCurrentProject, updatePageStyle } = useAppStore();
  const project = getCurrentProject();
  const page = project?.graph.pages.find((p) => p.id === pageId);
  if (!page) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Page Style</h3>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Background Color</label>
        <input type="color" value={page.style.backgroundColor} onChange={(e) => updatePageStyle(pageId, { backgroundColor: e.target.value })} className="h-8 w-full rounded cursor-pointer" />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Font Family</label>
        <select value={page.style.fontFamily} onChange={(e) => updatePageStyle(pageId, { fontFamily: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1 text-sm">
          <option value="sans-serif">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Flex Direction</label>
        <select value={page.style.flexDirection} onChange={(e) => updatePageStyle(pageId, { flexDirection: e.target.value as "row" | "column" })} className="w-full border border-gray-300 rounded px-2 py-1 text-sm">
          <option value="column">Column</option>
          <option value="row">Row</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Justify Content</label>
        <select value={page.style.justifyContent} onChange={(e) => updatePageStyle(pageId, { justifyContent: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1 text-sm">
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
          <option value="space-between">Space Between</option>
          <option value="space-around">Space Around</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Align Items</label>
        <select value={page.style.alignItems} onChange={(e) => updatePageStyle(pageId, { alignItems: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1 text-sm">
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
          <option value="stretch">Stretch</option>
        </select>
      </div>
    </div>
  );
}

function SortableItem({ component, isSelected, onSelect, onDelete }: {
  component: UIComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: component.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative border rounded-lg p-3 mb-2 cursor-pointer transition-all ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="text-gray-400 cursor-grab active:cursor-grabbing text-lg select-none"
        >
          ⠿
        </div>
        <div className="flex-1 min-w-0">
          <PreviewComponent component={component} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function PageEditor() {
  const {
    getCurrentProject,
    currentPageId,
    selectedComponentId,
    setCurrentPage,
    setSelectedComponent,
    addComponent,
    deleteComponent,
    reorderComponents,
    setView,
  } = useAppStore();

  const project = getCurrentProject();
  const [tab, setTab] = useState<"components" | "styles">("components");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!project) return null;

  const currentPage = project.graph.pages.find((p) => p.id === currentPageId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentPage) return;
    const oldIndex = currentPage.components.findIndex((c) => c.id === active.id);
    const newIndex = currentPage.components.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = [...currentPage.components.map((c) => c.id)];
    const [removed] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, removed);
    reorderComponents(currentPage.id, newOrder);
  };

  const selectedComponent = currentPage?.components.find((c) => c.id === selectedComponentId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <button onClick={() => setView("project")} className="text-blue-600 hover:underline text-sm">
          ← {project.name}
        </button>
        <h2 className="text-lg font-semibold text-gray-800 flex-1">Page Editor</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Page List */}
        <div className="w-48 bg-white border-r border-gray-200 p-4 overflow-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pages</h3>
          <div className="space-y-1">
            {project.graph.pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${
                  currentPageId === page.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page.name}
              </button>
            ))}
          </div>
        </div>

        {/* Component Palette + Canvas */}
        {currentPage ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Palette */}
            <div className="w-48 bg-white border-r border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add Component</h3>
              <div className="space-y-1">
                {COMPONENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => addComponent(currentPage.id, type)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-100 hover:border-blue-200"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{currentPage.name}</h3>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden text-sm">
                  <button
                    onClick={() => setTab("components")}
                    className={`px-3 py-1.5 ${tab === "components" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    Components
                  </button>
                  <button
                    onClick={() => setTab("styles")}
                    className={`px-3 py-1.5 ${tab === "styles" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    Page Style
                  </button>
                </div>
              </div>

              {tab === "components" ? (
                <div
                  className="min-h-64 bg-white rounded-xl border-2 border-dashed border-gray-200 p-4"
                  style={{
                    backgroundColor: currentPage.style.backgroundColor,
                    fontFamily: currentPage.style.fontFamily,
                    display: "flex",
                    flexDirection: currentPage.style.flexDirection,
                    justifyContent: currentPage.style.justifyContent,
                    alignItems: currentPage.style.alignItems,
                  }}
                >
                  {currentPage.components.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 w-full">
                      <p>Click a component type to add it here</p>
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={currentPage.components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="w-full">
                          {currentPage.components.map((component) => (
                            <SortableItem
                              key={component.id}
                              component={component}
                              isSelected={selectedComponentId === component.id}
                              onSelect={() => setSelectedComponent(component.id)}
                              onDelete={() => deleteComponent(currentPage.id, component.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              ) : (
                <PageStyleEditor pageId={currentPage.id} />
              )}
            </div>

            {/* Config Sidebar */}
            {selectedComponent && (
              <div className="w-72 bg-white border-l border-gray-200 overflow-auto">
                <ComponentConfig pageId={currentPage.id} component={selectedComponent} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-4">👈</div>
              <p>Select a page to edit its components</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
