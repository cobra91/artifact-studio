// Template creation and validation tests
import {
  createTemplate,
  duplicateTemplate,
  exportTemplate,
  importTemplate,
  saveTemplate,
  updateTemplateMetadata,
  validateTemplate,
} from "../../app/lib/templateManagement";
import { ArtifactTemplate, ComponentNode } from "../types/artifact";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock implementation that simulates localStorage behavior
const storageData: { [key: string]: string } = {};
localStorageMock.getItem.mockImplementation(
  (key: string) => storageData[key] || null
);
localStorageMock.setItem.mockImplementation((key: string, value: string) => {
  storageData[key] = value;
});

describe("Template Creation and Saving", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the storage data
    Object.keys(storageData).forEach(key => delete storageData[key]);
  });

  describe("Template Creation", () => {
    it("should create a valid template from components", () => {
      const mockComponents: ComponentNode[] = [
        {
          id: "component-1",
          type: "button",
          props: { children: "Click me" },
          position: { x: 0, y: 0 },
          size: { width: 100, height: 40 },
          styles: { backgroundColor: "#007bff" },
          metadata: {
            version: "1.0.0",
            created: new Date(),
            modified: new Date(),
            author: "Test User",
          },
        },
      ];

      const templateData = {
        name: "Test Button Template",
        description: "A simple button template",
        category: "form",
        components: mockComponents,
        author: "Test Author",
        framework: "react" as const,
        styling: "tailwindcss" as const,
      };

      const template = createTemplate(templateData);

      expect(template.id).toMatch(/^template_/);
      expect(template.name).toBe("Test Button Template");
      expect(template.description).toBe("A simple button template");
      expect(template.category).toBe("form");
      expect(template.components).toEqual(mockComponents);
      expect(template.author).toBe("Test Author");
      expect(template.framework).toBe("react");
      expect(template.styling).toBe("tailwindcss");
      expect(template.isPublic).toBe(false);
      expect(template.rating).toBe(0);
      expect(template.downloads).toBe(0);
      expect(template.created).toBeInstanceOf(Date);
      expect(template.modified).toBeInstanceOf(Date);
    });

    it("should generate default values for optional fields", () => {
      const templateData = {
        name: "Minimal Template",
        components: [],
        author: "Test Author",
        framework: "vue" as const,
        styling: "css" as const,
      };

      const template = createTemplate(templateData);

      expect(template.description).toBe("");
      expect(template.category).toBe("general");
      expect(template.tags).toEqual([]);
      expect(template.license).toBe("MIT");
      expect(template.isPublic).toBe(false);
    });

    it("should throw error for invalid template data", () => {
      const invalidData = {
        name: "", // Invalid: empty name
        components: null as any, // Invalid: null components
        author: "Test Author",
        framework: "react" as const,
        styling: "tailwindcss" as const,
      };

      expect(() => createTemplate(invalidData)).toThrow();
    });
  });

  describe("Template Validation", () => {
    it("should validate a complete and valid template", () => {
      const validTemplate: ArtifactTemplate = {
        id: "template-1",
        name: "Valid Template",
        description: "A valid template",
        category: "ui",
        preview: "preview-image",
        code: "<div>Valid</div>",
        components: [],
        tags: ["valid"],
        rating: 4.5,
        downloads: 100,
        author: "Valid Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const errors = validateTemplate(validTemplate);

      expect(errors).toHaveLength(0);
    });

    it("should detect missing required fields", () => {
      const invalidTemplate = {
        id: "template-1",
        name: "", // Invalid: empty name
        description: "Template description",
        category: "ui",
        preview: "preview",
        code: "<div></div>",
        components: [],
        tags: [],
        rating: 4.5,
        downloads: 100,
        author: "", // Invalid: empty author
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const errors = validateTemplate(invalidTemplate);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error: any) => error.field === "name")).toBe(true);
      expect(errors.some((error: any) => error.field === "author")).toBe(true);
    });

    it("should validate component structure", () => {
      const templateWithInvalidComponents: ArtifactTemplate = {
        id: "template-1",
        name: "Template with Invalid Components",
        description: "Test template",
        category: "ui",
        preview: "preview",
        code: "<div></div>",
        components: [
          {
            id: "", // Invalid: empty id
            type: "invalid-type" as any, // Invalid: invalid type
            props: {},
            position: { x: -10, y: -10 }, // Invalid: negative position
            size: { width: 0, height: 0 }, // Invalid: zero size
            styles: {},
          },
        ],
        tags: [],
        rating: 4.5,
        downloads: 100,
        author: "Test Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const errors = validateTemplate(templateWithInvalidComponents);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error: any) => error.field.includes("id"))).toBe(
        true
      );
      expect(
        errors.some((error: any) => error.field.includes("position"))
      ).toBe(true);
    });

    it("should validate rating and download counts", () => {
      const templateWithInvalidStats: ArtifactTemplate = {
        id: "template-1",
        name: "Template with Invalid Stats",
        description: "Test template",
        category: "ui",
        preview: "preview",
        code: "<div></div>",
        components: [],
        tags: [],
        rating: 6, // Invalid: rating > 5
        downloads: -10, // Invalid: negative downloads
        author: "Test Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const errors = validateTemplate(templateWithInvalidStats);

      expect(errors.some((error: any) => error.field === "rating")).toBe(true);
      expect(errors.some((error: any) => error.field === "downloads")).toBe(
        true
      );
    });
  });

  describe("Template Saving and Storage", () => {
    it("should save template to localStorage", () => {
      const template: ArtifactTemplate = {
        id: "template-1",
        name: "Test Template",
        description: "A test template",
        category: "ui",
        preview: "preview",
        code: "<div>Test</div>",
        components: [],
        tags: ["test"],
        rating: 4.5,
        downloads: 100,
        author: "Test Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const result = saveTemplate(template);

      expect(result.success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "template_template-1",
        expect.any(String)
      );
    });

    it("should handle save errors gracefully", () => {
      (localStorageMock.setItem as jest.Mock).mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const template: ArtifactTemplate = {
        id: "template-1",
        name: "Test Template",
        description: "A test template",
        category: "ui",
        preview: "preview",
        code: "<div>Test</div>",
        components: [],
        tags: ["test"],
        rating: 4.5,
        downloads: 100,
        author: "Test Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const result = saveTemplate(template);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Storage quota exceeded");
    });

    it("should save multiple templates and maintain index", () => {
      const template1: ArtifactTemplate = {
        id: "template-1",
        name: "Template 1",
        description: "First template",
        category: "ui",
        preview: "preview1",
        code: "<div>1</div>",
        components: [],
        tags: ["test"],
        rating: 4.5,
        downloads: 100,
        author: "Test Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const template2: ArtifactTemplate = {
        id: "template-2",
        name: "Template 2",
        description: "Second template",
        category: "form",
        preview: "preview2",
        code: "<div>2</div>",
        components: [],
        tags: ["form"],
        rating: 4.0,
        downloads: 50,
        author: "Test Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      saveTemplate(template1);
      saveTemplate(template2);

      // Check that both templates were saved
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "template_template-1",
        expect.any(String)
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "template_template-2",
        expect.any(String)
      );
    });
  });

  describe("Template Metadata Management", () => {
    it("should update template metadata correctly", () => {
      const originalTemplate: ArtifactTemplate = {
        id: "template-1",
        name: "Original Name",
        description: "Original description",
        category: "ui",
        preview: "preview",
        code: "<div>Original</div>",
        components: [],
        tags: ["original"],
        rating: 4.5,
        downloads: 100,
        author: "Original Author",
        license: "MIT",
        created: new Date("2024-01-01"),
        modified: new Date("2024-01-01"),
        isPublic: false,
        framework: "react",
        styling: "tailwindcss",
      };

      const updates = {
        name: "Updated Name",
        description: "Updated description",
        category: "form",
        tags: ["updated", "form"],
        isPublic: true,
      };

      const updatedTemplate = updateTemplateMetadata(originalTemplate, updates);

      expect(updatedTemplate.name).toBe("Updated Name");
      expect(updatedTemplate.description).toBe("Updated description");
      expect(updatedTemplate.category).toBe("form");
      expect(updatedTemplate.tags).toEqual(["updated", "form"]);
      expect(updatedTemplate.isPublic).toBe(true);
      expect(updatedTemplate.modified.getTime()).toBeGreaterThan(
        originalTemplate.modified.getTime()
      );
      expect(updatedTemplate.created).toEqual(originalTemplate.created);
    });

    it("should preserve unchanged fields when updating metadata", () => {
      const originalTemplate: ArtifactTemplate = {
        id: "template-1",
        name: "Original Name",
        description: "Original description",
        category: "ui",
        preview: "preview",
        code: "<div>Original</div>",
        components: [],
        tags: ["original"],
        rating: 4.5,
        downloads: 100,
        author: "Original Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: false,
        framework: "react",
        styling: "tailwindcss",
      };

      const updates = { name: "Updated Name" };

      const updatedTemplate = updateTemplateMetadata(originalTemplate, updates);

      expect(updatedTemplate.description).toBe("Original description");
      expect(updatedTemplate.category).toBe("ui");
      expect(updatedTemplate.tags).toEqual(["original"]);
      expect(updatedTemplate.author).toBe("Original Author");
    });
  });

  describe("Template Duplication", () => {
    it("should create a proper duplicate of a template", () => {
      const originalTemplate: ArtifactTemplate = {
        id: "template-1",
        name: "Original Template",
        description: "Original description",
        category: "ui",
        preview: "preview",
        code: "<div>Original</div>",
        components: [
          {
            id: "component-1",
            type: "button",
            props: { children: "Click me" },
            position: { x: 0, y: 0 },
            size: { width: 100, height: 40 },
            styles: { backgroundColor: "#007bff" },
            metadata: {
              version: "1.0.0",
              created: new Date(),
              modified: new Date(),
              author: "Original Author",
            },
          },
        ],
        tags: ["original"],
        rating: 4.5,
        downloads: 100,
        author: "Original Author",
        license: "MIT",
        created: new Date("2024-01-01"),
        modified: new Date("2024-01-01"),
        isPublic: false,
        framework: "react",
        styling: "tailwindcss",
      };

      const duplicatedTemplate = duplicateTemplate(originalTemplate);

      expect(duplicatedTemplate.id).not.toBe(originalTemplate.id);
      expect(duplicatedTemplate.name).toBe("Original Template (Copy)");
      expect(duplicatedTemplate.description).toBe("Original description");
      expect(duplicatedTemplate.components.length).toBe(1);
      expect(duplicatedTemplate.components[0].id).not.toBe("component-1");
      expect(duplicatedTemplate.rating).toBe(0);
      expect(duplicatedTemplate.downloads).toBe(0);
      expect(duplicatedTemplate.created.getTime()).toBeGreaterThan(
        originalTemplate.created.getTime()
      );
    });

    it("should handle templates with no components", () => {
      const simpleTemplate: ArtifactTemplate = {
        id: "template-1",
        name: "Simple Template",
        description: "Simple description",
        category: "ui",
        preview: "preview",
        code: "<div>Simple</div>",
        components: [],
        tags: [],
        rating: 4.5,
        downloads: 100,
        author: "Simple Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: false,
        framework: "react",
        styling: "tailwindcss",
      };

      const duplicatedTemplate = duplicateTemplate(simpleTemplate);

      expect(duplicatedTemplate.id).not.toBe(simpleTemplate.id);
      expect(duplicatedTemplate.components).toEqual([]);
      expect(duplicatedTemplate.name).toBe("Simple Template (Copy)");
    });
  });

  describe("Template Export and Import", () => {
    it("should export template to JSON format", () => {
      const template: ArtifactTemplate = {
        id: "template-1",
        name: "Export Template",
        description: "Template for export",
        category: "ui",
        preview: "preview",
        code: "<div>Export</div>",
        components: [],
        tags: ["export"],
        rating: 4.5,
        downloads: 100,
        author: "Export Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const exportedData = exportTemplate(template);

      expect(typeof exportedData).toBe("string");

      const parsedData = JSON.parse(exportedData);
      expect(parsedData.name).toBe("Export Template");
      expect(parsedData.author).toBe("Export Author");
      expect(typeof parsedData.created).toBe("string");
    });

    it("should import template from valid JSON", () => {
      const templateData = {
        id: "template-1",
        name: "Import Template",
        description: "Template for import",
        category: "ui",
        preview: "preview",
        code: "<div>Import</div>",
        components: [],
        tags: ["import"],
        rating: 4.5,
        downloads: 100,
        author: "Import Author",
        license: "MIT",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const jsonData = JSON.stringify(templateData);

      const importedTemplate = importTemplate(jsonData);

      expect(importedTemplate.success).toBe(true);
      expect(importedTemplate.template?.name).toBe("Import Template");
      expect(importedTemplate.template?.created).toBeInstanceOf(Date);
      expect(importedTemplate.template?.modified).toBeInstanceOf(Date);
    });

    it("should handle invalid JSON during import", () => {
      const invalidJson = "invalid json data";

      const result = importTemplate(invalidJson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should validate imported template data", () => {
      const invalidTemplateData = {
        id: "template-1",
        name: "", // Invalid: empty name
        description: "Invalid template",
        category: "ui",
        preview: "preview",
        code: "<div>Invalid</div>",
        components: [],
        tags: [],
        rating: 4.5,
        downloads: 100,
        author: "", // Invalid: empty author
        license: "MIT",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      const jsonData = JSON.stringify(invalidTemplateData);

      const result = importTemplate(jsonData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });
});
