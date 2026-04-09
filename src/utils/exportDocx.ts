import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import type { ProjectData } from "../types";

export async function exportToDocx(project: ProjectData): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  children.push(new Paragraph({ text: project.name, heading: HeadingLevel.TITLE }));
  children.push(new Paragraph({ text: project.description }));
  children.push(new Paragraph({ text: "" }));

  children.push(new Paragraph({ text: "Project Overview", heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ children: [new TextRun({ text: "Last Modified: ", bold: true }), new TextRun(new Date(project.lastModified).toLocaleString())] }));
  children.push(new Paragraph({ text: "" }));

  children.push(new Paragraph({ text: "Pages", heading: HeadingLevel.HEADING_1 }));
  for (const page of project.graph.pages) {
    children.push(new Paragraph({ text: page.name, heading: HeadingLevel.HEADING_2 }));
    if (page.components.length === 0) {
      children.push(new Paragraph({ text: "No components" }));
    } else {
      const rows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Type", bold: true })] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Properties", bold: true })] })], width: { size: 70, type: WidthType.PERCENTAGE } }),
          ],
        }),
        ...page.components.map((comp) => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(comp.type)] }),
            new TableCell({ children: [new Paragraph(JSON.stringify(comp.props))] }),
          ],
        })),
      ];
      children.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }
    children.push(new Paragraph({ text: "" }));
  }

  children.push(new Paragraph({ text: "Navigation Routes", heading: HeadingLevel.HEADING_1 }));
  for (const route of project.graph.routes) {
    const src = project.graph.pages.find((p) => p.id === route.sourcePageId);
    const tgt = project.graph.pages.find((p) => p.id === route.targetPageId);
    children.push(new Paragraph({ children: [
      new TextRun({ text: route.label, bold: true }),
      new TextRun(`: ${src?.name ?? "?"} → ${tgt?.name ?? "?"}`),
    ]}));
  }
  children.push(new Paragraph({ text: "" }));

  children.push(new Paragraph({ text: "State Model", heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ text: project.stateModel.primaryClassName, heading: HeadingLevel.HEADING_2 }));
  if (project.stateModel.attributes.length > 0) {
    const attrRows = [
      new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Type", bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })] }),
      ]}),
      ...project.stateModel.attributes.map((a) => new TableRow({ children: [
        new TableCell({ children: [new Paragraph(a.name)] }),
        new TableCell({ children: [new Paragraph(a.type)] }),
        new TableCell({ children: [new Paragraph(a.description)] }),
      ]})),
    ];
    children.push(new Table({ rows: attrRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
  }
  children.push(new Paragraph({ text: "" }));

  if (project.stateModel.secondaryDataclass) {
    const dc = project.stateModel.secondaryDataclass;
    children.push(new Paragraph({ text: dc.name, heading: HeadingLevel.HEADING_2 }));
    if (dc.attributes.length > 0) {
      const dcRows = [
        new TableRow({ children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Type", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })] }),
        ]}),
        ...dc.attributes.map((a) => new TableRow({ children: [
          new TableCell({ children: [new Paragraph(a.name)] }),
          new TableCell({ children: [new Paragraph(a.type)] }),
          new TableCell({ children: [new Paragraph(a.description)] }),
        ]})),
      ];
      children.push(new Table({ rows: dcRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }
    children.push(new Paragraph({ text: "" }));
  }

  if (project.annotations.length > 0) {
    children.push(new Paragraph({ text: "Logic Annotations", heading: HeadingLevel.HEADING_1 }));
    for (const ann of project.annotations) {
      const target = [...project.graph.pages, ...project.graph.routes].find((t) => t.id === ann.targetId);
      const targetName = target
        ? ("name" in target ? target.name : (target as { label: string }).label)
        : ann.targetId;
      children.push(new Paragraph({ children: [
        new TextRun({ text: `[${ann.type.toUpperCase()}] `, bold: true }),
        new TextRun({ text: `${ann.targetKind}: ${targetName} — ` }),
        new TextRun(ann.description),
      ]}));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.name.replace(/\s+/g, "_")}_design.docx`;
  link.click();
  URL.revokeObjectURL(url);
}
