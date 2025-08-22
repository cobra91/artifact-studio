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
