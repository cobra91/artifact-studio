import { ComponentNode, ComponentType } from "../types/artifact";

// Predefined template component structures
const TEMPLATE_COMPONENTS: Record<string, ComponentNode[]> = {
  calculator: [
    {
      id: "calc-container",
      type: "container" as ComponentType,
      props: {
        className: "p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto",
      },
      position: { x: 50, y: 50 },
      size: { width: 400, height: 500 },
      styles: {
        padding: "24px",

        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        margin: "0 auto",
      },
      children: [],
    },
    {
      id: "calc-title",
      type: "text" as ComponentType,
      props: {
        className: "text-2xl font-bold text-gray-800 mb-6 text-center",
        children: "Loan Calculator",
      },
      position: { x: 70, y: 70 },
      size: { width: 360, height: 40 },
      styles: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: "24px",
        textAlign: "center",
      },
    },
    {
      id: "calc-form",
      type: "container" as ComponentType,
      props: { className: "space-y-4" },
      position: { x: 70, y: 130 },
      size: { width: 360, height: 200 },
      styles: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      },
      children: [],
    },
    {
      id: "calc-amount",
      type: "input" as ComponentType,
      props: {
        placeholder: "Loan Amount",
        type: "number",
        className:
          "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      },
      position: { x: 70, y: 150 },
      size: { width: 360, height: 50 },
      styles: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        backgroundColor: "#2563eb",
        borderRadius: "6px",
        fontSize: "16px",
      },
    },
    {
      id: "calc-rate",
      type: "input" as ComponentType,
      props: {
        placeholder: "Interest Rate (%)",
        type: "number",
        className:
          "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      },
      position: { x: 70, y: 210 },
      size: { width: 360, height: 50 },
      styles: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        backgroundColor: "#2563eb",
        borderRadius: "6px",
        fontSize: "16px",
      },
    },
    {
      id: "calc-term",
      type: "input" as ComponentType,
      props: {
        placeholder: "Loan Term (years)",
        type: "number",
        className:
          "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      },
      position: { x: 70, y: 270 },
      size: { width: 360, height: 50 },
      styles: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        backgroundColor: "#2563eb",
        borderRadius: "6px",
        fontSize: "16px",
      },
    },
    {
      id: "calc-result",
      type: "container" as ComponentType,
      props: { className: "mt-6 p-4 bg-blue-50 rounded-md" },
      position: { x: 70, y: 350 },
      size: { width: 360, height: 100 },
      styles: {
        marginTop: "24px",
        padding: "16px",
        backgroundColor: "#eff6ff",
        borderRadius: "6px",
      },
      children: [],
    },
    {
      id: "calc-result-text",
      type: "text" as ComponentType,
      props: {
        className: "text-lg font-semibold text-blue-800",
        children: "Monthly Payment: $0",
      },
      position: { x: 90, y: 370 },
      size: { width: 320, height: 60 },
      styles: {
        fontSize: "18px",
        fontWeight: "600",
        color: "white",
      },
    },
  ],

  dashboard: [
    {
      id: "dashboard-container",
      type: "container" as ComponentType,
      props: { className: "p-6 bg-gray-50 rounded-lg" },
      position: { x: 50, y: 50 },
      size: { width: 600, height: 400 },
      styles: {
        padding: "24px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
      },
      children: [],
    },
    {
      id: "dashboard-header",
      type: "text" as ComponentType,
      props: {
        className: "text-3xl font-bold text-gray-800 mb-6",
        children: "Analytics Dashboard",
      },
      position: { x: 70, y: 70 },
      size: { width: 560, height: 50 },
      styles: {
        fontSize: "30px",
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: "24px",
      },
    },
    {
      id: "dashboard-stats",
      type: "container" as ComponentType,
      props: { className: "grid grid-cols-3 gap-4 mb-6" },
      position: { x: 70, y: 140 },
      size: { width: 560, height: 100 },
      styles: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        marginBottom: "24px",
      },
      children: [],
    },
    {
      id: "stat-1",
      type: "container" as ComponentType,
      props: { className: "bg-white p-4 rounded-lg shadow-sm" },
      position: { x: 70, y: 160 },
      size: { width: 170, height: 80 },
      styles: {
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
      children: [],
    },
    {
      id: "stat-1-label",
      type: "text" as ComponentType,
      props: {
        className: "text-sm text-gray-600",
        children: "Total Users",
      },
      position: { x: 90, y: 170 },
      size: { width: 130, height: 20 },
      styles: {
        fontSize: "14px",
        color: "#6b7280",
      },
    },
    {
      id: "stat-1-value",
      type: "text" as ComponentType,
      props: {
        className: "text-2xl font-bold text-blue-600",
        children: "12,345",
      },
      position: { x: 90, y: 190 },
      size: { width: 130, height: 30 },
      styles: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#2563eb",
      },
    },
    {
      id: "stat-2",
      type: "container" as ComponentType,
      props: { className: "bg-white p-4 rounded-lg shadow-sm" },
      position: { x: 260, y: 160 },
      size: { width: 170, height: 80 },
      styles: {
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
      children: [],
    },
    {
      id: "stat-2-label",
      type: "text" as ComponentType,
      props: {
        className: "text-sm text-gray-600",
        children: "Revenue",
      },
      position: { x: 280, y: 170 },
      size: { width: 130, height: 20 },
      styles: {
        fontSize: "14px",
        color: "#6b7280",
      },
    },
    {
      id: "stat-2-value",
      type: "text" as ComponentType,
      props: {
        className: "text-2xl font-bold text-green-600",
        children: "$45,678",
      },
      position: { x: 280, y: 190 },
      size: { width: 130, height: 30 },
      styles: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#16a34a",
      },
    },
    {
      id: "stat-3",
      type: "container" as ComponentType,
      props: { className: "bg-white p-4 rounded-lg shadow-sm" },
      position: { x: 450, y: 160 },
      size: { width: 170, height: 80 },
      styles: {
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
      children: [],
    },
    {
      id: "stat-3-label",
      type: "text" as ComponentType,
      props: {
        className: "text-sm text-gray-600",
        children: "Growth",
      },
      position: { x: 470, y: 170 },
      size: { width: 130, height: 20 },
      styles: {
        fontSize: "14px",
        color: "#6b7280",
      },
    },
    {
      id: "stat-3-value",
      type: "text" as ComponentType,
      props: {
        className: "text-2xl font-bold text-purple-600",
        children: "+23%",
      },
      position: { x: 470, y: 190 },
      size: { width: 130, height: 30 },
      styles: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#9333ea",
      },
    },
    {
      id: "dashboard-chart",
      type: "container" as ComponentType,
      props: { className: "bg-white p-4 rounded-lg shadow-sm" },
      position: { x: 70, y: 260 },
      size: { width: 560, height: 120 },
      styles: {
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      },
      children: [],
    },
    {
      id: "chart-title",
      type: "text" as ComponentType,
      props: {
        className: "text-lg font-semibold text-gray-800 mb-4",
        children: "Monthly Performance",
      },
      position: { x: 90, y: 280 },
      size: { width: 520, height: 30 },
      styles: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: "16px",
      },
    },
    {
      id: "chart-placeholder",
      type: "text" as ComponentType,
      props: {
        className: "text-gray-500 text-center py-8",
        children: "📊 Chart visualization will be rendered here",
      },
      position: { x: 90, y: 320 },
      size: { width: 520, height: 40 },
      styles: {
        color: "#6b7280",
        textAlign: "center",
        padding: "32px 0",
      },
    },
  ],

  form: [
    {
      id: "form-container",
      type: "container" as ComponentType,
      props: {
        className: "p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto",
      },
      position: { x: 50, y: 50 },
      size: { width: 450, height: 600 },
      styles: {
        padding: "24px",

        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        maxWidth: "450px",
        margin: "0 auto",
      },
      children: [],
    },
    {
      id: "form-title",
      type: "text" as ComponentType,
      props: {
        className: "text-2xl font-bold text-gray-800 mb-6 text-center",
        children: "Contact Form",
      },
      position: { x: 70, y: 70 },
      size: { width: 410, height: 40 },
      styles: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: "24px",
        textAlign: "center",
      },
    },
    {
      id: "form-fields",
      type: "container" as ComponentType,
      props: { className: "space-y-4" },
      position: { x: 70, y: 130 },
      size: { width: 410, height: 350 },
      styles: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      },
      children: [],
    },
    {
      id: "form-name",
      type: "input" as ComponentType,
      props: {
        placeholder: "Your Name",
        className:
          "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      },
      position: { x: 70, y: 150 },
      size: { width: 410, height: 50 },
      styles: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "16px",
        color: "black",
      },
    },
    {
      id: "form-email",
      type: "input" as ComponentType,
      props: {
        placeholder: "Your Email",
        type: "email",
        className:
          "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      },
      position: { x: 70, y: 210 },
      size: { width: 410, height: 50 },
      styles: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "16px",
        color: "black",
      },
    },
    {
      id: "form-subject",
      type: "input" as ComponentType,
      props: {
        placeholder: "Subject",
        className:
          "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      },
      position: { x: 70, y: 270 },
      size: { width: 410, height: 50 },
      styles: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "16px",
        color: "black",
      },
    },
    {
      id: "form-message",
      type: "input" as ComponentType,
      props: {
        placeholder: "Your Message",
        className:
          "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      },
      position: { x: 70, y: 330 },
      size: { width: 410, height: 120 },
      styles: {
        width: "100%",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "16px",
        minHeight: "120px",
        resize: "vertical",
        color: "black",
      },
    },
    {
      id: "form-submit",
      type: "button" as ComponentType,
      props: {
        className:
          "w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium",
        children: "Send Message",
      },
      position: { x: 70, y: 500 },
      size: { width: 410, height: 50 },
      styles: {
        width: "100%",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "6px",
        fontSize: "16px",
        fontWeight: "500",
        border: "none",
        cursor: "pointer",
      },
    },
  ],

  quiz: [
    {
      id: "quiz-container",
      type: "container" as ComponentType,
      props: {
        className: "p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto",
      },
      position: { x: 50, y: 50 },
      size: { width: 500, height: 600 },
      styles: {
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        maxWidth: "500px",
        margin: "0 auto",
      },
      children: [],
    },
    {
      id: "quiz-header",
      type: "container" as ComponentType,
      props: { className: "mb-6" },
      position: { x: 70, y: 70 },
      size: { width: 460, height: 80 },
      styles: {
        marginBottom: "24px",
      },
      children: [],
    },
    {
      id: "quiz-title",
      type: "text" as ComponentType,
      props: {
        className: "text-2xl font-bold text-gray-800 mb-2",
        children: "Interactive Quiz",
      },
      position: { x: 70, y: 70 },
      size: { width: 460, height: 40 },
      styles: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: "8px",
      },
    },
    {
      id: "quiz-score",
      type: "text" as ComponentType,
      props: {
        className: "text-sm text-gray-600",
        children: "Score: 0/0",
      },
      position: { x: 70, y: 110 },
      size: { width: 460, height: 20 },
      styles: {
        fontSize: "14px",
        color: "#6b7280",
      },
    },
    {
      id: "quiz-question",
      type: "text" as ComponentType,
      props: {
        className: "text-lg font-medium text-gray-800 mb-6",
        children: "What is the capital of France?",
      },
      position: { x: 70, y: 170 },
      size: { width: 460, height: 60 },
      styles: {
        fontSize: "18px",
        fontWeight: "500",
        color: "#1f2937",
        marginBottom: "24px",
      },
    },
    {
      id: "quiz-options",
      type: "container" as ComponentType,
      props: { className: "space-y-3" },
      position: { x: 70, y: 250 },
      size: { width: 460, height: 200 },
      styles: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      },
      children: [],
    },
    {
      id: "quiz-option-1",
      type: "button" as ComponentType,
      props: {
        className:
          "w-full p-4 text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200",
        children: "A. London",
      },
      position: { x: 70, y: 250 },
      size: { width: 460, height: 50 },
      styles: {
        width: "100%",
        padding: "16px",
        textAlign: "left",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
      },
    },
    {
      id: "quiz-option-2",
      type: "button" as ComponentType,
      props: {
        className:
          "w-full p-4 text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200",
        children: "B. Paris",
      },
      position: { x: 70, y: 310 },
      size: { width: 460, height: 50 },
      styles: {
        width: "100%",
        padding: "16px",
        textAlign: "left",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
      },
    },
    {
      id: "quiz-option-3",
      type: "button" as ComponentType,
      props: {
        className:
          "w-full p-4 text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200",
        children: "C. Berlin",
      },
      position: { x: 70, y: 370 },
      size: { width: 460, height: 50 },
      styles: {
        width: "100%",
        padding: "16px",
        textAlign: "left",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "16px",
        cursor: "pointer",
      },
    },
    {
      id: "quiz-option-4",
      type: "button" as ComponentType,
      props: {
        className:
          "w-full p-4 text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200",
        children: "D. Madrid",
      },
      position: { x: 70, y: 430 },
      size: { width: 460, height: 50 },
      styles: {
        width: "100%",
        padding: "16px",
        textAlign: "left",
        border: "1px solid #d1d5db",
        borderRadius: "6px",

        fontSize: "16px",
        cursor: "pointer",
      },
    },
    {
      id: "quiz-progress",
      type: "container" as ComponentType,
      props: { className: "mt-6 p-3 bg-gray-100 rounded-md" },
      position: { x: 70, y: 470 },
      size: { width: 460, height: 60 },
      styles: {
        marginTop: "24px",
        padding: "12px",
        backgroundColor: "#f3f4f6",
        borderRadius: "6px",
      },
      children: [],
    },
    {
      id: "quiz-progress-text",
      type: "text" as ComponentType,
      props: {
        className: "text-sm text-gray-600 text-center",
        children: "Question 1 of 5",
      },
      position: { x: 90, y: 490 },
      size: { width: 420, height: 20 },
      styles: {
        fontSize: "14px",
        color: "#6b7280",
        textAlign: "center",
      },
    },
  ],
};

export const loadTemplate = async (
  templateId: string
): Promise<ComponentNode[]> => {
  // Check if template exists in our predefined templates
  if (TEMPLATE_COMPONENTS[templateId]) {
    // Clone the template components to avoid mutations
    return JSON.parse(JSON.stringify(TEMPLATE_COMPONENTS[templateId]));
  }

  // If not found in predefined templates, try to fetch from templates.json
  try {
    const response = await fetch("/templates.json");
    const templates = await response.json();
    const template = templates.find((t: any) => t.id === templateId);

    if (template) {
      // For now, return a basic container with template info
      // In a full implementation, you would parse the template.code or template.components
      return [
        {
          id: "template-info",
          type: "container" as ComponentType,
          props: { className: "p-6 bg-blue-50 rounded-lg" },
          position: { x: 50, y: 50 },
          size: { width: 400, height: 200 },
          styles: {
            padding: "24px",
            backgroundColor: "#eff6ff",
            borderRadius: "8px",
          },
          children: [],
        },
        {
          id: "template-name",
          type: "text" as ComponentType,
          props: {
            className: "text-xl font-bold text-blue-800 mb-2",
            children: template.name,
          },
          position: { x: 70, y: 70 },
          size: { width: 360, height: 30 },
          styles: {
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1e40af",
            marginBottom: "8px",
          },
        },
        {
          id: "template-desc",
          type: "text" as ComponentType,
          props: {
            className: "text-blue-700",
            children: template.description,
          },
          position: { x: 70, y: 110 },
          size: { width: 360, height: 80 },
          styles: {
            color: "#1d4ed8",
          },
        },
      ];
    }
  } catch (error) {
    console.error("Failed to load template:", error);
  }

  throw new Error(`Template "${templateId}" not found`);
};

export const getAvailableTemplates = (): string[] => {
  return Object.keys(TEMPLATE_COMPONENTS);
};
