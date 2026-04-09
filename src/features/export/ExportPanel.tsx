import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { generatePythonCode } from "../../utils/codeGen";
import { exportToDocx } from "../../utils/exportDocx";
import type { ProjectData } from "../../types";

export function ExportPanel() {
  const { getCurrentProject, importProject, setView } = useAppStore();
  const project = getCurrentProject();
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");

  if (!project) return null;

  const handleGenerateCode = () => {
    const generated = generatePythonCode(project);
    setCode(generated);
    setShowCode(true);
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDocx = async () => {
    await exportToDocx(project);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as ProjectData;
        if (typeof data.id !== "string" || typeof data.name !== "string" || typeof data.graph !== "object") {
          setImportError("Invalid project file format");
          return;
        }
        importProject(data);
        setImportError("");
        alert(`Project "${data.name}" imported successfully!`);
      } catch {
        setImportError("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setView("project")} className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1">
          ← {project.name}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Export &amp; Import</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleGenerateCode}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow hover:border-blue-300"
          >
            <div className="text-3xl mb-3">🐍</div>
            <h3 className="text-base font-semibold text-gray-900">Generate Python</h3>
            <p className="text-sm text-gray-500 mt-1">Drafter-style Python starter code</p>
          </button>
          <button
            onClick={handleExportJson}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow hover:border-blue-300"
          >
            <div className="text-3xl mb-3">📄</div>
            <h3 className="text-base font-semibold text-gray-900">Export JSON</h3>
            <p className="text-sm text-gray-500 mt-1">Save full project state</p>
          </button>
          <button
            onClick={() => void handleExportDocx()}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow hover:border-blue-300"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-base font-semibold text-gray-900">Export DOCX</h3>
            <p className="text-sm text-gray-500 mt-1">Design document for stakeholders</p>
          </button>
        </div>

        {/* Import */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Import Project</h2>
          <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50">
            <div className="text-center">
              <p className="text-sm text-gray-500">Click to upload a .json project file</p>
            </div>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          {importError && <p className="text-red-500 text-sm mt-2">{importError}</p>}
        </div>

        {/* Generated Code */}
        {showCode && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
              <span className="text-sm text-gray-300 font-medium">Generated Python Code</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 overflow-auto text-sm text-green-400 bg-gray-900 max-h-96 font-mono">
              {code}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
