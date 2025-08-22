import { ArtifactTemplate, TemplateReview } from "../types/artifact";

let artifactTemplates: ArtifactTemplate[] = [];

export const fetchTemplates = async () => {
  if (artifactTemplates.length > 0) {
    return artifactTemplates;
  }

  try {
    const response = await fetch("/templates.json");
    const data = await response.json();
    artifactTemplates = data.map((template: any) => ({
      ...template,
      created: new Date(template.created),
      modified: new Date(template.modified),
    }));
    return artifactTemplates;
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return [];
  }
};

export const getTemplates = async (
  filters: { category?: string; tags?: string[]; search?: string } = {}
) => {
  let templates = await fetchTemplates();

  if (filters.category) {
    templates = templates.filter(
      template => template.category === filters.category
    );
  }

  const { tags } = filters;
  if (tags && tags.length > 0) {
    templates = templates.filter(template =>
      tags.every(tag => template.tags.includes(tag))
    );
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    templates = templates.filter(
      template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm)
    );
  }

  return templates;
};

export const getTemplateById = async (id: string) => {
  const templates = await fetchTemplates();
  return templates.find(template => template.id === id);
};

export const submitReview = async (
  templateId: string,
  review: TemplateReview
) => {
  const templates = await fetchTemplates();
  const template = templates.find(t => t.id === templateId);

  if (template) {
    if (!template.reviews) {
      template.reviews = [];
    }
    template.reviews.push(review);

    // Recalculate average rating
    const totalRating = template.reviews.reduce((sum, r) => sum + r.rating, 0);
    template.rating = parseFloat(
      (totalRating / template.reviews.length).toFixed(1)
    );

    // In a real app, you'd send this to a backend to update the JSON file
    // For now, we just update the in-memory array.
    // This change will be lost on page refresh unless persisted by other means.
  }
};

export const getReviews = async (
  templateId: string
): Promise<TemplateReview[]> => {
  const templates = await fetchTemplates();
  const template = templates.find(t => t.id === templateId);
  return template?.reviews || [];
};
