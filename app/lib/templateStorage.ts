// Template storage utilities for loading and managing templates in localStorage
import { ArtifactTemplate, ComponentNode } from "../types/artifact";

// Error class for template storage operations
export class TemplateStorageError extends Error {
  constructor(
    message: string,
    public templateId?: string
  ) {
    super(message);
    this.name = "TemplateStorageError";
  }
}

// Load a single template from localStorage
export const loadTemplateFromStorage = (
  templateId: string
): ArtifactTemplate | null => {
  try {
    const key = `template_${templateId}`;
    const storedData = localStorage.getItem(key);

    if (!storedData) {
      return null;
    }

    const parsedData = JSON.parse(storedData);

    // Convert date strings back to Date objects
    if (parsedData.created) {
      parsedData.created = new Date(parsedData.created);
    }
    if (parsedData.modified) {
      parsedData.modified = new Date(parsedData.modified);
    }

    return parsedData as ArtifactTemplate;
  } catch (error) {
    throw new TemplateStorageError(
      `Failed to load template ${templateId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      templateId
    );
  }
};

// Load template index from localStorage
export const loadTemplateIndex = (): string[] => {
  try {
    const indexKey = "template_index";
    const storedIndex = localStorage.getItem(indexKey);

    if (!storedIndex) {
      return [];
    }

    const parsedIndex = JSON.parse(storedIndex);

    // Filter out invalid entries
    return parsedIndex.filter(
      (id: any) => typeof id === "string" && id.trim().length > 0
    );
  } catch (error) {
    throw new TemplateStorageError(
      `Failed to load template index: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// Load all templates from storage
export const loadAllTemplates = (): ArtifactTemplate[] => {
  try {
    const templateIds = loadTemplateIndex();
    const templates: ArtifactTemplate[] = [];

    for (const templateId of templateIds) {
      try {
        const template = loadTemplateFromStorage(templateId);
        if (template) {
          templates.push(template);
        }
      } catch (error) {
        console.warn(`Failed to load template ${templateId}, skipping:`, error);
        // Continue loading other templates even if one fails
      }
    }

    return templates;
  } catch (error) {
    console.error("Failed to load all templates:", error);
    return [];
  }
};

// Load a template (alias for loadTemplateFromStorage for backward compatibility)
export const loadTemplate = (templateId: string): ArtifactTemplate | null => {
  return loadTemplateFromStorage(templateId);
};

// Instantiate a template with new metadata
export interface InstantiateTemplateOptions {
  newName?: string;
  newAuthor?: string;
  newDescription?: string;
  resetStats?: boolean;
}

export const instantiateTemplate = (
  template: ArtifactTemplate,
  options: InstantiateTemplateOptions = {}
): ArtifactTemplate => {
  const now = new Date();

  // Deep clone components with new IDs
  const instantiatedComponents = template.components.map(component =>
    cloneComponent(component)
  );

  return {
    ...template,
    id: generateTemplateId(),
    name: options.newName || `${template.name} (Instance)`,
    description: options.newDescription || template.description,
    author: options.newAuthor || template.author,
    components: instantiatedComponents,
    rating: options.resetStats !== false ? 0 : template.rating,
    downloads: options.resetStats !== false ? 0 : template.downloads,
    created: now,
    modified: now,
    isPublic: false, // Instances are not public by default
  };
};

// Generate unique template ID
const generateTemplateId = (): string => {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Clone a component with new ID (deep clone)
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

// Generate unique component ID
const generateComponentId = (): string => {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Check if a template exists in storage
export const templateExistsInStorage = (templateId: string): boolean => {
  try {
    const key = `template_${templateId}`;
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
};

// Get storage statistics
export interface TemplateStorageStats {
  totalTemplates: number;
  totalSize: number; // in bytes
  averageSize: number; // in bytes
  largestTemplate: string; // template ID
  oldestTemplate: string; // template ID
  newestTemplate: string; // template ID
}

export const getTemplateStorageStats = (): TemplateStorageStats => {
  try {
    const templateIds = loadTemplateIndex();
    let totalSize = 0;
    let largestSize = 0;
    let largestTemplate = "";
    let oldestDate = new Date();
    let newestDate = new Date(0);
    let oldestTemplate = "";
    let newestTemplate = "";

    for (const templateId of templateIds) {
      try {
        const template = loadTemplateFromStorage(templateId);
        if (template) {
          const templateSize = JSON.stringify(template).length;
          totalSize += templateSize;

          if (templateSize > largestSize) {
            largestSize = templateSize;
            largestTemplate = templateId;
          }

          if (template.created < oldestDate) {
            oldestDate = template.created;
            oldestTemplate = templateId;
          }

          if (template.created > newestDate) {
            newestDate = template.created;
            newestTemplate = templateId;
          }
        }
      } catch (_error) {
        // Skip templates that can't be loaded
        console.warn(
          `Skipping template ${templateId} in stats calculation:`,
          _error
        );
      }
    }

    return {
      totalTemplates: templateIds.length,
      totalSize,
      averageSize:
        templateIds.length > 0 ? Math.round(totalSize / templateIds.length) : 0,
      largestTemplate,
      oldestTemplate,
      newestTemplate,
    };
  } catch (error) {
    console.error("Failed to get template storage stats:", error);
    return {
      totalTemplates: 0,
      totalSize: 0,
      averageSize: 0,
      largestTemplate: "",
      oldestTemplate: "",
      newestTemplate: "",
    };
  }
};

// Clean up orphaned templates (templates in storage but not in index)
export const cleanupOrphanedTemplates = (): number => {
  try {
    const index = loadTemplateIndex();
    let cleanedCount = 0;

    // Get all template keys from localStorage
    const allKeys = Object.keys(localStorage);
    const templateKeys = allKeys.filter(key =>
      key.startsWith("template_template_")
    );

    for (const key of templateKeys) {
      const templateId = key.replace("template_", "");
      if (!index.includes(templateId)) {
        localStorage.removeItem(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error("Failed to cleanup orphaned templates:", error);
    return 0;
  }
};

// Validate template data integrity
export const validateTemplateIntegrity = (
  templateId: string
): {
  isValid: boolean;
  errors: string[];
} => {
  try {
    const template = loadTemplateFromStorage(templateId);

    if (!template) {
      return {
        isValid: false,
        errors: ["Template not found in storage"],
      };
    }

    const errors: string[] = [];

    // Check required fields
    if (!template.id) errors.push("Missing template ID");
    if (!template.name || template.name.trim().length === 0)
      errors.push("Missing or empty template name");
    if (!template.author || template.author.trim().length === 0)
      errors.push("Missing or empty author");
    if (!template.components) errors.push("Missing components array");
    if (!template.category) errors.push("Missing category");
    if (!template.preview) errors.push("Missing preview");
    if (!template.code) errors.push("Missing code");
    if (!template.framework) errors.push("Missing framework");
    if (!template.styling) errors.push("Missing styling approach");

    // Check rating range
    if (template.rating < 0 || template.rating > 5) {
      errors.push("Rating must be between 0 and 5");
    }

    // Check download count
    if (template.downloads < 0) {
      errors.push("Downloads cannot be negative");
    }

    // Check dates
    if (
      !(template.created instanceof Date) ||
      isNaN(template.created.getTime())
    ) {
      errors.push("Invalid created date");
    }
    if (
      !(template.modified instanceof Date) ||
      isNaN(template.modified.getTime())
    ) {
      errors.push("Invalid modified date");
    }

    // Check component structure
    template.components.forEach((component, index) => {
      if (!component.id)
        errors.push(`Component ${index}: Missing component ID`);
      if (!component.type)
        errors.push(`Component ${index}: Missing component type`);
      if (
        typeof component.position.x !== "number" ||
        typeof component.position.y !== "number"
      ) {
        errors.push(`Component ${index}: Invalid position`);
      }
      if (
        typeof component.size.width !== "number" ||
        typeof component.size.height !== "number"
      ) {
        errors.push(`Component ${index}: Invalid size`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        `Failed to validate template: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
    };
  }
};
