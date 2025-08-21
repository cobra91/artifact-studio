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
    "react",
  );
  const [styling, setStyling] = useState<
    "tailwindcss" | "css" | "styled-components"
  >("tailwindcss");
  const [interactivity, setInteractivity] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [theme, setTheme] = useState<"default" | "modern" | "minimalist">(
    "default",
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
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          AI Component Generator
        </h3>
        <p className="text-sm text-gray-600">Describe what you want to build</p>
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe your component
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Create a loan calculator with sliders..."
          className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Configuration Options */}
      <div className="space-y-3 mb-4 flex-grow overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Framework
          </label>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="svelte">Svelte</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Styling
          </label>
          <select
            value={styling}
            onChange={(e) => setStyling(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="tailwindcss">Tailwind CSS</option>
            <option value="css">Plain CSS</option>
            <option value="styled-components">Styled Components</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interactivity
          </label>
          <select
            value={interactivity}
            onChange={(e) => setInteractivity(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="low">Low (Static)</option>
            <option value="medium">Medium (Forms, Clicks)</option>
            <option value="high">High (Animations, Real-time)</option>
          </select>
        </div>

        {/* Smart Styling Suggestions */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
        className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </div>
        ) : (
          "✨ Generate Component"
        )}
      </button>

      {/* History Section */}
      <div className="mt-4 flex-1">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">History</h4>
          <button
            onClick={handleClearHistory}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => applyHistoryEntry(entry)}
              className="w-full p-2 text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gray-700 transition-colors"
            >
              {entry.request.prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
