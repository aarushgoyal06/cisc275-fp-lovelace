import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  Project,
  ProjectData,
  Page,
  UIComponent,
  UIComponentProps,
  Graph,
  StateModel,
  StateAttribute,
  SecondaryDataclass,
  AnnotationType,
  ComponentStyle,
  PageStyle,
} from "../types";

const defaultPageStyle: PageStyle = {
  backgroundColor: "#ffffff",
  fontFamily: "sans-serif",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
};

const defaultComponentStyle: ComponentStyle = {
  color: "#000000",
  border: "1px solid #ccc",
  padding: "8px",
  margin: "4px",
  fontSize: "14px",
};

const defaultStateModel: StateModel = {
  primaryClassName: "State",
  attributes: [],
  secondaryDataclass: null,
};

const createEmptyGraph = (): Graph => ({
  pages: [],
  routes: [],
  nodePositions: {},
});

const createEmptyProjectData = (project: Project): ProjectData => ({
  ...project,
  graph: createEmptyGraph(),
  stateModel: defaultStateModel,
  annotations: [],
});

interface AppState {
  projects: ProjectData[];
  currentProjectId: string | null;
  currentPageId: string | null;
  selectedComponentId: string | null;
  currentView: "dashboard" | "project" | "graph" | "page-editor" | "state-designer" | "annotations" | "export";

  // Project CRUD
  createProject: (name: string, description: string) => string;
  deleteProject: (id: string) => void;
  openProject: (id: string) => void;
  updateProjectMeta: (id: string, name: string, description: string) => void;
  loadDemoProjects: () => void;

  // Navigation
  setView: (view: AppState["currentView"]) => void;
  setCurrentPage: (pageId: string | null) => void;
  setSelectedComponent: (componentId: string | null) => void;

  // Graph / Pages
  addPage: (name: string) => void;
  deletePage: (pageId: string) => void;
  updatePageName: (pageId: string, name: string) => void;
  updateNodePosition: (pageId: string, x: number, y: number) => void;

  // Routes
  addRoute: (sourcePageId: string, targetPageId: string, label: string) => void;
  deleteRoute: (routeId: string) => void;
  updateRouteLabel: (routeId: string, label: string) => void;

  // Components
  addComponent: (pageId: string, compType: UIComponentProps["type"]) => void;
  deleteComponent: (pageId: string, componentId: string) => void;
  updateComponentProps: (pageId: string, componentId: string, props: UIComponentProps["props"]) => void;
  updateComponentStyle: (pageId: string, componentId: string, style: Partial<ComponentStyle>) => void;
  reorderComponents: (pageId: string, orderedIds: string[]) => void;

  // Page Style
  updatePageStyle: (pageId: string, style: Partial<PageStyle>) => void;

  // State Model
  updateStateModelClassName: (name: string) => void;
  addStateAttribute: () => void;
  updateStateAttribute: (id: string, attr: Partial<StateAttribute>) => void;
  deleteStateAttribute: (id: string) => void;
  setSecondaryDataclass: (dc: SecondaryDataclass | null) => void;
  addSecondaryAttribute: () => void;
  updateSecondaryAttribute: (id: string, attr: Partial<StateAttribute>) => void;
  deleteSecondaryAttribute: (id: string) => void;

  // Annotations
  addAnnotation: (type: AnnotationType, targetId: string, targetKind: "page" | "route", description: string) => void;
  deleteAnnotation: (id: string) => void;
  updateAnnotation: (id: string, description: string) => void;

  // Import
  importProject: (data: ProjectData) => void;

  // Getters
  getCurrentProject: () => ProjectData | undefined;
  getCurrentPage: () => Page | undefined;
}

const defaultPropsForType = (type: UIComponentProps["type"]): UIComponentProps["props"] => {
  switch (type) {
    case "Text": return { content: "New text" };
    case "TextBox": return { name: "input", defaultValue: "" };
    case "TextArea": return { name: "textarea", defaultValue: "" };
    case "CheckBox": return { name: "checkbox", defaultValue: false };
    case "SelectBox": return { name: "select", options: ["Option 1", "Option 2"], defaultValue: "Option 1" };
    case "Button": return { label: "Click me", routeId: "" };
    case "Header": return { content: "Header", level: 1 };
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      currentPageId: null,
      selectedComponentId: null,
      currentView: "dashboard",

      createProject: (name, description) => {
        const id = uuidv4();
        const now = Date.now();
        const project: ProjectData = createEmptyProjectData({
          id,
          name,
          description,
          lastModified: now,
        });
        set((s) => ({ projects: [...s.projects, project] }));
        return id;
      },

      deleteProject: (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
          currentView: s.currentProjectId === id ? "dashboard" : s.currentView,
        }));
      },

      openProject: (id) => {
        set({ currentProjectId: id, currentView: "project", currentPageId: null, selectedComponentId: null });
      },

      updateProjectMeta: (id, name, description) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, name, description, lastModified: Date.now() } : p
          ),
        }));
      },

      loadDemoProjects: () => {
        const demo1Id = uuidv4();
        const page1Id = uuidv4();
        const page2Id = uuidv4();
        const routeId = uuidv4();
        const demo1: ProjectData = {
          id: demo1Id,
          name: "Todo App",
          description: "A simple todo list application",
          lastModified: Date.now(),
          graph: {
            pages: [
              {
                id: page1Id,
                name: "Home",
                components: [
                  { id: uuidv4(), type: "Header", props: { content: "Todo App", level: 1 }, style: { ...defaultComponentStyle } },
                  { id: uuidv4(), type: "TextBox", props: { name: "newTodo", defaultValue: "" }, style: { ...defaultComponentStyle } },
                  { id: uuidv4(), type: "Button", props: { label: "Add Todo", routeId: routeId }, style: { ...defaultComponentStyle } },
                ],
                style: { ...defaultPageStyle },
              },
              {
                id: page2Id,
                name: "Todo List",
                components: [
                  { id: uuidv4(), type: "Text", props: { content: "Your todos:" }, style: { ...defaultComponentStyle } },
                ],
                style: { ...defaultPageStyle },
              },
            ],
            routes: [
              { id: routeId, sourcePageId: page1Id, targetPageId: page2Id, label: "/todos" },
            ],
            nodePositions: {
              [page1Id]: { x: 100, y: 100 },
              [page2Id]: { x: 400, y: 100 },
            },
          },
          stateModel: {
            primaryClassName: "TodoState",
            attributes: [
              { id: uuidv4(), name: "todos", type: "list", description: "List of todo items" },
              { id: uuidv4(), name: "current_user", type: "string", description: "Currently logged in user" },
              { id: uuidv4(), name: "filter", type: "string", description: "Current filter mode" },
              { id: uuidv4(), name: "count", type: "number", description: "Number of todos" },
            ],
            secondaryDataclass: {
              id: uuidv4(),
              name: "TodoItem",
              attributes: [
                { id: uuidv4(), name: "title", type: "string", description: "Todo title" },
                { id: uuidv4(), name: "completed", type: "boolean", description: "Whether todo is done" },
              ],
            },
          },
          annotations: [],
        };
        set((s) => ({ projects: [...s.projects, demo1] }));
      },

      setView: (view) => set({ currentView: view }),
      setCurrentPage: (pageId) => set({ currentPageId: pageId, selectedComponentId: null }),
      setSelectedComponent: (componentId) => set({ selectedComponentId: componentId }),

      addPage: (name) => {
        const id = uuidv4();
        set((s) => {
          const projects = s.projects.map((p) => {
            if (p.id !== s.currentProjectId) return p;
            const newPage: Page = {
              id,
              name,
              components: [],
              style: { ...defaultPageStyle },
            };
            return {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                pages: [...p.graph.pages, newPage],
                nodePositions: {
                  ...p.graph.nodePositions,
                  [id]: { x: 100 + p.graph.pages.length * 200, y: 100 },
                },
              },
            };
          });
          return { projects };
        });
      },

      deletePage: (pageId) => {
        set((s) => {
          const projects = s.projects.map((p) => {
            if (p.id !== s.currentProjectId) return p;
            const positions = { ...p.graph.nodePositions };
            delete positions[pageId];
            return {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                pages: p.graph.pages.filter((pg) => pg.id !== pageId),
                routes: p.graph.routes.filter((r) => r.sourcePageId !== pageId && r.targetPageId !== pageId),
                nodePositions: positions,
              },
            };
          });
          return {
            projects,
            currentPageId: s.currentPageId === pageId ? null : s.currentPageId,
          };
        });
      },

      updatePageName: (pageId, name) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                pages: p.graph.pages.map((pg) => pg.id === pageId ? { ...pg, name } : pg),
              },
            }
          ),
        }));
      },

      updateNodePosition: (pageId, x, y) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              graph: {
                ...p.graph,
                nodePositions: { ...p.graph.nodePositions, [pageId]: { x, y } },
              },
            }
          ),
        }));
      },

      addRoute: (sourcePageId, targetPageId, label) => {
        const id = uuidv4();
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                routes: [...p.graph.routes, { id, sourcePageId, targetPageId, label }],
              },
            }
          ),
        }));
      },

      deleteRoute: (routeId) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                routes: p.graph.routes.filter((r) => r.id !== routeId),
              },
            }
          ),
        }));
      },

      updateRouteLabel: (routeId, label) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                routes: p.graph.routes.map((r) => r.id === routeId ? { ...r, label } : r),
              },
            }
          ),
        }));
      },

      addComponent: (pageId, compType) => {
        const id = uuidv4();
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.currentProjectId) return p;
            return {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                pages: p.graph.pages.map((pg) => {
                  if (pg.id !== pageId) return pg;
                  const newComp: UIComponent = {
                    id,
                    type: compType,
                    props: defaultPropsForType(compType),
                    style: { ...defaultComponentStyle },
                  } as UIComponent;
                  return { ...pg, components: [...pg.components, newComp] };
                }),
              },
            };
          }),
        }));
      },

      deleteComponent: (pageId, componentId) => {
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.currentProjectId) return p;
            return {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                pages: p.graph.pages.map((pg) =>
                  pg.id !== pageId ? pg : { ...pg, components: pg.components.filter((c) => c.id !== componentId) }
                ),
              },
            };
          }),
          selectedComponentId: s.selectedComponentId === componentId ? null : s.selectedComponentId,
        }));
      },

      updateComponentProps: (pageId, componentId, props) => {
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.currentProjectId) return p;
            return {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                pages: p.graph.pages.map((pg) =>
                  pg.id !== pageId ? pg : {
                    ...pg,
                    components: pg.components.map((c) =>
                      c.id !== componentId ? c : { ...c, props } as UIComponent
                    ),
                  }
                ),
              },
            };
          }),
        }));
      },

      updateComponentStyle: (pageId, componentId, style) => {
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.currentProjectId) return p;
            return {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                pages: p.graph.pages.map((pg) =>
                  pg.id !== pageId ? pg : {
                    ...pg,
                    components: pg.components.map((c) =>
                      c.id !== componentId ? c : { ...c, style: { ...c.style, ...style } }
                    ),
                  }
                ),
              },
            };
          }),
        }));
      },

      reorderComponents: (pageId, orderedIds) => {
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.currentProjectId) return p;
            return {
              ...p,
              graph: {
                ...p.graph,
                pages: p.graph.pages.map((pg) => {
                  if (pg.id !== pageId) return pg;
                  const compMap = new Map(pg.components.map((c) => [c.id, c]));
                  const reordered = orderedIds.map((id) => compMap.get(id)).filter((c): c is UIComponent => c !== undefined);
                  return { ...pg, components: reordered };
                }),
              },
            };
          }),
        }));
      },

      updatePageStyle: (pageId, style) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              graph: {
                ...p.graph,
                pages: p.graph.pages.map((pg) =>
                  pg.id !== pageId ? pg : { ...pg, style: { ...pg.style, ...style } }
                ),
              },
            }
          ),
        }));
      },

      updateStateModelClassName: (name) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              stateModel: { ...p.stateModel, primaryClassName: name },
            }
          ),
        }));
      },

      addStateAttribute: () => {
        const id = uuidv4();
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              stateModel: {
                ...p.stateModel,
                attributes: [...p.stateModel.attributes, { id, name: "attribute", type: "string", description: "" }],
              },
            }
          ),
        }));
      },

      updateStateAttribute: (id, attr) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              stateModel: {
                ...p.stateModel,
                attributes: p.stateModel.attributes.map((a) => a.id === id ? { ...a, ...attr } : a),
              },
            }
          ),
        }));
      },

      deleteStateAttribute: (id) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              stateModel: {
                ...p.stateModel,
                attributes: p.stateModel.attributes.filter((a) => a.id !== id),
              },
            }
          ),
        }));
      },

      setSecondaryDataclass: (dc) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              stateModel: { ...p.stateModel, secondaryDataclass: dc },
            }
          ),
        }));
      },

      addSecondaryAttribute: () => {
        const id = uuidv4();
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.currentProjectId || !p.stateModel.secondaryDataclass) return p;
            return {
              ...p,
              lastModified: Date.now(),
              stateModel: {
                ...p.stateModel,
                secondaryDataclass: {
                  ...p.stateModel.secondaryDataclass,
                  attributes: [...p.stateModel.secondaryDataclass.attributes, { id, name: "attribute", type: "string", description: "" }],
                },
              },
            };
          }),
        }));
      },

      updateSecondaryAttribute: (id, attr) => {
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.currentProjectId || !p.stateModel.secondaryDataclass) return p;
            return {
              ...p,
              lastModified: Date.now(),
              stateModel: {
                ...p.stateModel,
                secondaryDataclass: {
                  ...p.stateModel.secondaryDataclass,
                  attributes: p.stateModel.secondaryDataclass.attributes.map((a) => a.id === id ? { ...a, ...attr } : a),
                },
              },
            };
          }),
        }));
      },

      deleteSecondaryAttribute: (id) => {
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== s.currentProjectId || !p.stateModel.secondaryDataclass) return p;
            return {
              ...p,
              lastModified: Date.now(),
              stateModel: {
                ...p.stateModel,
                secondaryDataclass: {
                  ...p.stateModel.secondaryDataclass,
                  attributes: p.stateModel.secondaryDataclass.attributes.filter((a) => a.id !== id),
                },
              },
            };
          }),
        }));
      },

      addAnnotation: (type, targetId, targetKind, description) => {
        const id = uuidv4();
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              annotations: [...p.annotations, { id, type, targetId, targetKind, description }],
            }
          ),
        }));
      },

      deleteAnnotation: (id) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              annotations: p.annotations.filter((a) => a.id !== id),
            }
          ),
        }));
      },

      updateAnnotation: (id, description) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== s.currentProjectId ? p : {
              ...p,
              lastModified: Date.now(),
              annotations: p.annotations.map((a) => a.id === id ? { ...a, description } : a),
            }
          ),
        }));
      },

      importProject: (data) => {
        set((s) => {
          const exists = s.projects.some((p) => p.id === data.id);
          if (exists) {
            return { projects: s.projects.map((p) => p.id === data.id ? data : p) };
          }
          return { projects: [...s.projects, data] };
        });
      },

      getCurrentProject: () => {
        const s = get();
        return s.projects.find((p) => p.id === s.currentProjectId);
      },

      getCurrentPage: () => {
        const s = get();
        const project = s.projects.find((p) => p.id === s.currentProjectId);
        return project?.graph.pages.find((pg) => pg.id === s.currentPageId);
      },
    }),
    { name: "visual-planner-storage" }
  )
);
