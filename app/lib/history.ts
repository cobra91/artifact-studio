import { AIGenerationRequest, ComponentNode } from "../types/artifact";

export interface GenerationHistoryEntry {
  id: string;
  timestamp: number;
  request: AIGenerationRequest;
  components: ComponentNode[];
}

const HISTORY_STORAGE_KEY = "ai-generation-history";

export class GenerationHistory {
  private history: GenerationHistoryEntry[] = [];

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        this.history = JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error("Failed to load generation history:", error);
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error("Failed to save generation history:", error);
    }
  }

  addGeneration(
    request: AIGenerationRequest,
    components: ComponentNode[],
  ): GenerationHistoryEntry {
    const entry: GenerationHistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      request,
      components,
    };

    this.history.unshift(entry);
    this.saveHistory();
    return entry;
  }

  getHistory(): GenerationHistoryEntry[] {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
  }
}

export const generationHistory = new GenerationHistory();
