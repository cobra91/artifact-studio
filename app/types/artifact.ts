// Core component types
export type ComponentType =
  | "container" // Layout containers
  | "text" // Text elements
  | "button" // Interactive buttons
  | "input" // Form inputs
  | "image" // Images and media
  | "chart" // Data visualizations
  | "custom"; // User-defined components

// Enhanced ComponentNode with metadata and validation
export interface ComponentNode {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: ComponentNode[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation?: number; // in degrees
  skew?: { x: number; y: number }; // in degrees
  styles: ComponentStyles;
  responsiveStyles?: ResponsiveStyles;
  metadata?: ComponentMetadata;
}

// Type-safe component properties
export interface ComponentProps {
  [key: string]: string | number | boolean | string[] | undefined;
  className?: string;
  children?: string;
  placeholder?: string;
  src?: string;
  alt?: string;
  href?: string;
  target?: string;
  disabled?: boolean;
  required?: boolean;
}

// Enhanced styles with responsive support
export interface ComponentStyles {
  [property: string]: string | undefined;
  // Layout
  display?: string;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  // Typography
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  lineHeight?: string;
  textAlign?: string;
  color?: string;
  // Appearance
  backgroundColor?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  opacity?: string;
}

// Responsive styles for different breakpoints
export interface ResponsiveStyles {
  base?: ComponentStyles;
  sm?: ComponentStyles;
  md?: ComponentStyles;
  lg?: ComponentStyles;
}

// Component metadata for versioning and tracking
export interface ComponentMetadata {
  version: string;
  created: Date;
  modified: Date;
  author?: string;
  description?: string;
  tags?: string[];
  locked?: boolean;
  hidden?: boolean;
}

// Enhanced template system with community features
export interface ArtifactTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string; // Base64 or URL
  code: string; // Generated React code
  components: ComponentNode[]; // Component tree
  tags: string[]; // Search tags
  rating: number; // Community rating (0-5)
  downloads: number; // Usage statistics
  author: string; // Creator info
  license: string; // Usage license
  created: Date;
  modified: Date;
  isPublic: boolean; // Available in marketplace
  framework: Framework; // Target framework
  styling: StylingApproach; // Styling method
}

// Framework and styling types
export type Framework = "react" | "vue" | "svelte";
export type StylingApproach = "tailwindcss" | "css" | "styled-components";
export type InteractivityLevel = "low" | "medium" | "high";

// Enhanced AI generation request
export interface AIGenerationRequest {
  prompt: string;
  framework: Framework;
  styling: StylingApproach;
  interactivity: InteractivityLevel;
  theme: "default" | "modern" | "minimalist";
  context?: {
    existingComponents?: ComponentNode[];
    targetContainer?: string;
    stylePreferences?: ComponentStyles;
  };
}

export interface SandboxResult {
  success: boolean;
  code: string;
  preview: string;
  errors?: string[];
}

// Property definition system for dynamic component editing
export interface PropertyDefinition {
  key: string;
  label: string;
  type: PropertyType;
  defaultValue: PropertyValue;
  options?: string[]; // For select type
  validation?: ValidationRule[];
  description?: string;
  category?: PropertyCategory;
}

export type PropertyType =
  | "string"
  | "number"
  | "boolean"
  | "color"
  | "select"
  | "textarea"
  | "url"
  | "email";

export type PropertyValue = string | number | boolean | string[];

export type PropertyCategory =
  | "content"
  | "layout"
  | "appearance"
  | "behavior"
  | "accessibility";

// Validation system
export interface ValidationRule {
  type: ValidationType;
  value?: PropertyValue;
  message: string;
}

export type ValidationType =
  | "required"
  | "minLength"
  | "maxLength"
  | "min"
  | "max"
  | "pattern"
  | "email"
  | "url";

// Style property definitions
export interface StyleProperty {
  property: string;
  label: string;
  type: StylePropertyType;
  category: StyleCategory;
  responsive: boolean;
  defaultValue?: string;
  options?: string[];
}

export type StylePropertyType =
  | "length"
  | "color"
  | "select"
  | "number"
  | "percentage"
  | "keyword";

export type StyleCategory =
  | "layout"
  | "typography"
  | "appearance"
  | "spacing"
  | "positioning"
  | "effects";

// Component definition for extensible component system
export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  icon: string;
  description: string;
  defaultProps: ComponentProps;
  editableProps: PropertyDefinition[];
  supportedStyles: StyleProperty[];
  canHaveChildren: boolean;
  category: ComponentCategory;
  tags: string[];
}

export type ComponentCategory =
  | "layout"
  | "content"
  | "form"
  | "media"
  | "data"
  | "navigation"
  | "feedback";

// Error handling types
export interface ValidationError {
  field: string;
  message: string;
  type: ValidationType;
  value: PropertyValue;
}

export interface ComponentError {
  componentId: string;
  type: ComponentErrorType;
  message: string;
  field?: string;
  suggestion?: string;
}

export type ComponentErrorType =
  | "validation"
  | "rendering"
  | "property"
  | "style"
  | "children";

// Enhanced sandbox result with detailed error information
export interface EnhancedSandboxResult extends SandboxResult {
  executionTime?: number;
  memoryUsage?: number;
  warnings?: string[];
  performance?: {
    renderTime: number;
    bundleSize: number;
    dependencies: string[];
  };
}

// Application state types for comprehensive state management
export interface AppState {
  canvas: CanvasState;
  ui: UIState;
  generation: GenerationState;
  templates: TemplateState;
  history: HistoryState;
}

export interface CanvasState {
  components: ComponentNode[];
  selectedNodes: string[];
  clipboard: ComponentNode[];
  draggedComponent?: ComponentNode;
  hoveredComponent?: string;
  gridVisible: boolean;
  snapToGrid: boolean;
  zoom: number;
}

export interface UIState {
  activePanel: PanelType;
  previewMode: PreviewMode;
  sidebarCollapsed: boolean;
  fullscreenPreview: boolean;
  theme: "light" | "dark";
}

export type PanelType =
  | "library"
  | "properties"
  | "ai"
  | "templates"
  | "history"
  | "settings";

export type PreviewMode = "desktop" | "tablet" | "mobile";

export interface GenerationState {
  isGenerating: boolean;
  currentRequest?: AIGenerationRequest;
  generationHistory: GenerationResult[];
  lastError?: string;
}

export interface GenerationResult {
  id: string;
  request: AIGenerationRequest;
  result: EnhancedSandboxResult;
  timestamp: Date;
  components: ComponentNode[];
}

export interface TemplateState {
  local: ArtifactTemplate[];
  community: ArtifactTemplate[];
  favorites: string[];
  searchQuery: string;
  selectedCategory: string;
  loading: boolean;
  error?: string;
}

export interface HistoryState {
  snapshots: CanvasSnapshot[];
  currentIndex: number;
  maxSnapshots: number;
}

export interface CanvasSnapshot {
  id: string;
  timestamp: Date;
  components: ComponentNode[];
  description: string;
}
