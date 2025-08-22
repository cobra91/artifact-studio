// ComponentNode operations and utilities
import {
  ComponentMetadata,
  ComponentNode,
  ComponentProps,
  ComponentStyles,
  ComponentType,
  ValidationError,
  ValidationRule,
} from "../types/artifact";
import { validateProperty } from "./validationUtils";

// ComponentNode factory functions
export const createComponentNode = (
  type: ComponentType,
  id?: string,
  props: ComponentProps = {},
  styles: ComponentStyles = {},
  position: { x: number; y: number } = { x: 0, y: 0 },
  size: { width: number; height: number } = { width: 100, height: 50 },
  metadata?: ComponentMetadata
): ComponentNode => {
  return {
    id: id || generateComponentId(),
    type,
    props,
    children: [],
    position,
    size,
    rotation: 0,
    skew: { x: 0, y: 0 },
    styles,
    responsiveStyles: undefined,
    metadata: metadata || createDefaultMetadata(),
  };
};

export const generateComponentId = (): string => {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createDefaultMetadata = (): ComponentMetadata => {
  const now = new Date();
  return {
    version: "1.0.0",
    created: now,
    modified: now,
    author: "system",
    description: "",
    tags: [],
    locked: false,
    hidden: false,
  };
};

const mergeMetadata = (
  existing: ComponentMetadata | undefined,
  updates: Partial<ComponentMetadata>
): ComponentMetadata => {
  const base = existing || createDefaultMetadata();
  return {
    ...base,
    ...updates,
  };
};

// ComponentNode operations
export const addChildComponent = (
  parent: ComponentNode,
  child: ComponentNode
): ComponentNode => {
  if (!parent.children) {
    parent.children = [];
  }
  return {
    ...parent,
    children: [...parent.children, child],
    metadata: mergeMetadata(parent.metadata, { modified: new Date() }),
  };
};

export const removeChildComponent = (
  parent: ComponentNode,
  childId: string
): ComponentNode => {
  if (!parent.children) {
    return parent;
  }
  return {
    ...parent,
    children: parent.children.filter(child => child.id !== childId),
    metadata: mergeMetadata(parent.metadata, { modified: new Date() }),
  };
};

export const updateComponentProps = (
  component: ComponentNode,
  updates: Partial<ComponentProps>
): ComponentNode => {
  return {
    ...component,
    props: { ...component.props, ...updates },
    metadata: mergeMetadata(component.metadata, { modified: new Date() }),
  };
};

export const updateComponentStyles = (
  component: ComponentNode,
  updates: Partial<ComponentStyles>
): ComponentNode => {
  return {
    ...component,
    styles: { ...component.styles, ...updates },
    metadata: mergeMetadata(component.metadata, { modified: new Date() }),
  };
};

export const updateComponentPosition = (
  component: ComponentNode,
  position: { x: number; y: number }
): ComponentNode => {
  return {
    ...component,
    position,
    metadata: mergeMetadata(component.metadata, { modified: new Date() }),
  };
};

export const updateComponentSize = (
  component: ComponentNode,
  size: { width: number; height: number }
): ComponentNode => {
  return {
    ...component,
    size,
    metadata: mergeMetadata(component.metadata, { modified: new Date() }),
  };
};

// Validation functions
export const validateComponentProps = (
  props: ComponentProps,
  validationRules: Record<string, ValidationRule[]> = {}
): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const [key, value] of Object.entries(props)) {
    const rules = validationRules[key];
    if (rules && value !== undefined) {
      for (const rule of rules) {
        const errorMessage = validateProperty(value, [rule]);
        if (errorMessage) {
          errors.push({
            field: key,
            message: errorMessage,
            type: rule.type,
            value,
          });
        }
      }
    }
  }

  return errors;
};

export const validateComponentNode = (
  component: ComponentNode,
  validationRules: Record<string, ValidationRule[]> = {}
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate props
  const propErrors = validateComponentProps(component.props, validationRules);
  errors.push(...propErrors);

  // Validate required fields
  if (!component.id) {
    errors.push({
      field: "id",
      message: "Component ID is required",
      type: "required",
      value: component.id,
    });
  }

  if (!component.type) {
    errors.push({
      field: "type",
      message: "Component type is required",
      type: "required",
      value: component.type,
    });
  }

  // Validate position and size
  if (typeof component.position.x !== "number" || component.position.x < 0) {
    errors.push({
      field: "position.x",
      message: "Position X must be a non-negative number",
      type: "min",
      value: component.position.x,
    });
  }

  if (typeof component.position.y !== "number" || component.position.y < 0) {
    errors.push({
      field: "position.y",
      message: "Position Y must be a non-negative number",
      type: "min",
      value: component.position.y,
    });
  }

  if (typeof component.size.width !== "number" || component.size.width <= 0) {
    errors.push({
      field: "size.width",
      message: "Width must be a positive number",
      type: "min",
      value: component.size.width,
    });
  }

  if (typeof component.size.height !== "number" || component.size.height <= 0) {
    errors.push({
      field: "size.height",
      message: "Height must be a positive number",
      type: "min",
      value: component.size.height,
    });
  }

  // Validate children recursively
  if (component.children) {
    for (let i = 0; i < component.children.length; i++) {
      const childErrors = validateComponentNode(
        component.children[i],
        validationRules
      );
      errors.push(
        ...childErrors.map(error => ({
          ...error,
          field: `children[${i}].${error.field}`,
        }))
      );
    }
  }

  return errors;
};

// Utility functions
export const findComponentById = (
  root: ComponentNode,
  id: string
): ComponentNode | null => {
  if (root.id === id) {
    return root;
  }

  if (root.children) {
    for (const child of root.children) {
      const found = findComponentById(child, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

export const getComponentDepth = (component: ComponentNode): number => {
  if (!component.children || component.children.length === 0) {
    return 0;
  }

  const childDepths = component.children.map(getComponentDepth);
  return Math.max(...childDepths) + 1;
};

export const cloneComponentNode = (component: ComponentNode): ComponentNode => {
  const metadata = mergeMetadata(component.metadata, {
    created: new Date(component.metadata?.created || new Date()),
    modified: new Date(component.metadata?.modified || new Date()),
  });

  return {
    ...component,
    children: component.children?.map(cloneComponentNode) || [],
    metadata,
  };
};

export const getComponentByPath = (
  root: ComponentNode,
  path: number[]
): ComponentNode | null => {
  let current: ComponentNode = root;

  for (const index of path) {
    if (!current.children || index >= current.children.length) {
      return null;
    }
    current = current.children[index];
  }

  return current;
};

// Component duplication and cloning operations
export const duplicateComponent = (
  component: ComponentNode,
  offsetPosition: { x: number; y: number } = { x: 20, y: 20 }
): ComponentNode => {
  const duplicated = cloneComponentNode(component);
  duplicated.id = generateComponentId();
  duplicated.position = {
    x: component.position.x + offsetPosition.x,
    y: component.position.y + offsetPosition.y,
  };
  
  // Update metadata for duplication
  const now = new Date();
  duplicated.metadata = mergeMetadata(duplicated.metadata, {
    created: now,
    modified: now,
    description: `Copy of ${component.metadata?.description || component.type}`,
  });
  
  // Recursively update child IDs
  const updateChildIds = (node: ComponentNode): void => {
    node.id = generateComponentId();
    if (node.children) {
      node.children.forEach(updateChildIds);
    }
  };
  
  if (duplicated.children) {
    duplicated.children.forEach(updateChildIds);
  }
  
  return duplicated;
};

// Group and ungroup operations
export const createGroup = (
  components: ComponentNode[],
  groupId?: string
): ComponentNode => {
  if (components.length === 0) {
    throw new Error("Cannot create group with no components");
  }
  
  // Calculate bounding box for the group
  const minX = Math.min(...components.map(c => c.position.x));
  const minY = Math.min(...components.map(c => c.position.y));
  const maxX = Math.max(...components.map(c => c.position.x + c.size.width));
  const maxY = Math.max(...components.map(c => c.position.y + c.size.height));
  
  // Adjust component positions relative to group origin
  const adjustedComponents = components.map(component => ({
    ...component,
    position: {
      x: component.position.x - minX,
      y: component.position.y - minY,
    },
  }));
  
  const group = createComponentNode(
    "container",
    groupId,
    { className: "component-group" },
    {},
    { x: minX, y: minY },
    { width: maxX - minX, height: maxY - minY },
    {
      ...createDefaultMetadata(),
      description: `Group of ${components.length} components`,
      tags: ["group"],
    }
  );
  
  group.children = adjustedComponents;
  return group;
};

export const ungroupComponents = (
  group: ComponentNode,
  parentPosition: { x: number; y: number } = { x: 0, y: 0 }
): ComponentNode[] => {
  if (!group.children || group.children.length === 0) {
    return [];
  }
  
  // Restore absolute positions of child components
  return group.children.map(child => ({
    ...child,
    position: {
      x: child.position.x + group.position.x + parentPosition.x,
      y: child.position.y + group.position.y + parentPosition.y,
    },
  }));
};

// Transformation operations
export const applySkewTransformation = (
  component: ComponentNode,
  skew: { x: number; y: number }
): ComponentNode => {
  return {
    ...component,
    skew,
    metadata: mergeMetadata(component.metadata, { modified: new Date() }),
  };
};

export const applyRotationTransformation = (
  component: ComponentNode,
  rotation: number
): ComponentNode => {
  return {
    ...component,
    rotation: rotation % 360, // Normalize rotation to 0-359 degrees
    metadata: mergeMetadata(component.metadata, { modified: new Date() }),
  };
};

// Grid snapping utilities
export const snapToGrid = (
  position: { x: number; y: number },
  gridSize: number = 20
): { x: number; y: number } => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
};

export const snapSizeToGrid = (
  size: { width: number; height: number },
  gridSize: number = 20
): { width: number; height: number } => {
  return {
    width: Math.max(gridSize, Math.round(size.width / gridSize) * gridSize),
    height: Math.max(gridSize, Math.round(size.height / gridSize) * gridSize),
  };
};

// Component selection utilities
export const isComponentInSelection = (
  component: ComponentNode,
  selectionRect: { x: number; y: number; width: number; height: number }
): boolean => {
  const compRight = component.position.x + component.size.width;
  const compBottom = component.position.y + component.size.height;
  const selRight = selectionRect.x + selectionRect.width;
  const selBottom = selectionRect.y + selectionRect.height;
  
  return (
    component.position.x < selRight &&
    compRight > selectionRect.x &&
    component.position.y < selBottom &&
    compBottom > selectionRect.y
  );
};

// Component import/export utilities
export const exportComponentToJSON = (component: ComponentNode): string => {
  return JSON.stringify(component, null, 2);
};

export const importComponentFromJSON = (jsonString: string): ComponentNode => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate that it's a valid ComponentNode
    const errors = validateComponentNode(parsed);
    if (errors.length > 0) {
      throw new Error(`Invalid component data: ${errors.map(e => e.message).join(', ')}`);
    }
    
    return parsed;
  } catch (error) {
    throw new Error(`Failed to import component: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
