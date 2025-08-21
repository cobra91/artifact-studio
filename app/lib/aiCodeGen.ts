import OpenAI from "openai";

import { AIGenerationRequest, ComponentNode } from "../types/artifact";

// Initialize the OpenAI client
// IMPORTANT: Your API key must be set in an environment variable `OPENAI_API_KEY`
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are an expert web developer specializing in creating component trees from user prompts.
Your task is to generate a JSON object representing the component structure based on the user's request.
The JSON object must have three top-level keys: "components", "layout", and "componentDetails".

1.  **components**: An array defining the high-level structure.
2.  **layout**: An object defining styles and children for each component ID. The root container must have an ID of "root".
3.  **componentDetails**: An object providing the specific props for each component ID (e.g., text content, image src).

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
    "bio": { "type": "text", "content": "This is a short bio about the user.", "props": { "className": "text-gray-600 text-center mt-2" } },
    "edit-profile-button": { "type": "button", "content": "Edit Profile", "props": { "className": "bg-blue-500 text-white px-4 py-2 rounded" } },
    "logout-button": { "type": "button", "content": "Logout", "props": { "className": "bg-red-500 text-white px-4 py-2 rounded" } }
  }
}
`;

async function generateComponentTreeFromAI(
  request: AIGenerationRequest,
): Promise<any> {
  const { prompt, framework, styling, theme } = request;

  const userPrompt = `
    Generate a component tree for the following request:
    - Prompt: "${prompt}"
    - Framework: "${framework}"
    - Styling: "${styling}"
    - Theme: "${theme}"
  `;

  try {
    console.log("Making OpenAI API call...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Or "gpt-3.5-turbo"
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    console.log("Received response from OpenAI.");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to generate component tree from AI.");
  }
}

export class AICodeGenerator {
  async create(
    request: AIGenerationRequest,
  ): Promise<{ code: string; components: ComponentNode[] }> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }

    const aiResponse = await generateComponentTreeFromAI(request);
    const components = this.buildComponentTree(aiResponse);
    const code = this.generateReactCode(components, request);

    return { code, components };
  }

  private buildComponentTree(aiResponse: any): ComponentNode[] {
    const { layout, componentDetails } = aiResponse;

    if (!layout || !componentDetails) {
      console.error(
        "Invalid AI Response: missing layout or componentDetails",
        aiResponse,
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
            // This is the fix: ensure children is always an array
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
    componentMap.forEach((node) => {
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
    apiData: { [key: string]: any } = {},
  ): string {
    const stateInitialization = Object.entries(appState)
      .map(([key, value]) => `const [${key}, set${key.charAt(0).toUpperCase() + key.slice(1)}] = useState(${JSON.stringify(value)});`)
      .join("\n  ");

    const apiDataInitialization = Object.entries(apiData)
      .map(([key, url]) => `const [${key}, set${key.charAt(0).toUpperCase() + key.slice(1)}] = useState(null);
  useEffect(() => {
    fetch("${url}")
      .then(res => res.json())
      .then(data => set${key.charAt(0).toUpperCase() + key.slice(1)}(data));
  }, []);`)
      .join("\n  ");

    return `import React, { useState, useEffect } from 'react'

export const GeneratedArtifact = () => {
  ${stateInitialization}
  ${apiDataInitialization}

  return (
    <div className="generated-artifact">
      ${components.map((comp) => this.renderComponentCode(comp, 1)).join("\n")}
    </div>
  )
}

export default GeneratedArtifact`;
  }

  private renderComponentCode(node: ComponentNode, indent: number = 0): string {
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
        ?.map((child) => this.renderComponentCode(child, indent + 1))
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
${childrenContent}${childrenCode ? `\n${childrenCode}\n${spaces}` : ""}
${spaces}</${Element}>`;
  }
}

export const aiCodeGen = new AICodeGenerator();
