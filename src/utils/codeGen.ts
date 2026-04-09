import type { ProjectData, UIComponent } from "../types";

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function pythonType(t: string): string {
  switch (t) {
    case "string": return "str";
    case "number": return "int";
    case "boolean": return "bool";
    case "list": return "list";
    default: return t;
  }
}

function componentToInput(comp: UIComponent): string | null {
  switch (comp.type) {
    case "TextBox": return `${comp.props.name}: str = "${comp.props.defaultValue}"`;
    case "TextArea": return `${comp.props.name}: str = "${comp.props.defaultValue}"`;
    case "CheckBox": return `${comp.props.name}: bool = ${comp.props.defaultValue ? "True" : "False"}`;
    case "SelectBox": return `${comp.props.name}: str = "${comp.props.defaultValue}"`;
    default: return null;
  }
}

export function generatePythonCode(project: ProjectData): string {
  const { stateModel, graph } = project;
  const lines: string[] = [];

  lines.push("from drafter import *");
  lines.push("from dataclasses import dataclass, field");
  lines.push("from typing import List");
  lines.push("");

  if (stateModel.secondaryDataclass) {
    const dc = stateModel.secondaryDataclass;
    lines.push("@dataclass");
    lines.push(`class ${dc.name}:`);
    if (dc.attributes.length === 0) {
      lines.push("    pass");
    } else {
      for (const attr of dc.attributes) {
        lines.push(`    ${attr.name}: ${pythonType(attr.type)}`);
      }
    }
    lines.push("");
  }

  lines.push("@dataclass");
  lines.push(`class ${stateModel.primaryClassName}:`);
  if (stateModel.attributes.length === 0) {
    lines.push("    pass");
  } else {
    for (const attr of stateModel.attributes) {
      const typeName = attr.type === "list" && stateModel.secondaryDataclass
        ? `List[${stateModel.secondaryDataclass.name}]`
        : pythonType(attr.type);
      if (attr.type === "list") {
        lines.push(`    ${attr.name}: ${typeName} = field(default_factory=list)`);
      } else if (attr.type === "string") {
        lines.push(`    ${attr.name}: ${typeName} = ""`);
      } else if (attr.type === "number") {
        lines.push(`    ${attr.name}: ${typeName} = 0`);
      } else if (attr.type === "boolean") {
        lines.push(`    ${attr.name}: ${typeName} = False`);
      } else {
        lines.push(`    ${attr.name}: ${typeName}`);
      }
    }
  }
  lines.push("");

  for (const page of graph.pages) {
    const outgoingRoutes = graph.routes.filter((r) => r.sourcePageId === page.id);
    const annotations = project.annotations.filter((a) => a.targetId === page.id);

    const inputs = page.components.map(componentToInput).filter(Boolean);

    const funcName = page.name.toLowerCase().replace(/[^a-z0-9]/g, "_");

    lines.push(`@route`);
    lines.push(`def ${funcName}(state: ${stateModel.primaryClassName}${inputs.length > 0 ? ", " + inputs.join(", ") : ""}) -> Page:`);

    for (const ann of annotations) {
      if (ann.type === "if") {
        lines.push(`    # if: ${ann.description}`);
      } else {
        lines.push(`    # for: ${ann.description}`);
      }
    }

    lines.push(`    return Page(state, [`);

    for (const comp of page.components) {
      switch (comp.type) {
        case "Header":
          lines.push(`        Header("${escapeString(comp.props.content)}"),`);
          break;
        case "Text":
          lines.push(`        Text("${escapeString(comp.props.content)}"),`);
          break;
        case "TextBox":
          lines.push(`        TextBox("${comp.props.name}"),`);
          break;
        case "TextArea":
          lines.push(`        TextArea("${comp.props.name}"),`);
          break;
        case "CheckBox":
          lines.push(`        CheckBox("${comp.props.name}"),`);
          break;
        case "SelectBox":
          lines.push(`        SelectBox("${comp.props.name}", [${comp.props.options.map((o) => `"${o}"`).join(", ")}]),`);
          break;
        case "Button": {
          const targetRoute = graph.routes.find((r) => r.id === comp.props.routeId);
          const targetPage = targetRoute ? graph.pages.find((pg) => pg.id === targetRoute.targetPageId) : null;
          const targetFunc = targetPage ? targetPage.name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "index";
          lines.push(`        Button("${comp.props.label}", ${targetFunc}),`);
          break;
        }
      }
    }

    lines.push(`    ])`);
    lines.push("");

    for (const route of outgoingRoutes) {
      const routeAnnotations = project.annotations.filter((a) => a.targetId === route.id);
      const targetPage = graph.pages.find((pg) => pg.id === route.targetPageId);
      if (!targetPage) continue;
      const targetFunc = targetPage.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const routeFuncName = route.label.replace(/\//g, "").replace(/[^a-z0-9]/g, "_") || `route_${targetFunc}`;

      lines.push(`@route`);
      lines.push(`def ${routeFuncName}(state: ${stateModel.primaryClassName}) -> Page:`);
      for (const ann of routeAnnotations) {
        if (ann.type === "if") {
          lines.push(`    # if: ${ann.description}`);
        } else {
          lines.push(`    # for: ${ann.description}`);
        }
      }
      lines.push(`    return ${targetFunc}(state)`);
      lines.push("");
    }
  }

  if (graph.pages.length > 0) {
    const firstPage = graph.pages[0];
    const firstFuncName = firstPage.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    lines.push(`start_server(${firstFuncName}, ${stateModel.primaryClassName}())`);
  } else {
    lines.push(`# No pages defined yet`);
    lines.push(`# start_server(index, ${stateModel.primaryClassName}())`);
  }

  return lines.join("\n");
}
