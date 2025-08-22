export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export class ColorUtils {
  static normalizeHex(hex: string): string {
    if (!hex) return "#000000";

    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (hex.length !== 6) {
      return "#000000";
    }

    return "#" + hex.toLowerCase();
  }

  static isValidHex(hex: string): boolean {
    if (!hex) return false;

    hex = hex.replace("#", "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    return /^[0-9A-Fa-f]{6}$/.test(hex);
  }

  static hexToRgb(hex: string): RGBColor | null {
    const normalized = ColorUtils.normalizeHex(hex);

    if (!ColorUtils.isValidHex(normalized)) return null;

    const r = parseInt(normalized.slice(1, 3), 16);
    const g = parseInt(normalized.slice(3, 5), 16);
    const b = parseInt(normalized.slice(5, 7), 16);

    return { r, g, b };
  }

  static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static rgbToHsl(r: number, g: number, b: number): HSLColor {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  static hslToRgb(h: number, s: number, l: number): RGBColor {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  static hexToRgba(hex: string, alpha: number): string {
    const rgb = ColorUtils.hexToRgb(hex);
    if (!rgb) return hex;

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  static rgbaToHex(rgba: string): { hex: string; alpha: number } {
    const match = rgba.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
    );

    if (!match) {
      return { hex: "#000000", alpha: 1 };
    }

    const [, r, g, b, a] = match;
    const hex = ColorUtils.rgbToHex(parseInt(r), parseInt(g), parseInt(b));
    const alpha = a ? parseFloat(a) : 1;

    return { hex, alpha };
  }

  static getContrastColor(hexColor: string): string {
    const rgb = ColorUtils.hexToRgb(hexColor);
    if (!rgb) return "#000000";

    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  static generateGradientString(
    type: "linear" | "radial",
    stops: Array<{ color: string; position: number }>,
    angle?: number,
  ): string {
    const stopsString = stops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");

    if (type === "linear") {
      const angleStr = angle ? `${angle}deg` : "90deg";
      return `linear-gradient(${angleStr}, ${stopsString})`;
    } else {
      return `radial-gradient(circle, ${stopsString})`;
    }
  }

  static parseGradientString(gradient: string): {
    type: "linear" | "radial";
    angle?: number;
    stops: Array<{ color: string; position: number }>;
  } | null {
    const linearMatch = gradient.match(/linear-gradient\((.+?)\)/);
    const radialMatch = gradient.match(/radial-gradient\((.+?)\)/);

    if (linearMatch) {
      const parts = linearMatch[1].split(",");
      const anglePart = parts[0].trim();
      const angle = anglePart.includes("deg") ? parseInt(anglePart) : 90;

      const stops = parts.slice(1).map((stop) => {
        const [color, position] = stop.trim().split(" ");
        return {
          color: color.trim(),
          position: parseInt(position) || 0,
        };
      });

      return { type: "linear", angle, stops };
    }

    if (radialMatch) {
      const parts = radialMatch[1].split(",");
      const stops = parts.map((stop) => {
        const [color, position] = stop.trim().split(" ");
        return {
          color: color.trim(),
          position: parseInt(position) || 0,
        };
      });

      return { type: "radial", stops };
    }

    return null;
  }
}
