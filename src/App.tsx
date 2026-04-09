import { useAppStore } from "./store/useAppStore";
import { Dashboard } from "./features/dashboard/Dashboard";
import { ProjectOverview } from "./features/project/ProjectOverview";
import { GraphEditor } from "./features/graph/GraphEditor";
import { PageEditor } from "./features/page-editor/PageEditor";
import { StateDesigner } from "./features/state-designer/StateDesigner";
import { AnnotationPanel } from "./features/annotations/AnnotationPanel";
import { ExportPanel } from "./features/export/ExportPanel";

export function App() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case "dashboard":
      return <Dashboard />;
    case "project":
      return <ProjectOverview />;
    case "graph":
      return <GraphEditor />;
    case "page-editor":
      return <PageEditor />;
    case "state-designer":
      return <StateDesigner />;
    case "annotations":
      return <AnnotationPanel />;
    case "export":
      return <ExportPanel />;
    default:
      return <Dashboard />;
  }
}

export default App;
