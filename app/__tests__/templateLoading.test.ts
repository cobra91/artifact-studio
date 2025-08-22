// Template loading and instantiation from storage tests
import {
  instantiateTemplate,
  loadAllTemplates,
  loadTemplateFromStorage,
  loadTemplateIndex,
} from "../../app/lib/templateStorage";
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

describe("Template Loading and Instantiation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the storage data
    Object.keys(storageData).forEach(key => delete storageData[key]);

    // Reset mock implementations to default
    localStorageMock.getItem.mockImplementation(
      (key: string) => storageData[key] || null
    );
    localStorageMock.setItem.mockImplementation(
      (key: string, value: string) => {
        storageData[key] = value;
      }
    );
  });

  describe("Template Loading from Storage", () => {
    it("should load a valid template from localStorage", () => {
      const templateData: ArtifactTemplate = {
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
        created: new Date("2024-01-01"),
        modified: new Date("2024-01-01"),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      storageData["template_template-1"] = JSON.stringify(templateData);

      const loadedTemplate = loadTemplateFromStorage("template-1");

      expect(loadedTemplate).toBeTruthy();
      expect(loadedTemplate?.name).toBe("Test Template");
      expect(loadedTemplate?.created).toBeInstanceOf(Date);
      expect(loadedTemplate?.modified).toBeInstanceOf(Date);
    });

    it("should return null for non-existent template", () => {
      const loadedTemplate = loadTemplateFromStorage("non-existent");

      expect(loadedTemplate).toBeNull();
    });

    it("should handle corrupted template data gracefully", () => {
      storageData["template_template-1"] = "invalid json";

      expect(() => loadTemplateFromStorage("template-1")).toThrow();
    });

    it("should handle missing template data", () => {
      // Don't set any data in storage
      const loadedTemplate = loadTemplateFromStorage("missing-template");

      expect(loadedTemplate).toBeNull();
    });

    it("should validate loaded template structure", () => {
      const invalidTemplateData = {
        id: "template-1",
        name: "", // Invalid: empty name
        components: [],
        author: "Test Author",
        framework: "react",
        styling: "tailwindcss",
        // Missing required fields like category, preview, code, etc.
      };

      storageData["template_template-1"] = JSON.stringify(invalidTemplateData);

      const loadedTemplate = loadTemplateFromStorage("template-1");

      expect(loadedTemplate).toBeTruthy();
      // Should still load even with validation issues
      expect(loadedTemplate?.id).toBe("template-1");
    });
  });

  describe("Template Index Loading", () => {
    it("should load template index from localStorage", () => {
      const templateIds = ["template-1", "template-2", "template-3"];
      storageData["template_index"] = JSON.stringify(templateIds);

      const loadedIndex = loadTemplateIndex();

      expect(loadedIndex).toEqual(templateIds);
    });

    it("should return empty array for missing index", () => {
      const loadedIndex = loadTemplateIndex();

      expect(loadedIndex).toEqual([]);
    });

    it("should handle corrupted index data", () => {
      storageData["template_index"] = "invalid json";

      expect(() => loadTemplateIndex()).toThrow();
    });

    it("should filter out invalid template IDs", () => {
      const templateIds = ["template-1", "", null, "template-2", undefined];
      storageData["template_index"] = JSON.stringify(templateIds);

      const loadedIndex = loadTemplateIndex();

      expect(loadedIndex).toEqual(["template-1", "template-2"]);
    });
  });

  describe("Loading All Templates", () => {
    it("should load all templates from index", () => {
      const templateIds = ["template-1", "template-2"];
      storageData["template_index"] = JSON.stringify(templateIds);

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
        author: "Author 1",
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
        author: "Author 2",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      storageData["template_template-1"] = JSON.stringify(template1);
      storageData["template_template-2"] = JSON.stringify(template2);

      const allTemplates = loadAllTemplates();

      expect(allTemplates).toHaveLength(2);
      expect(allTemplates[0].name).toBe("Template 1");
      expect(allTemplates[1].name).toBe("Template 2");
    });

    it("should handle missing templates gracefully", () => {
      const templateIds = ["template-1", "template-2", "missing-template"];
      storageData["template_index"] = JSON.stringify(templateIds);

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
        author: "Author 1",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      storageData["template_template-1"] = JSON.stringify(template1);
      // template-2 and missing-template are not in storage

      const allTemplates = loadAllTemplates();

      expect(allTemplates).toHaveLength(1);
      expect(allTemplates[0].name).toBe("Template 1");
    });

    it("should handle empty index", () => {
      storageData["template_index"] = JSON.stringify([]);

      const allTemplates = loadAllTemplates();

      expect(allTemplates).toEqual([]);
    });

    it("should handle corrupted template data when loading all", () => {
      const templateIds = ["template-1", "template-2"];
      storageData["template_index"] = JSON.stringify(templateIds);

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
        author: "Author 1",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      storageData["template_template-1"] = JSON.stringify(template1);
      storageData["template_template-2"] = "corrupted json data";

      const allTemplates = loadAllTemplates();

      expect(allTemplates).toHaveLength(1);
      expect(allTemplates[0].name).toBe("Template 1");
    });
  });

  describe("Template Instantiation", () => {
    it("should instantiate template with new ID and metadata", () => {
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

      const instantiatedTemplate = instantiateTemplate(originalTemplate, {
        newName: "Instantiated Template",
        newAuthor: "New Author",
      });

      expect(instantiatedTemplate.id).not.toBe(originalTemplate.id);
      expect(instantiatedTemplate.name).toBe("Instantiated Template");
      expect(instantiatedTemplate.author).toBe("New Author");
      expect(instantiatedTemplate.rating).toBe(0);
      expect(instantiatedTemplate.downloads).toBe(0);
      expect(instantiatedTemplate.created.getTime()).toBeGreaterThan(
        originalTemplate.created.getTime()
      );
      expect(instantiatedTemplate.components.length).toBe(1);
      expect(instantiatedTemplate.components[0].id).not.toBe("component-1");
    });

    it("should use default values when no options provided", () => {
      const originalTemplate: ArtifactTemplate = {
        id: "template-1",
        name: "Original Template",
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

      const instantiatedTemplate = instantiateTemplate(originalTemplate);

      expect(instantiatedTemplate.name).toBe("Original Template (Instance)");
      expect(instantiatedTemplate.author).toBe("Original Author");
      expect(instantiatedTemplate.rating).toBe(0);
      expect(instantiatedTemplate.downloads).toBe(0);
    });

    it("should handle templates with complex component hierarchies", () => {
      const nestedComponents: ComponentNode[] = [
        {
          id: "container-1",
          type: "container",
          props: {},
          position: { x: 0, y: 0 },
          size: { width: 200, height: 200 },
          styles: {},
          children: [
            {
              id: "button-1",
              type: "button",
              props: { children: "Button 1" },
              position: { x: 10, y: 10 },
              size: { width: 80, height: 30 },
              styles: {},
            },
            {
              id: "button-2",
              type: "button",
              props: { children: "Button 2" },
              position: { x: 110, y: 10 },
              size: { width: 80, height: 30 },
              styles: {},
            },
          ],
        },
      ];

      const originalTemplate: ArtifactTemplate = {
        id: "template-1",
        name: "Complex Template",
        description: "Template with nested components",
        category: "ui",
        preview: "preview",
        code: "<div>Complex</div>",
        components: nestedComponents,
        tags: ["complex"],
        rating: 4.5,
        downloads: 100,
        author: "Complex Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: false,
        framework: "react",
        styling: "tailwindcss",
      };

      const instantiatedTemplate = instantiateTemplate(originalTemplate);

      expect(instantiatedTemplate.components.length).toBe(1);
      expect(instantiatedTemplate.components[0].id).not.toBe("container-1");
      expect(instantiatedTemplate.components[0].children).toHaveLength(2);
      expect(instantiatedTemplate.components[0].children?.[0].id).not.toBe(
        "button-1"
      );
      expect(instantiatedTemplate.components[0].children?.[1].id).not.toBe(
        "button-2"
      );
    });

    it("should handle empty template gracefully", () => {
      const emptyTemplate: ArtifactTemplate = {
        id: "template-1",
        name: "Empty Template",
        description: "Template with no components",
        category: "ui",
        preview: "preview",
        code: "<div>Empty</div>",
        components: [],
        tags: [],
        rating: 4.5,
        downloads: 100,
        author: "Empty Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: false,
        framework: "react",
        styling: "tailwindcss",
      };

      const instantiatedTemplate = instantiateTemplate(emptyTemplate);

      expect(instantiatedTemplate.components).toEqual([]);
      expect(instantiatedTemplate.name).toBe("Empty Template (Instance)");
    });
  });

  describe("Template Loading Error Handling", () => {
    it("should throw TemplateStorageError for invalid JSON", () => {
      storageData["template_template-1"] = "invalid json data";

      expect(() => loadTemplateFromStorage("template-1")).toThrow();
    });

    it("should handle localStorage access errors", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("Storage access denied");
      });

      expect(() => loadTemplateIndex()).toThrow();
    });

    it("should handle null values in storage", () => {
      storageData["template_index"] = JSON.stringify([
        null,
        "template-1",
        null,
      ]);

      const loadedIndex = loadTemplateIndex();

      expect(loadedIndex).toEqual(["template-1"]);
    });

    it("should handle undefined values in storage", () => {
      storageData["template_index"] = JSON.stringify([
        undefined,
        "template-1",
        undefined,
      ]);

      const loadedIndex = loadTemplateIndex();

      expect(loadedIndex).toEqual(["template-1"]);
    });
  });

  describe("Template Loading Performance", () => {
    it("should handle large number of templates efficiently", () => {
      const templateIds = Array.from(
        { length: 100 },
        (_, i) => `template-${i}`
      );
      storageData["template_index"] = JSON.stringify(templateIds);

      // Create 100 template objects
      templateIds.forEach(id => {
        const template: ArtifactTemplate = {
          id,
          name: `Template ${id}`,
          description: `Description for ${id}`,
          category: "test",
          preview: "preview",
          code: `<div>${id}</div>`,
          components: [],
          tags: ["test"],
          rating: 4.0,
          downloads: Math.floor(Math.random() * 1000),
          author: "Test Author",
          license: "MIT",
          created: new Date(),
          modified: new Date(),
          isPublic: true,
          framework: "react",
          styling: "tailwindcss",
        };
        storageData[`template_${id}`] = JSON.stringify(template);
      });

      const startTime = Date.now();
      const allTemplates = loadAllTemplates();
      const endTime = Date.now();

      expect(allTemplates).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(500); // Should complete in under 500ms
    });

    it("should handle concurrent template loading", async () => {
      const templateId = "template-1";
      const templateData: ArtifactTemplate = {
        id: templateId,
        name: "Concurrent Template",
        description: "Template for concurrent loading test",
        category: "test",
        preview: "preview",
        code: "<div>Concurrent</div>",
        components: [],
        tags: ["test"],
        rating: 4.0,
        downloads: 100,
        author: "Test Author",
        license: "MIT",
        created: new Date(),
        modified: new Date(),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      };

      storageData[`template_${templateId}`] = JSON.stringify(templateData);

      // Load the same template multiple times concurrently
      const results = await Promise.all([
        loadTemplateFromStorage(templateId),
        loadTemplateFromStorage(templateId),
        loadTemplateFromStorage(templateId),
      ]);

      // All should return the same data
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
      expect(results[0]?.name).toBe("Concurrent Template");
    });
  });
});
