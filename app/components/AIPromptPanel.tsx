"use client";

import { useEffect, useState } from "react";

import { AIProvider, unifiedAIProvider } from "../lib/aiProvider";
import { generationHistory, GenerationHistoryEntry } from "../lib/history";
import { AIGenerationRequest, ComponentNode } from "../types/artifact";

interface AIPromptPanelProps {
  onGenerate: (
    _request: AIGenerationRequest,
    _config?: { provider: AIProvider }
  ) => Promise<any>;
  isGenerating: boolean;
  onRestoreComponents?: (components: ComponentNode[]) => void;
}

export const AIPromptPanel = ({
  onGenerate,
  isGenerating,
  onRestoreComponents,
}: AIPromptPanelProps) => {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<"react" | "vue" | "svelte">(
    "react"
  );
  const [styling, setStyling] = useState<
    "tailwindcss" | "css" | "styled-components"
  >("tailwindcss");
  const [interactivity, setInteractivity] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [theme, setTheme] = useState<"default" | "modern" | "minimalist">(
    "default"
  );
  const [aiProvider, setAiProvider] = useState<AIProvider>("openrouter");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<
    Array<{ id: string; name: string; description: string }>
  >([]);
  const [availableAimlModels, setAvailableAimlModels] = useState<
    Array<{ id: string; name: string; description: string }>
  >([]);
  const [availableOpenaiModels, setAvailableOpenaiModels] = useState<
    Array<{ id: string; name: string; description: string }>
  >([]);
  const [history, setHistory] = useState<GenerationHistoryEntry[]>([]);
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>(
    []
  );

  // Handle provider change
  const handleProviderChange = (newProvider: AIProvider) => {
    setAiProvider(newProvider);

    // Reset selected model and set default for new provider
    if (newProvider === "openrouter" && availableModels.length > 0) {
      setSelectedModel(availableModels[0].id);
    } else if (newProvider === "aiml" && availableAimlModels.length > 0) {
      setSelectedModel(availableAimlModels[0].id);
    } else if (newProvider === "openai" && availableOpenaiModels.length > 0) {
      setSelectedModel(availableOpenaiModels[0].id);
    } else {
      setSelectedModel("");
    }
  };

  useEffect(() => {
    setHistory(generationHistory.getHistory());

    // Fetch available providers from API
    fetch("/api/providers")
      .then(res => res.json())
      .then(data => {
        console.log("Providers API response:", data);

        // Ensure data has the expected structure
        const providers = data?.providers || [];
        const openRouterModels = data?.openRouterModels || [];
        const aimlModels = data?.aimlModels || [];
        const openaiModels = data?.openaiModels || [];

        setAvailableProviders(providers);

        // Only set default provider and model on initial load
        if (providers.length > 0 && !aiProvider) {
          setAiProvider(providers[0]);

          // Set default model based on provider
          if (providers[0] === "openrouter" && openRouterModels.length > 0) {
            setSelectedModel(openRouterModels[0].id);
          } else if (providers[0] === "aiml" && aimlModels.length > 0) {
            setSelectedModel(aimlModels[0].id);
          } else if (providers[0] === "openai" && openaiModels.length > 0) {
            setSelectedModel(openaiModels[0].id);
          }
        }

        // Set OpenRouter models if available
        if (openRouterModels.length > 0) {
          setAvailableModels(openRouterModels);
          // Only set default if not already set and provider is openrouter
          if (!selectedModel && aiProvider === "openrouter") {
            setSelectedModel(openRouterModels[0].id);
          }
        }

        // Set AIML models if available
        if (aimlModels.length > 0) {
          setAvailableAimlModels(aimlModels);
          // Only set default if not already set and provider is aiml
          if (!selectedModel && aiProvider === "aiml") {
            setSelectedModel(aimlModels[0].id);
          }
        }

        // Set OpenAI models if available
        if (openaiModels.length > 0) {
          setAvailableOpenaiModels(openaiModels);
          // Only set default if not already set and provider is openai
          if (!selectedModel && aiProvider === "openai") {
            setSelectedModel(openaiModels[0].id);
          }
        }
      })
      .catch(error => {
        console.error("Error fetching providers:", error);
        setAvailableProviders([]);
      });
  }, []); // Remove selectedModel dependency

  const handleGenerate = async () => {
    console.log("handleGenerate called with prompt:", prompt);
    if (!prompt.trim()) return;

    const request = {
      prompt,
      framework,
      styling,
      interactivity,
      theme,
    };

    // Pass the AI provider configuration to the parent component
    const config: { provider: AIProvider; model?: string } = {
      provider: aiProvider,
    };
    if (
      (aiProvider === "openrouter" ||
        aiProvider === "aiml" ||
        aiProvider === "openai") &&
      selectedModel
    ) {
      config.model = selectedModel;
    }

    const result = await onGenerate(request, config);

    if (result) {
      generationHistory.addGeneration(request, result.components);
      setHistory(generationHistory.getHistory());
    }
  };

  const applyHistoryEntry = (entry: GenerationHistoryEntry) => {
    // Restore form values
    setPrompt(entry.request.prompt);
    setFramework(entry.request.framework);
    setStyling(entry.request.styling);
    setInteractivity(entry.request.interactivity);
    setTheme(entry.request.theme);

    // Restore components if callback is provided and components exist
    if (
      onRestoreComponents &&
      entry.components &&
      entry.components.length > 0
    ) {
      onRestoreComponents(entry.components);
    }
  };

  const handleClearHistory = () => {
    generationHistory.clearHistory();
    setHistory([]);
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          AI Component Generator
        </h3>
        <p className="text-sm">Describe what you want to build</p>
      </div>

      {/* Prompt Input */}
      <div className="mb-4 flex-shrink-0">
        <label className="mb-2 block text-sm font-medium">
          Describe your component
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g., Create a loan calculator with sliders..."
          className="h-24 w-full resize-none rounded-md border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Configuration Options */}
      <div className="mb-4 flex-shrink-0 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">
            AI Provider
          </label>
          {availableProviders.length > 0 ? (
            <>
              <select
                value={aiProvider}
                onChange={e =>
                  handleProviderChange(e.target.value as AIProvider)
                }
                className="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-200"
              >
                {availableProviders.map(provider => {
                  const info = unifiedAIProvider.getProviderInfo(provider);
                  return (
                    <option key={provider} value={provider}>
                      {info.name} ({info.model})
                    </option>
                  );
                })}
              </select>
              {aiProvider && (
                <p className="mt-1 text-xs text-gray-300">
                  {unifiedAIProvider.getProviderInfo(aiProvider).description}
                </p>
              )}
            </>
          ) : (
            <div className="rounded-md border border-yellow-600 bg-yellow-900/20 p-3">
              <p className="mb-2 text-sm font-medium text-yellow-200">
                ⚠️ No AI providers configured
              </p>
              <p className="mb-3 text-sm text-yellow-100">
                To use AI generation, please set at least one API key in your
                environment variables:
              </p>
              <ul className="space-y-1 text-xs text-yellow-100">
                <li>
                  •{" "}
                  <code className="rounded bg-yellow-800/50 px-1 text-yellow-200">
                    AIML_API_KEY
                  </code>{" "}
                  for AIML (GPT-5)
                </li>
                <li>
                  •{" "}
                  <code className="rounded bg-yellow-800/50 px-1 text-yellow-200">
                    OPENAI_API_KEY
                  </code>{" "}
                  for OpenAI (GPT-4 Turbo)
                </li>
                <li>
                  •{" "}
                  <code className="rounded bg-yellow-800/50 px-1 text-yellow-200">
                    OPENROUTER_API_KEY
                  </code>{" "}
                  for OpenRouter (Multiple Models)
                </li>
              </ul>
              <p className="mt-2 text-xs text-yellow-200">
                Create a{" "}
                <code className="rounded bg-yellow-800/50 px-1 text-yellow-200">
                  .env.local
                </code>{" "}
                file in your project root with these variables.
              </p>
            </div>
          )}

          {/* Model Selection for OpenRouter */}
          {aiProvider === "openrouter" && availableModels.length > 0 && (
            <div className="mt-2">
              <label className="mb-1 block text-sm font-medium text-gray-200">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-200"
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {selectedModel && (
                <p className="mt-1 text-xs text-gray-300">
                  {
                    availableModels.find(m => m.id === selectedModel)
                      ?.description
                  }
                </p>
              )}
            </div>
          )}

          {/* Model Selection for AIML */}
          {aiProvider === "aiml" && availableAimlModels.length > 0 && (
            <div className="mt-2">
              <label className="mb-1 block text-sm font-medium text-gray-200">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-200"
              >
                {availableAimlModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {selectedModel && (
                <p className="mt-1 text-xs text-gray-300">
                  {
                    availableAimlModels.find(m => m.id === selectedModel)
                      ?.description
                  }
                </p>
              )}
            </div>
          )}

          {/* Model Selection for OpenAI */}
          {aiProvider === "openai" && availableOpenaiModels.length > 0 && (
            <div className="mt-2">
              <label className="mb-1 block text-sm font-medium text-gray-200">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-200"
              >
                {availableOpenaiModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {selectedModel && (
                <p className="mt-1 text-xs text-gray-300">
                  {
                    availableOpenaiModels.find(m => m.id === selectedModel)
                      ?.description
                  }
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">
            Framework
          </label>
          <select
            value={framework}
            onChange={e => setFramework(e.target.value as any)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-200"
          >
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="svelte">Svelte</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">
            Styling
          </label>
          <select
            value={styling}
            onChange={e => setStyling(e.target.value as any)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-200"
          >
            <option value="tailwindcss">Tailwind CSS</option>
            <option value="css">Plain CSS</option>
            <option value="styled-components">Styled Components</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">
            Interactivity
          </label>
          <select
            value={interactivity}
            onChange={e => setInteractivity(e.target.value as any)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-200"
          >
            <option value="low">Low (Static)</option>
            <option value="medium">Medium (Forms, Clicks)</option>
            <option value="high">High (Animations, Real-time)</option>
          </select>
        </div>

        {/* Smart Styling Suggestions */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-200">
            Visual Theme
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="default"
                checked={theme === "default"}
                onChange={() => setTheme("default")}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-200">Default</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="modern"
                checked={theme === "modern"}
                onChange={() => setTheme("modern")}
                className="form-radio h-4 w-4 text-purple-600"
              />
              <span className="ml-2 text-sm text-gray-200">Modern</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="minimalist"
                checked={theme === "minimalist"}
                onChange={() => setTheme("minimalist")}
                className="form-radio h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-200">Minimalist</span>
            </label>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-4 flex-shrink-0">
        <button
          onClick={handleGenerate}
          disabled={
            !prompt.trim() || isGenerating || availableProviders.length === 0
          }
          className={`w-full rounded-md px-4 py-2 text-white transition-all ${
            isGenerating
              ? "cursor-not-allowed bg-gradient-to-r from-purple-700 to-blue-700 opacity-75"
              : availableProviders.length === 0
                ? "cursor-not-allowed bg-gray-400"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          } disabled:cursor-not-allowed disabled:opacity-50`}
          title={`Prompt: "${prompt.trim()}", Providers: ${availableProviders.length}, Generating: ${isGenerating}`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating Component...
            </div>
          ) : availableProviders.length === 0 ? (
            <div className="flex items-center justify-center gap-2">
              <span>🔒</span>
              No AI Provider Available
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>✨</span>
              Generate Component
            </div>
          )}
        </button>
      </div>

      {/* History Section - Takes remaining space */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex flex-shrink-0 items-center justify-between">
          <h4 className="text-sm font-medium text-gray-200">History</h4>
          <button
            onClick={handleClearHistory}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {history.length === 0 ? (
            <p className="py-4 text-center text-xs text-gray-400">
              No generation history yet
            </p>
          ) : (
            history.map(entry => (
              <button
                key={entry.id}
                onClick={() => applyHistoryEntry(entry)}
                className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-left text-xs transition-colors hover:border-gray-500 hover:bg-gray-700"
                title={`Click to restore ${entry.components?.length || 0} components from this generation`}
              >
                <div className="truncate font-medium text-gray-200">
                  {entry.request.prompt}
                </div>
                <div className="mt-1 text-gray-400">
                  {entry.components?.length || 0} components •{" "}
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
