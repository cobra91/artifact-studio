import { AIGenerationRequest, ComponentNode } from "../types/artifact";

export class AICodeGenerator {
  async create(
    request: AIGenerationRequest,
  ): Promise<{ code: string; components: ComponentNode[] }> {
    // This is a mock implementation - replace with actual AI service
    const components = await this.generateComponents(request);
    const code = this.generateReactCode(components, request);

    return { code, components };
  }

  private async generateComponents(
    request: AIGenerationRequest,
  ): Promise<ComponentNode[]> {
    // Mock AI generation based on prompt keywords
    const { prompt, interactivity } = request;
    const components: ComponentNode[] = [];

    if (prompt.toLowerCase().includes("calculator")) {
      return this.createCalculatorComponents();
    }

    if (prompt.toLowerCase().includes("quiz")) {
      return this.createQuizComponents();
    }

    if (
      prompt.toLowerCase().includes("chart") ||
      prompt.toLowerCase().includes("visualization")
    ) {
      return this.createChartComponents();
    }

    if (prompt.toLowerCase().includes("pricing")) {
      return this.createPricingComponents();
    }

    // Default: create a simple container with text
    return [
      {
        id: `container-${Date.now()}`,
        type: "container",
        props: {
          className: "p-6 bg-white rounded-lg shadow-md max-w-md mx-auto",
        },
        position: { x: 50, y: 50 },
        size: { width: 400, height: 300 },
        styles: {},
        children: [
          {
            id: `text-${Date.now()}`,
            type: "text",
            props: {
              children: `Generated from: "${prompt}"`,
              className: "text-lg font-semibold text-gray-800 mb-4",
            },
            position: { x: 0, y: 0 },
            size: { width: 380, height: 60 },
            styles: {},
          },
        ],
      },
    ];
  }

  private createCalculatorComponents(): ComponentNode[] {
    return [
      {
        id: "calc-container",
        type: "container",
        props: {
          className: "p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto",
        },
        position: { x: 50, y: 50 },
        size: { width: 400, height: 500 },
        styles: {},
        children: [
          {
            id: "calc-title",
            type: "text",
            props: {
              children: "Loan Calculator",
              className: "text-2xl font-bold text-gray-800 mb-6 text-center",
            },
            position: { x: 0, y: 0 },
            size: { width: 380, height: 40 },
            styles: {},
          },
          {
            id: "amount-input",
            type: "input",
            props: {
              placeholder: "Loan Amount ($)",
              className: "w-full p-3 border border-gray-300 rounded-md mb-4",
            },
            position: { x: 0, y: 60 },
            size: { width: 380, height: 50 },
            styles: {},
          },
          {
            id: "rate-input",
            type: "input",
            props: {
              placeholder: "Interest Rate (%)",
              className: "w-full p-3 border border-gray-300 rounded-md mb-4",
            },
            position: { x: 0, y: 120 },
            size: { width: 380, height: 50 },
            styles: {},
          },
          {
            id: "calc-button",
            type: "button",
            props: {
              children: "Calculate Payment",
              className:
                "w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold",
            },
            position: { x: 0, y: 180 },
            size: { width: 380, height: 50 },
            styles: {},
          },
        ],
      },
    ];
  }

  private createQuizComponents(): ComponentNode[] {
    return [
      {
        id: "quiz-container",
        type: "container",
        props: {
          className: "p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto",
        },
        position: { x: 50, y: 50 },
        size: { width: 600, height: 400 },
        styles: {},
        children: [
          {
            id: "quiz-title",
            type: "text",
            props: {
              children: "React Hooks Quiz",
              className: "text-3xl font-bold text-gray-800 mb-6 text-center",
            },
            position: { x: 0, y: 0 },
            size: { width: 580, height: 50 },
            styles: {},
          },
          {
            id: "question",
            type: "text",
            props: {
              children: "Which hook is used for managing component state?",
              className: "text-lg text-gray-700 mb-4",
            },
            position: { x: 0, y: 70 },
            size: { width: 580, height: 60 },
            styles: {},
          },
          {
            id: "option-a",
            type: "button",
            props: {
              children: "A) useEffect",
              className:
                "w-full text-left p-3 mb-2 border border-gray-300 rounded hover:bg-gray-50",
            },
            position: { x: 0, y: 140 },
            size: { width: 580, height: 45 },
            styles: {},
          },
          {
            id: "option-b",
            type: "button",
            props: {
              children: "B) useState",
              className:
                "w-full text-left p-3 mb-2 border border-gray-300 rounded hover:bg-gray-50",
            },
            position: { x: 0, y: 190 },
            size: { width: 580, height: 45 },
            styles: {},
          },
        ],
      },
    ];
  }

  private createChartComponents(): ComponentNode[] {
    return [
      {
        id: "chart-container",
        type: "container",
        props: { className: "p-6 bg-white rounded-lg shadow-lg" },
        position: { x: 50, y: 50 },
        size: { width: 500, height: 350 },
        styles: {},
        children: [
          {
            id: "chart-title",
            type: "text",
            props: {
              children: "Sales Data Visualization",
              className: "text-2xl font-bold text-gray-800 mb-4 text-center",
            },
            position: { x: 0, y: 0 },
            size: { width: 480, height: 40 },
            styles: {},
          },
          {
            id: "chart-placeholder",
            type: "container",
            props: {
              className:
                "w-full h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center",
            },
            position: { x: 0, y: 60 },
            size: { width: 480, height: 250 },
            styles: {},
            children: [
              {
                id: "chart-text",
                type: "text",
                props: {
                  children: "📊 Interactive Chart Here",
                  className: "text-gray-600 text-lg",
                },
                position: { x: 0, y: 0 },
                size: { width: 200, height: 30 },
                styles: {},
              },
            ],
          },
        ],
      },
    ];
  }

  private createPricingComponents(): ComponentNode[] {
    return [
      {
        id: "pricing-container",
        type: "container",
        props: { className: "p-6 bg-gray-50 rounded-lg" },
        position: { x: 50, y: 50 },
        size: { width: 800, height: 400 },
        styles: {},
        children: [
          {
            id: "pricing-title",
            type: "text",
            props: {
              children: "Choose Your Plan",
              className: "text-3xl font-bold text-gray-800 mb-8 text-center",
            },
            position: { x: 0, y: 0 },
            size: { width: 780, height: 50 },
            styles: {},
          },
          {
            id: "basic-plan",
            type: "container",
            props: {
              className:
                "bg-white p-6 rounded-lg shadow-md border-2 border-gray-200",
            },
            position: { x: 20, y: 70 },
            size: { width: 240, height: 300 },
            styles: {},
            children: [
              {
                id: "basic-title",
                type: "text",
                props: {
                  children: "Basic - $9/mo",
                  className:
                    "text-xl font-semibold text-gray-800 mb-4 text-center",
                },
                position: { x: 0, y: 0 },
                size: { width: 220, height: 30 },
                styles: {},
              },
            ],
          },
          {
            id: "pro-plan",
            type: "container",
            props: {
              className:
                "bg-white p-6 rounded-lg shadow-md border-2 border-blue-500",
            },
            position: { x: 280, y: 70 },
            size: { width: 240, height: 300 },
            styles: {},
            children: [
              {
                id: "pro-title",
                type: "text",
                props: {
                  children: "Pro - $29/mo",
                  className:
                    "text-xl font-semibold text-blue-600 mb-4 text-center",
                },
                position: { x: 0, y: 0 },
                size: { width: 220, height: 30 },
                styles: {},
              },
            ],
          },
        ],
      },
    ];
  }

  private generateReactCode(
    components: ComponentNode[],
    request: AIGenerationRequest,
  ): string {
    const { framework, styling } = request;

    return `import React, { useState } from 'react'

export const GeneratedArtifact = () => {
  const [state, setState] = useState({})

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
    const { type, props, children } = node;

    const propsStr = Object.entries(props)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key}="${value}"`;
        }
        return `${key}={${JSON.stringify(value)}}`;
      })
      .join(" ");

    const childrenCode =
      children
        ?.map((child) => this.renderComponentCode(child, indent + 1))
        .join("\n") || "";

    switch (type) {
      case "container":
        return `${spaces}<div ${propsStr}>
${childrenCode}
${spaces}</div>`;
      case "text":
        const textContent = props.children || "";
        return `${spaces}<span ${propsStr}>${textContent}</span>`;
      case "button":
        const buttonText = props.children || "Button";
        return `${spaces}<button ${propsStr}>${buttonText}</button>`;
      case "input":
        return `${spaces}<input ${propsStr} />`;
      default:
        return `${spaces}<div ${propsStr}>${childrenCode}</div>`;
    }
  }
}

export const aiCodeGen = new AICodeGenerator();
