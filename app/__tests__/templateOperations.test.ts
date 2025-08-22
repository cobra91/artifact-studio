// Template operations and validation tests
import {
  fetchTemplates,
  getReviews,
  getTemplateById,
  getTemplates,
  submitReview,
} from "../lib/templates";
import { ArtifactTemplate, TemplateReview } from "../types/artifact";

// Mock fetch globally
global.fetch = jest.fn();

describe("Template System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the in-memory cache
    (global.fetch as jest.Mock).mockClear();
  });

  describe("Template Fetching and Caching", () => {
    it("should fetch templates from JSON file", async () => {
      const mockTemplates = [
        {
          id: "template-1",
          name: "Test Template",
          description: "A test template",
          category: "ui",
          preview: "base64-image",
          code: "<div>Test</div>",
          components: [],
          tags: ["test", "ui"],
          rating: 4.5,
          downloads: 100,
          author: "Test Author",
          license: "MIT",
          created: "2024-01-01T00:00:00Z",
          modified: "2024-01-01T00:00:00Z",
          isPublic: true,
          framework: "react",
          styling: "tailwindcss",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockTemplates),
      });

      const templates = await fetchTemplates();

      expect(global.fetch).toHaveBeenCalledWith("/templates.json");
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe("Test Template");
      expect(templates[0].created).toBeInstanceOf(Date);
    });

    it("should cache templates after first fetch", async () => {
      const mockTemplates = [
        {
          id: "template-1",
          name: "Cached Template",
          description: "A cached template",
          category: "ui",
          preview: "base64-image",
          code: "<div>Cached</div>",
          components: [],
          tags: ["cached"],
          rating: 4.0,
          downloads: 50,
          author: "Cache Author",
          license: "MIT",
          created: "2024-01-01T00:00:00Z",
          modified: "2024-01-01T00:00:00Z",
          isPublic: true,
          framework: "react",
          styling: "tailwindcss",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockTemplates),
      });

      // First call should fetch from API
      const templates1 = await fetchTemplates();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const templates2 = await fetchTemplates();
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1 call

      expect(templates1).toEqual(templates2);
    });

    it("should handle fetch errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      const templates = await fetchTemplates();

      expect(templates).toEqual([]);
    });
  });

  describe("Template Filtering and Search", () => {
    const mockTemplates: ArtifactTemplate[] = [
      {
        id: "template-1",
        name: "Button Component",
        description: "A simple button",
        category: "form",
        preview: "button-preview",
        code: "<button>Click</button>",
        components: [],
        tags: ["button", "form", "interactive"],
        rating: 4.5,
        downloads: 100,
        author: "UI Author",
        license: "MIT",
        created: new Date("2024-01-01"),
        modified: new Date("2024-01-01"),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      },
      {
        id: "template-2",
        name: "Card Layout",
        description: "A card layout component",
        category: "layout",
        preview: "card-preview",
        code: "<div class='card'>Content</div>",
        components: [],
        tags: ["card", "layout", "container"],
        rating: 4.2,
        downloads: 200,
        author: "Layout Author",
        license: "MIT",
        created: new Date("2024-01-02"),
        modified: new Date("2024-01-02"),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      },
      {
        id: "template-3",
        name: "Navigation Menu",
        description: "Responsive navigation",
        category: "navigation",
        preview: "nav-preview",
        code: "<nav>Menu</nav>",
        components: [],
        tags: ["navigation", "menu", "responsive"],
        rating: 4.8,
        downloads: 150,
        author: "Nav Author",
        license: "MIT",
        created: new Date("2024-01-03"),
        modified: new Date("2024-01-03"),
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockTemplates),
      });
    });

    it("should filter templates by category", async () => {
      const formTemplates = await getTemplates({ category: "form" });

      expect(formTemplates).toHaveLength(1);
      expect(formTemplates[0].name).toBe("Button Component");
    });

    it("should filter templates by tags (AND logic)", async () => {
      const buttonInteractiveTemplates = await getTemplates({
        tags: ["button", "interactive"],
      });

      expect(buttonInteractiveTemplates).toHaveLength(1);
      expect(buttonInteractiveTemplates[0].name).toBe("Button Component");
    });

    it("should search templates by name and description", async () => {
      const searchResults = await getTemplates({ search: "card" });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe("Card Layout");
    });

    it("should combine multiple filters", async () => {
      const combinedResults = await getTemplates({
        category: "layout",
        tags: ["card"],
        search: "layout",
      });

      expect(combinedResults).toHaveLength(1);
      expect(combinedResults[0].name).toBe("Card Layout");
    });

    it("should handle case-insensitive search", async () => {
      const searchResults = await getTemplates({ search: "BUTTON" });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe("Button Component");
    });

    it("should return empty array for no matches", async () => {
      const noResults = await getTemplates({ category: "nonexistent" });

      expect(noResults).toEqual([]);
    });
  });

  describe("Template Retrieval by ID", () => {
    const mockTemplates = [
      {
        id: "template-1",
        name: "Test Template",
        description: "A test template",
        category: "ui",
        preview: "base64-image",
        code: "<div>Test</div>",
        components: [],
        tags: ["test"],
        rating: 4.5,
        downloads: 100,
        author: "Test Author",
        license: "MIT",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockTemplates),
      });
    });

    it("should retrieve template by valid ID", async () => {
      const template = await getTemplateById("template-1");

      expect(template).toBeTruthy();
      expect(template?.id).toBe("template-1");
      expect(template?.name).toBe("Test Template");
    });

    it("should return null for non-existent template ID", async () => {
      const template = await getTemplateById("non-existent-id");

      expect(template).toBeNull();
    });

    it("should handle empty or undefined template ID", async () => {
      const template1 = await getTemplateById("");
      const template2 = await getTemplateById(undefined as any);

      expect(template1).toBeNull();
      expect(template2).toBeNull();
    });
  });

  describe("Template Reviews", () => {
    const mockTemplates = [
      {
        id: "template-1",
        name: "Test Template",
        description: "A test template",
        category: "ui",
        preview: "base64-image",
        code: "<div>Test</div>",
        components: [],
        tags: ["test"],
        rating: 4.5,
        downloads: 100,
        author: "Test Author",
        license: "MIT",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
        reviews: [
          {
            userId: "user-1",
            rating: 5,
            comment: "Great!",
            timestamp: 1640995200,
          },
          {
            userId: "user-2",
            rating: 4,
            comment: "Good",
            timestamp: 1641081600,
          },
        ],
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockTemplates),
      });
    });

    it("should retrieve existing reviews for a template", async () => {
      const reviews = await getReviews("template-1");

      expect(reviews).toHaveLength(2);
      expect(reviews[0].rating).toBe(5);
      expect(reviews[1].comment).toBe("Good");
    });

    it("should return empty array for template with no reviews", async () => {
      const noReviewsTemplate = await getTemplateById("template-1");
      if (noReviewsTemplate) {
        noReviewsTemplate.reviews = undefined;
      }

      const reviews = await getReviews("template-1");

      expect(reviews).toEqual([]);
    });

    it("should submit and calculate average rating correctly", async () => {
      const newReview: TemplateReview = {
        userId: "user-3",
        rating: 3,
        comment: "Okay template",
        timestamp: 1641168000,
      };

      await submitReview("template-1", newReview);

      const updatedReviews = await getReviews("template-1");
      expect(updatedReviews).toHaveLength(3);

      // Check if rating was recalculated correctly
      // Original ratings: 5, 4, New: 3, Average should be 4.0
      const templates = await fetchTemplates();
      const template = templates.find(t => t.id === "template-1");
      expect(template?.rating).toBe(4.0);
    });

    it("should handle review submission for template without existing reviews", async () => {
      const noReviewsTemplate = [
        {
          ...mockTemplates[0],
          id: "template-no-reviews",
          reviews: undefined,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(noReviewsTemplate),
      });

      const newReview: TemplateReview = {
        userId: "user-1",
        rating: 5,
        comment: "First review",
        timestamp: 1641168000,
      };

      await submitReview("template-no-reviews", newReview);

      const reviews = await getReviews("template-no-reviews");
      expect(reviews).toHaveLength(1);
      expect(reviews[0].rating).toBe(5);
    });
  });

  describe("Template Performance and Edge Cases", () => {
    it("should handle large number of templates efficiently", async () => {
      const largeTemplateSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `template-${i}`,
        name: `Template ${i}`,
        description: `Description ${i}`,
        category: "test",
        preview: "preview",
        code: `<div>Template ${i}</div>`,
        components: [],
        tags: [`tag${i}`],
        rating: 4.0,
        downloads: i,
        author: "Test Author",
        license: "MIT",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
        isPublic: true,
        framework: "react",
        styling: "tailwindcss",
      }));

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(largeTemplateSet),
      });

      const startTime = Date.now();
      const templates = await getTemplates({ category: "test" });
      const endTime = Date.now();

      expect(templates).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle malformed template data gracefully", async () => {
      const malformedTemplates = [
        {
          id: "template-1",
          name: "Valid Template",
          description: "Valid description",
          category: "ui",
          preview: "preview",
          code: "<div>Valid</div>",
          components: [],
          tags: ["valid"],
          rating: 4.5,
          downloads: 100,
          author: "Author",
          license: "MIT",
          created: "invalid-date", // Invalid date
          modified: "2024-01-01T00:00:00Z",
          isPublic: true,
          framework: "react",
          styling: "tailwindcss",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(malformedTemplates),
      });

      // Should not throw error, but create valid Date objects
      const templates = await fetchTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0].created).toBeInstanceOf(Date);
      expect(templates[0].modified).toBeInstanceOf(Date);
    });

    it("should handle concurrent template fetches correctly", async () => {
      const mockTemplates = [
        {
          id: "template-1",
          name: "Concurrent Template",
          description: "Test concurrency",
          category: "test",
          preview: "preview",
          code: "<div>Concurrent</div>",
          components: [],
          tags: ["concurrent"],
          rating: 4.0,
          downloads: 100,
          author: "Author",
          license: "MIT",
          created: "2024-01-01T00:00:00Z",
          modified: "2024-01-01T00:00:00Z",
          isPublic: true,
          framework: "react",
          styling: "tailwindcss",
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockTemplates),
      });

      // Make multiple concurrent calls
      const promises = [fetchTemplates(), fetchTemplates(), fetchTemplates()];

      const results = await Promise.all(promises);

      // All should return the same data
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);

      // fetch should only be called once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
