"use client";

import { useEffect, useState } from "react";

import { generationHistory, GenerationHistoryEntry } from "../lib/history";
import { AIGenerationRequest } from "../types/artifact";

interface AIPromptPanelProps {
  onGenerate: (_request: AIGenerationRequest) => Promise<any>;
  isGenerating: boolean;
}

export const AIPromptPanel = ({
  onGenerate,
  isGenerating,
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
  const [history, setHistory] = useState<GenerationHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(generationHistory.getHistory());
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const request = {
      prompt,
      framework,
      styling,
      interactivity,
      theme,
    };

    const result = await onGenerate(request);
    if (result) {
      generationHistory.addGeneration(request, result.components);
      setHistory(generationHistory.getHistory());
    }
  };

  const applyHistoryEntry = (entry: GenerationHistoryEntry) => {
    setPrompt(entry.request.prompt);
    setFramework(entry.request.framework);
    setStyling(entry.request.styling);
    setInteractivity(entry.request.interactivity);
    setTheme(entry.request.theme);
  };

  const handleClearHistory = () => {
    generationHistory.clearHistory();
    setHistory([]);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          AI Component Generator
        </h3>
        <p className="text-sm text-gray-600">Describe what you want to build</p>
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
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
      <div className="mb-4 flex-grow space-y-3 overflow-y-auto">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Framework
          </label>
          <select
            value={framework}
            onChange={e => setFramework(e.target.value as any)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          >
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="svelte">Svelte</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Styling
          </label>
          <select
            value={styling}
            onChange={e => setStyling(e.target.value as any)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          >
            <option value="tailwindcss">Tailwind CSS</option>
            <option value="css">Plain CSS</option>
            <option value="styled-components">Styled Components</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Interactivity
          </label>
          <select
            value={interactivity}
            onChange={e => setInteractivity(e.target.value as any)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm"
          >
            <option value="low">Low (Static)</option>
            <option value="medium">Medium (Forms, Clicks)</option>
            <option value="high">High (Animations, Real-time)</option>
          </select>
        </div>

        {/* Smart Styling Suggestions */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
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
              <span className="ml-2 text-sm text-gray-700">Default</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="modern"
                checked={theme === "modern"}
                onChange={() => setTheme("modern")}
                className="form-radio h-4 w-4 text-purple-600"
              />
              <span className="ml-2 text-sm text-gray-700">Modern</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="minimalist"
                checked={theme === "minimalist"}
                onChange={() => setTheme("minimalist")}
                className="form-radio h-4 w-4 text-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700">Minimalist</span>
            </label>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="w-full rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating...
          </div>
        ) : (
          "✨ Generate Component"
        )}
      </button>

      {/* History Section */}
      <div className="mt-4 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">History</h4>
          <button
            onClick={handleClearHistory}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
        <div className="max-h-40 space-y-2 overflow-y-auto">
          {history.map(entry => (
            <button
              key={entry.id}
              onClick={() => applyHistoryEntry(entry)}
              className="w-full rounded border border-gray-200 bg-gray-50 p-2 text-left text-xs text-gray-700 transition-colors hover:bg-gray-100"
            >
              {entry.request.prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
