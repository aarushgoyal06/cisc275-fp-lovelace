// ========== PROJECT ==========
export interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: number;
}

// ========== STYLES ==========
export interface PageStyle {
  backgroundColor: string;
  fontFamily: string;
  flexDirection: "row" | "column";
  justifyContent: string;
  alignItems: string;
}

export interface ComponentStyle {
  color: string;
  border: string;
  padding: string;
  margin: string;
  fontSize: string;
}

// ========== COMPONENTS (discriminated union) ==========
export interface TextProps {
  content: string;
}
export interface TextBoxProps {
  name: string;
  defaultValue: string;
}
export interface TextAreaProps {
  name: string;
  defaultValue: string;
}
export interface CheckBoxProps {
  name: string;
  defaultValue: boolean;
}
export interface SelectBoxProps {
  name: string;
  options: string[];
  defaultValue: string;
}
export interface ButtonProps {
  label: string;
  routeId: string;
}
export interface HeaderProps {
  content: string;
  level: number;
}

export type ComponentType = "Text" | "TextBox" | "TextArea" | "CheckBox" | "SelectBox" | "Button" | "Header";

export type UIComponentProps =
  | { type: "Text"; props: TextProps }
  | { type: "TextBox"; props: TextBoxProps }
  | { type: "TextArea"; props: TextAreaProps }
  | { type: "CheckBox"; props: CheckBoxProps }
  | { type: "SelectBox"; props: SelectBoxProps }
  | { type: "Button"; props: ButtonProps }
  | { type: "Header"; props: HeaderProps };

export type UIComponent = UIComponentProps & {
  id: string;
  style: ComponentStyle;
};

// ========== PAGE ==========
export interface Page {
  id: string;
  name: string;
  components: UIComponent[];
  style: PageStyle;
}

// ========== ROUTE ==========
export interface Route {
  id: string;
  sourcePageId: string;
  targetPageId: string;
  label: string;
}

// ========== GRAPH ==========
export interface Graph {
  pages: Page[];
  routes: Route[];
  nodePositions: Record<string, { x: number; y: number }>;
}

// ========== STATE MODEL ==========
export type AttributeType = "string" | "number" | "boolean" | "list" | "custom";

export interface StateAttribute {
  id: string;
  name: string;
  type: AttributeType;
  description: string;
}

export interface SecondaryDataclass {
  id: string;
  name: string;
  attributes: StateAttribute[];
}

export interface StateModel {
  primaryClassName: string;
  attributes: StateAttribute[];
  secondaryDataclass: SecondaryDataclass | null;
}

// ========== ANNOTATIONS ==========
export type AnnotationType = "if" | "for";

export interface Annotation {
  id: string;
  type: AnnotationType;
  targetId: string;
  targetKind: "page" | "route";
  description: string;
}

// ========== FULL PROJECT DATA ==========
export interface ProjectData extends Project {
  graph: Graph;
  stateModel: StateModel;
  annotations: Annotation[];
}
