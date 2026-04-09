import { useAppStore } from "../../store/useAppStore";
import type { UIComponent } from "../../types";

interface Props {
  pageId: string;
  component: UIComponent;
}

export function ComponentConfig({ pageId, component }: Props) {
  const { updateComponentProps, updateComponentStyle } = useAppStore();

  const updateProp = (key: string, value: string | boolean | number | string[]) => {
    const updatedProps = { ...component.props, [key]: value };
    updateComponentProps(pageId, component.id, updatedProps as typeof component.props);
  };

  const renderPropsEditor = () => {
    switch (component.type) {
      case "Text":
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Content</label>
            <textarea value={component.props.content} onChange={(e) => updateProp("content", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" rows={3} />
          </div>
        );
      case "Header":
        return (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Content</label>
              <input type="text" value={component.props.content} onChange={(e) => updateProp("content", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Level (1-6)</label>
              <input type="number" min={1} max={6} value={component.props.level} onChange={(e) => updateProp("level", parseInt(e.target.value, 10))} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
          </>
        );
      case "TextBox":
      case "TextArea":
        return (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input type="text" value={component.props.name} onChange={(e) => updateProp("name", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Default Value</label>
              <input type="text" value={component.props.defaultValue} onChange={(e) => updateProp("defaultValue", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
          </>
        );
      case "CheckBox":
        return (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input type="text" value={component.props.name} onChange={(e) => updateProp("name", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={component.props.defaultValue} onChange={(e) => updateProp("defaultValue", e.target.checked)} />
              <label className="text-xs text-gray-500">Default Checked</label>
            </div>
          </>
        );
      case "SelectBox":
        return (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input type="text" value={component.props.name} onChange={(e) => updateProp("name", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Options (one per line)</label>
              <textarea
                value={component.props.options.join("\n")}
                onChange={(e) => updateProp("options", e.target.value.split("\n").filter(Boolean))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                rows={4}
              />
            </div>
          </>
        );
      case "Button":
        return (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label</label>
              <input type="text" value={component.props.label} onChange={(e) => updateProp("label", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Route ID</label>
              <input type="text" value={component.props.routeId} onChange={(e) => updateProp("routeId", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">{component.type}</h3>
        <p className="text-xs text-gray-400">ID: {component.id.slice(0, 8)}…</p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Properties</h4>
        {renderPropsEditor()}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Styles</h4>
        {(["color", "border", "padding", "margin", "fontSize"] as const).map((key) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 mb-1 capitalize">{key}</label>
            <input
              type="text"
              value={component.style[key]}
              onChange={(e) => updateComponentStyle(pageId, component.id, { [key]: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Text Color</label>
          <input type="color" value={component.style.color} onChange={(e) => updateComponentStyle(pageId, component.id, { color: e.target.value })} className="h-8 w-full rounded cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
