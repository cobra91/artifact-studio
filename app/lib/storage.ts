const STORAGE_KEYS = {
  RECENT_COLORS: "artifact-studio-recent-colors",
  CUSTOM_COLORS: "artifact-studio-custom-colors",
  GRADIENT_PRESETS: "artifact-studio-gradient-presets",
} as const;

export interface ColorHistoryItem {
  color: string;
  timestamp: number;
  type: "solid" | "gradient";
}

export interface GradientPreset {
  id: string;
  name: string;
  gradient: {
    type: "linear" | "radial";
    angle: number;
    colorStops: Array<{
      id: string;
      color: string;
      position: number;
      opacity: number;
    }>;
  };
}

export class ColorStorage {
  static getRecentColors(limit: number = 20): ColorHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_COLORS);
      if (!stored) return [];

      const colors = JSON.parse(stored) as ColorHistoryItem[];
      return colors.slice(0, limit);
    } catch {
      return [];
    }
  }

  static addRecentColor(
    color: string,
    type: "solid" | "gradient" = "solid"
  ): void {
    try {
      const recent = this.getRecentColors();
      const newItem: ColorHistoryItem = {
        color,
        timestamp: Date.now(),
        type,
      };

      // Remove duplicates
      const filtered = recent.filter(item => item.color !== color);

      // Add new color at the beginning
      const updated = [newItem, ...filtered].slice(0, 50);

      localStorage.setItem(STORAGE_KEYS.RECENT_COLORS, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  static getCustomColors(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_COLORS);
      if (!stored) return [];

      return JSON.parse(stored) as string[];
    } catch {
      return [];
    }
  }

  static addCustomColor(color: string): void {
    try {
      const custom = this.getCustomColors();

      if (!custom.includes(color)) {
        const updated = [...custom, color].slice(0, 100);
        localStorage.setItem(
          STORAGE_KEYS.CUSTOM_COLORS,
          JSON.stringify(updated)
        );
      }
    } catch {
      // Ignore storage errors
    }
  }

  static removeCustomColor(color: string): void {
    try {
      const custom = this.getCustomColors();
      const updated = custom.filter(c => c !== color);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_COLORS, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  static getGradientPresets(): GradientPreset[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GRADIENT_PRESETS);
      if (!stored) return this.getDefaultGradientPresets();

      return JSON.parse(stored) as GradientPreset[];
    } catch {
      return this.getDefaultGradientPresets();
    }
  }

  static saveGradientPreset(preset: GradientPreset): void {
    try {
      const presets = this.getGradientPresets();

      // Remove if exists
      const filtered = presets.filter(p => p.id !== preset.id);

      // Add new preset
      const updated = [...filtered, preset];

      localStorage.setItem(
        STORAGE_KEYS.GRADIENT_PRESETS,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore storage errors
    }
  }

  static deleteGradientPreset(id: string): void {
    try {
      const presets = this.getGradientPresets();
      const updated = presets.filter(p => p.id !== id);

      localStorage.setItem(
        STORAGE_KEYS.GRADIENT_PRESETS,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore storage errors
    }
  }

  private static getDefaultGradientPresets(): GradientPreset[] {
    return [
      {
        id: "sunset",
        name: "Sunset",
        gradient: {
          type: "linear" as const,
          angle: 45,
          colorStops: [
            { id: "1", color: "#ff7e5f", position: 0, opacity: 1 },
            { id: "2", color: "#feb47b", position: 100, opacity: 1 },
          ],
        },
      },
      {
        id: "ocean",
        name: "Ocean",
        gradient: {
          type: "linear" as const,
          angle: 180,
          colorStops: [
            { id: "1", color: "#667eea", position: 0, opacity: 1 },
            { id: "2", color: "#764ba2", position: 100, opacity: 1 },
          ],
        },
      },
      {
        id: "forest",
        name: "Forest",
        gradient: {
          type: "linear" as const,
          angle: 135,
          colorStops: [
            { id: "1", color: "#134e5e", position: 0, opacity: 1 },
            { id: "2", color: "#71b280", position: 100, opacity: 1 },
          ],
        },
      },
      {
        id: "fire",
        name: "Fire",
        gradient: {
          type: "radial" as const,
          angle: 0,
          colorStops: [
            { id: "1", color: "#ff4e50", position: 0, opacity: 1 },
            { id: "2", color: "#fc913a", position: 100, opacity: 1 },
          ],
        },
      },
    ];
  }

  static clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch {
      // Ignore storage errors
    }
  }
}
