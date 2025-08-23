import { AIGenerationRequest, ComponentNode } from "../types/artifact";

// AIML Provider API configuration
const AIML_API_URL = process.env.AIML_API_URL || "https://api.aimlapi.com/v1";
const AIML_API_KEY = process.env.AIML_API_KEY;

interface AIMLRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  response_format?: { type: string };
  temperature?: number;
  max_tokens?: number;
}

interface AIMLResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const systemPrompt = `
You are an expert web developer specializing in creating component trees from user prompts.
Your task is to generate a JSON object representing the component structure based on the user's request.
The JSON object must have three top-level keys: "components", "layout", and "componentDetails".

1.  **components**: An array defining the high-level structure.
2.  **layout**: An object defining styles and children for each component ID. The root container must have an ID of "root".
3.  **componentDetails**: An object providing the specific props for each component ID (e.g., text content, image src).

**Component Types and Examples:**

*   **container**: A flexible layout element. Use it for grouping other components.
    *   { "type": "container", "id": "root", "children": ["header", "content"] }
*   **text**: For displaying static text.
    *   { "type": "text", "content": "Hello, World!", "props": { "className": "text-xl" } }
*   **button**: An interactive button.
    *   { "type": "button", "content": "Click Me", "props": { "className": "btn-primary" } }
*   **input**: A text input field.
    *   { "type": "input", "props": { "placeholder": "Enter your name" } }
*   **image**: For displaying images.
    *   { "type": "image", "props": { "src": "/placeholder.png", "alt": "Placeholder" } }
*   **calculator**: A component with state and logic for calculations.
    *   { "type": "calculator", "id": "my-calculator" }
*   **quiz**: A component with questions, answers, and scoring.
    *   { "type": "quiz", "id": "tech-quiz", "props": { "questions": [...] } }
*   **chart**: For data visualization.
    *   { "type": "chart", "id": "sales-chart", "props": { "chartType": "bar", "data": {...} } }

**Styling:**

*   Use the "styles" property in the "layout" object for CSS styles.
*   For frameworks like TailwindCSS, use the "className" property in "props".

Here is an example of the required JSON structure for a "user profile card" prompt:
{
  "components": [
    { "type": "container", "id": "root", "children": ["avatar", "name", "bio", "button-group"] }
  ],
  "layout": {
    "root": {
      "styles": { "padding": "2rem", "backgroundColor": "#f9fafb", "borderRadius": "12px", "textAlign": "center" }
    },
    "button-group": {
      "type": "container",
      "layout": "flex-row",
      "styles": { "marginTop": "1.5rem", "gap": "1rem", "justifyContent": "center" },
      "children": ["edit-profile-button", "logout-button"]
    }
  },
  "componentDetails": {
    "avatar": { "type": "image", "props": { "src": "/avatar-placeholder.png", "alt": "User Avatar", "className": "w-24 h-24 rounded-full mx-auto" } },
    "name": { "type": "text", "content": "User Name", "props": { "className": "text-2xl font-bold text-center mt-4" } },
    "bio": { "type": "text", "content": "This is a short bio about the user.", "props": { "className": " text-center mt-2" } },
    "edit-profile-button": { "type": "button", "content": "Edit Profile", "props": { "className": "bg-blue-500 text-white px-4 py-2 rounded" } },
    "logout-button": { "type": "button", "content": "Logout", "props": { "className": "bg-red-500 text-white px-4 py-2 rounded" } }
  }
}
`;

async function generateComponentTreeFromAIML(
  request: AIGenerationRequest,
  model: string = "gpt-5"
): Promise<any> {
  const { prompt, framework, styling, theme } = request;

  if (!AIML_API_KEY || AIML_API_KEY.trim() === "") {
    throw new Error(
      "AIML_API_KEY environment variable is not set or is empty."
    );
  }

  const userPrompt = `
    Generate a component tree for the following request:
    - Prompt: "${prompt}"
    - Framework: "${framework}"
    - Styling: "${styling}"
    - Theme: "${theme}"
  `;

  const aimlRequest: AIMLRequest = {
    model: model, // Using the selected model
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4000,
  };

  try {
    console.log("Making AIML API call to GPT-5...");

    const response = await fetch(`${AIML_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AIML_API_KEY}`,
      },
      body: JSON.stringify(aimlRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AIML API error: ${response.status} - ${errorText}`);
    }

    const data: AIMLResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AIML API");
    }

    console.log("Received response from AIML API (GPT-5).");
    console.log("Token usage:", data.usage);

    return JSON.parse(content);
  } catch (error) {
    console.error("Error calling AIML API:", error);
    throw new Error("Failed to generate component tree from AIML API.");
  }
}

export class AIMLCodeGenerator {
  async create(
    request: AIGenerationRequest,
    model?: string
  ): Promise<{ code: string; components: ComponentNode[] }> {
    const aiResponse = await generateComponentTreeFromAIML(request, model);
    const components = this.buildComponentTree(aiResponse);

    let code = "";
    switch (request.framework) {
      case "vue":
        code = this.generateVueCode(components, request);
        break;
      case "svelte":
        code = this.generateSvelteCode(components, request);
        break;
      case "react":
      default:
        code = this.generateReactCode(components, request);
        break;
    }

    return { code, components };
  }

  private buildComponentTree(aiResponse: any): ComponentNode[] {
    const { layout, componentDetails } = aiResponse;

    if (!layout || !componentDetails) {
      console.error(
        "Invalid AI Response: missing layout or componentDetails",
        aiResponse
      );
      return [];
    }

    const componentMap = new Map<string, ComponentNode>();

    // Create all component nodes from componentDetails
    Object.entries(componentDetails).forEach(([id, detail]: [string, any]) => {
      const node: ComponentNode = {
        id,
        type: detail.type,
        props: {
          ...detail.props,
          children: detail.content,
        },
        position: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
        styles: layout[id]?.styles || {},
        children: [], // Initialize children as an empty array
      };
      componentMap.set(id, node);
    });

    // Build the tree structure using the layout information
    const rootNodes: ComponentNode[] = [];
    const childIds = new Set<string>();

    Object.entries(layout).forEach(([parentId, layoutInfo]: [string, any]) => {
      const parentNode = componentMap.get(parentId);
      if (parentNode && layoutInfo.children) {
        layoutInfo.children.forEach((childId: string) => {
          const childNode = componentMap.get(childId);
          if (childNode) {
            if (!parentNode.children) {
              parentNode.children = [];
            }
            parentNode.children.push(childNode);
            childIds.add(childId);
          }
        });
      }
    });

    // Find the root node(s) - those that are not children of any other node
    componentMap.forEach(node => {
      if (!childIds.has(node.id)) {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  public generateReactCode(
    components: ComponentNode[],
    _request?: AIGenerationRequest,
    appState: { [key: string]: any } = {},
    apiData: { [key: string]: any } = {}
  ): string {
    const stateInitialization = Object.entries(appState)
      .map(
        ([key, value]) =>
          `const [${key}, set${key.charAt(0).toUpperCase() + key.slice(1)}] = useState(${JSON.stringify(value)});`
      )
      .join("\n  ");

    const apiDataInitialization = Object.entries(apiData)
      .map(
        ([
          key,
          url,
        ]) => `const [${key}, set${key.charAt(0).toUpperCase() + key.slice(1)}] = useState(null);
  useEffect(() => {
    fetch("${url}")
      .then(res => res.json())
      .then(data => set${key.charAt(0).toUpperCase() + key.slice(1)}(data));
  }, []);`
      )
      .join("\n  ");

    return `import React, { useState, useEffect } from 'react';

export const GeneratedArtifact = () => {
  ${stateInitialization}
  ${apiDataInitialization}

  return (
    <div className="generated-artifact">
      ${components.map(comp => this.renderReactComponent(comp, 1)).join("\n")}
    </div>
  );
};

export default GeneratedArtifact;`;
  }

  private renderReactComponent(
    node: ComponentNode,
    indent: number = 0
  ): string {
    const spaces = "  ".repeat(indent);
    const { type, props, children, styles } = node;

    const combinedProps = { ...props, style: styles };

    const propsStr = Object.entries(combinedProps)
      .map(([key, value]) => {
        if (key === "children" || value === undefined) return null;
        if (key === "style" && Object.keys(value).length === 0) return null;

        if (typeof value === "string") {
          return `${key}="${value}"`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      })
      .filter(Boolean)
      .join(" ");

    const childrenContent = props.children || "";
    const childrenCode =
      children
        ?.map(child => this.renderReactComponent(child, indent + 1))
        .join("\n") || "";

    const elementMap: { [key: string]: string } = {
      container: "div",
      text: "p",
      button: "button",
      input: "input",
      image: "img",
    };

    const Element = elementMap[type] || "div";
    const isSelfClosing = ["input", "img"].includes(Element);

    if (isSelfClosing) {
      return `${spaces}<${Element} ${propsStr} />`;
    }

    return `${spaces}<${Element} ${propsStr}>
${spaces}  ${childrenContent}${childrenCode ? `\n${childrenCode}\n${spaces}` : ""}
${spaces}</${Element}>`;
  }

  public generateVueCode(
    components: ComponentNode[],
    _request?: AIGenerationRequest,
    appState: { [key: string]: any } = {},
    apiData: { [key: string]: any } = {}
  ): string {
    const stateInitialization = Object.entries(appState)
      .map(([key, value]) => `const ${key} = ref(${JSON.stringify(value)});`)
      .join("\n  ");

    const apiDataInitialization = Object.entries(apiData)
      .map(
        ([key, url]) => `const ${key} = ref(null);
  onMounted(async () => {
    const response = await fetch("${url}");
    ${key}.value = await response.json();
  });`
      )
      .join("\n  ");

    return `<template>
  <div class="generated-artifact">
    ${components.map(comp => this.renderVueComponent(comp, 2)).join("\n")}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

  ${stateInitialization}
  ${apiDataInitialization}
</script>

<style scoped>
/* Add component-specific styles here */
</style>`;
  }

  private renderVueComponent(node: ComponentNode, indent: number = 0): string {
    const spaces = "  ".repeat(indent);
    const { type, props, children, styles } = node;

    const propsStr = Object.entries({
      ...props,
      style: this.toInlineCss(styles),
    })
      .map(([key, value]) => {
        if (key === "children" || value === undefined) return null;
        if (key === "style" && Object.keys(value).length === 0) return null;
        if (typeof value === "object") {
          return `:${key}='${JSON.stringify(value)}'`;
        }
        return `${key}="${value}"`;
      })
      .filter(Boolean)
      .join(" ");

    const childrenContent = props.children || "";
    const childrenCode =
      children
        ?.map(child => this.renderVueComponent(child, indent + 1))
        .join("\n") || "";

    const elementMap: { [key: string]: string } = {
      container: "div",
      text: "p",
      button: "button",
      input: "input",
      image: "img",
    };

    const Element = elementMap[type] || "div";
    const isSelfClosing = ["input", "img"].includes(Element);

    if (isSelfClosing) {
      return `${spaces}<${Element} ${propsStr} />`;
    }

    return `${spaces}<${Element} ${propsStr}>
${spaces}  ${childrenContent}${childrenCode ? `\n${childrenCode}\n${spaces}` : ""}
${spaces}</${Element}>`;
  }

  public generateSvelteCode(
    components: ComponentNode[],
    _request?: AIGenerationRequest,
    appState: { [key: string]: any } = {},
    apiData: { [key: string]: any } = {}
  ): string {
    const stateInitialization = Object.entries(appState)
      .map(([key, value]) => `let ${key} = ${JSON.stringify(value)};`)
      .join("\n  ");

    const apiDataInitialization = Object.entries(apiData)
      .map(
        ([key, url]) => `let ${key} = null;
  onMount(async () => {
    const response = await fetch("${url}");
    ${key} = await response.json();
  });`
      )
      .join("\n  ");

    return `<script>
  import { onMount } from 'svelte';

  ${stateInitialization}
  ${apiDataInitialization}
</script>

<div class="generated-artifact">
  ${components.map(comp => this.renderSvelteComponent(comp, 1)).join("\n")}
</div>

<style>
/* Add component-specific styles here */
</style>`;
  }

  private renderSvelteComponent(
    node: ComponentNode,
    indent: number = 0
  ): string {
    const spaces = "  ".repeat(indent);
    const { type, props, children, styles } = node;

    const propsStr = Object.entries({
      ...props,
      style: this.toInlineCss(styles),
    })
      .map(([key, value]) => {
        if (key === "children" || value === undefined) return null;
        if (typeof value === "string" && value) {
          return `${key}="${value}"`;
        }
        return null;
      })
      .filter(Boolean)
      .join(" ");

    const childrenContent = props.children || "";
    const childrenCode =
      children
        ?.map(child => this.renderSvelteComponent(child, indent + 1))
        .join("\n") || "";

    const elementMap: { [key: string]: string } = {
      container: "div",
      text: "p",
      button: "button",
      input: "input",
      image: "img",
    };

    const Element = elementMap[type] || "div";
    const isSelfClosing = ["input", "img"].includes(Element);

    if (isSelfClosing) {
      return `${spaces}<${Element} ${propsStr} />`;
    }

    return `${spaces}<${Element} ${propsStr}>
${spaces}  ${childrenContent}${childrenCode ? `\n${childrenCode}\n${spaces}` : ""}
${spaces}</${Element}>`;
  }

  private toInlineCss(styles: { [key: string]: string | undefined }): string {
    return Object.entries(styles)
      .filter(([, value]) => value !== undefined)
      .map(
        ([key, value]) =>
          `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}:${value}`
      )
      .join(";");
  }
}

export const aimlCodeGen = new AIMLCodeGenerator();
