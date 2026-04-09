import type { UIComponent } from "../../types";

export function PreviewComponent({ component }: { component: UIComponent }) {
  const style: React.CSSProperties = {
    color: component.style.color,
    border: component.style.border,
    padding: component.style.padding,
    margin: component.style.margin,
    fontSize: component.style.fontSize,
    width: "100%",
  };

  switch (component.type) {
    case "Text":
      return <p style={style}>{component.props.content}</p>;
    case "Header": {
      const level = Math.min(6, Math.max(1, component.props.level));
      if (level === 1) return <h1 style={{ ...style, fontWeight: "bold" }}>{component.props.content}</h1>;
      if (level === 2) return <h2 style={{ ...style, fontWeight: "bold" }}>{component.props.content}</h2>;
      if (level === 3) return <h3 style={{ ...style, fontWeight: "bold" }}>{component.props.content}</h3>;
      if (level === 4) return <h4 style={{ ...style, fontWeight: "bold" }}>{component.props.content}</h4>;
      if (level === 5) return <h5 style={{ ...style, fontWeight: "bold" }}>{component.props.content}</h5>;
      return <h6 style={{ ...style, fontWeight: "bold" }}>{component.props.content}</h6>;
    }
    case "TextBox":
      return <input type="text" placeholder={component.props.defaultValue || component.props.name} style={style} className="rounded pointer-events-none" readOnly />;
    case "TextArea":
      return <textarea placeholder={component.props.defaultValue || component.props.name} style={style} className="rounded pointer-events-none" readOnly rows={3} />;
    case "CheckBox":
      return (
        <label style={style} className="flex items-center gap-2 pointer-events-none">
          <input type="checkbox" defaultChecked={component.props.defaultValue} readOnly />
          {component.props.name}
        </label>
      );
    case "SelectBox":
      return (
        <select style={style} className="rounded pointer-events-none" disabled>
          {component.props.options.map((opt) => <option key={opt}>{opt}</option>)}
        </select>
      );
    case "Button":
      return <button style={{ ...style, cursor: "default", borderRadius: "6px", backgroundColor: "#3b82f6", color: "white", fontWeight: 500 }}>{component.props.label}</button>;
  }
}
