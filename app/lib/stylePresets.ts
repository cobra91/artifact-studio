import {
  ComponentStyles,
  PropertyPreset,
  StyleTemplate,
} from "../types/artifact";

export const propertyPresets: PropertyPreset[] = [
  {
    id: "font-size-large",
    name: "Large Font",
    propertyKey: "fontSize",
    value: "24px",
    description: "Sets font size to 24px",
  },
  {
    id: "font-size-medium",
    name: "Medium Font",
    propertyKey: "fontSize",
    value: "16px",
    description: "Sets font size to 16px (default)",
  },
  {
    id: "font-size-small",
    name: "Small Font",
    propertyKey: "fontSize",
    value: "12px",
    description: "Sets font size to 12px",
  },
  {
    id: "width-full",
    name: "Full Width",
    propertyKey: "width",
    value: "100%",
    description: "Sets width to 100%",
  },
  {
    id: "width-half",
    name: "Half Width",
    propertyKey: "width",
    value: "50%",
    description: "Sets width to 50%",
  },
];

export const styleTemplates: StyleTemplate[] = [
  {
    id: "card-shadow",
    name: "Card Shadow",
    description: "Adds a subtle shadow for card-like appearance",
    styles: {
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
      padding: "16px",
      backgroundColor: "#ffffff",
    },
    category: "appearance",
  },
  {
    id: "primary-button",
    name: "Primary Button",
    description: "Styling for a primary call-to-action button",
    styles: {
      backgroundColor: "#007bff",
      color: "#ffffff",
      padding: "10px 20px",
      borderRadius: "5px",
      border: "none",
      fontSize: "16px",
      fontWeight: "bold",
    },
    category: "appearance",
  },
  {
    id: "responsive-image",
    name: "Responsive Image",
    description: "Ensures image is responsive within its container",
    styles: {
      maxWidth: "100%",
      height: "auto",
      display: "block",
    } as ComponentStyles, // Cast to ComponentStyles to allow maxWidth/height
    category: "layout",
  },
];
