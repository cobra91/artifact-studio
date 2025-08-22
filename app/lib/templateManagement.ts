// Template management utilities for creation, validation, and persistence
import {
  ArtifactTemplate,
  ComponentNode,
  Framework,
  StylingApproach,
  ValidationError,
} from "../types/artifact";

// Generate unique template ID
export const generateTemplateId = (): string => {
  return `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Generate unique component ID for duplication
export const generateComponentId = (): string => {
  return `component_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Create a new template from components
export interface CreateTemplateData {
  name: string;
  description?: string;
  category?: string;
  components: ComponentNode[];
  author: string;
  framework: Framework;
  styling: StylingApproach;
  tags?: string[];
  license?: string;
  isPublic?: boolean;
}

export const createTemplate = (data: CreateTemplateData): ArtifactTemplate => {
  const now = new Date();

  // Validate required fields
  if (
    !data.name ||
    !data.components ||
    !data.author ||
    !data.framework ||
    !data.styling
  ) {
    throw new Error("Missing required template fields");
  }

  return {
    id: generateTemplateId(),
    name: data.name,
    description: data.description || "",
    category: data.category || "general",
    preview: generateTemplatePreview(data.components),
    code: generateTemplateCode(data.components, data.framework, data.styling),
    components: data.components,
    tags: data.tags || [],
    rating: 0,
    downloads: 0,
    author: data.author,
    license: data.license || "MIT",
    created: now,
    modified: now,
    isPublic: data.isPublic || false,
    framework: data.framework,
    styling: data.styling,
  };
};

// Generate preview from components (placeholder implementation)
const generateTemplatePreview = (_components: ComponentNode[]): string => {
  // In a real implementation, this would render components to an image
  return `preview_${Date.now()}`;
};

// Generate code from components (placeholder implementation)
const generateTemplateCode = (
  components: ComponentNode[],
  framework: Framework,
  styling: StylingApproach
): string => {
  // In a real implementation, this would generate actual framework-specific code
  return `<div>Generated ${framework} code with ${styling}</div>`;
};

// Validate template structure and data
export const validateTemplate = (
  template: ArtifactTemplate
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!template.id) {
    errors.push({
      field: "id",
      message: "Template ID is required",
      type: "required",
      value: template.id,
    });
  }

  if (!template.name || template.name.trim().length === 0) {
    errors.push({
      field: "name",
      message: "Template name is required",
      type: "required",
      value: template.name,
    });
  }

  if (!template.author || template.author.trim().length === 0) {
    errors.push({
      field: "author",
      message: "Template author is required",
      type: "required",
      value: template.author,
    });
  }

  if (!template.components) {
    errors.push({
      field: "components",
      message: "Template components are required",
      type: "required",
      value: template.components,
    });
  }

  // Validate rating range
  if (template.rating < 0 || template.rating > 5) {
    errors.push({
      field: "rating",
      message: "Rating must be between 0 and 5",
      type: "min",
      value: template.rating,
    });
  }

  // Validate download count
  if (template.downloads < 0) {
    errors.push({
      field: "downloads",
      message: "Downloads cannot be negative",
      type: "min",
      value: template.downloads,
    });
  }

  // Validate components
  if (template.components) {
    template.components.forEach((component, index) => {
      const componentErrors = validateComponent(component);
      errors.push(
        ...componentErrors.map(error => ({
          ...error,
          field: `components[${index}].${error.field}`,
        }))
      );
    });
  }

  return errors;
};

// Validate individual component
const validateComponent = (component: ComponentNode): ValidationError[] => {
  const errors: ValidationError[] = [];

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

  // Validate position
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

  // Validate size
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

  return errors;
};

// Save template to localStorage
export interface SaveResult {
  success: boolean;
  error?: string;
}

export const saveTemplate = (template: ArtifactTemplate): SaveResult => {
  try {
    // Validate template before saving
    const errors = validateTemplate(template);
    if (errors.length > 0) {
      return {
        success: false,
        error: `Validation failed: ${errors.map(e => e.message).join(", ")}`,
      };
    }

    const key = `template_${template.id}`;
    const value = JSON.stringify(template);

    localStorage.setItem(key, value);

    // Update template index
    updateTemplateIndex(template.id);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

// Update template index in localStorage
const updateTemplateIndex = (templateId: string): void => {
  try {
    const indexKey = "template_index";
    const existingIndex = localStorage.getItem(indexKey);
    let index: string[] = [];

    if (existingIndex) {
      index = JSON.parse(existingIndex);
    }

    if (!index.includes(templateId)) {
      index.push(templateId);
      const indexValue = JSON.stringify(index);
      localStorage.setItem(indexKey, indexValue);
    }
  } catch (error) {
    console.error("Failed to update template index:", error);
  }
};

// Update template metadata
export const updateTemplateMetadata = (
  template: ArtifactTemplate,
  updates: Partial<ArtifactTemplate>
): ArtifactTemplate => {
  const updatedTemplate: ArtifactTemplate = {
    ...template,
    ...updates,
    modified: new Date(),
  };

  return updatedTemplate;
};

// Duplicate a template
export const duplicateTemplate = (
  template: ArtifactTemplate
): ArtifactTemplate => {
  const now = new Date();

  // Deep clone components with new IDs
  const duplicatedComponents = template.components.map(component =>
    cloneComponent(component)
  );

  return {
    ...template,
    id: generateTemplateId(),
    name: `${template.name} (Copy)`,
    components: duplicatedComponents,
    rating: 0,
    downloads: 0,
    created: now,
    modified: now,
    isPublic: false,
  };
};

// Clone a component with new ID
const cloneComponent = (component: ComponentNode): ComponentNode => {
  return {
    ...component,
    id: generateComponentId(),
    children: component.children?.map(cloneComponent) || [],
    metadata: component.metadata
      ? {
          ...component.metadata,
          created: new Date(),
          modified: new Date(),
        }
      : undefined,
  };
};

// Export template to JSON string
export const exportTemplate = (template: ArtifactTemplate): string => {
  const exportableTemplate = {
    ...template,
    created: template.created.toISOString(),
    modified: template.modified.toISOString(),
  };
  return JSON.stringify(exportableTemplate, null, 2);
};

// Import template from JSON string
export interface ImportResult {
  success: boolean;
  template?: ArtifactTemplate;
  errors?: ValidationError[];
  error?: string;
}

export const importTemplate = (jsonData: string): ImportResult => {
  try {
    const parsedData = JSON.parse(jsonData);

    // Convert date strings back to Date objects
    if (parsedData.created) {
      parsedData.created = new Date(parsedData.created);
    }
    if (parsedData.modified) {
      parsedData.modified = new Date(parsedData.modified);
    }

    // Validate the imported template
    const errors = validateTemplate(parsedData);
    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      template: parsedData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid JSON format",
    };
  }
};
