import {
  StyleCategory as _StyleCategory,
  StyleProperty,
} from "../types/artifact";

export const styleProperties: StyleProperty[] = [
  {
    property: "width",
    label: "Width",
    type: "length",
    category: "layout",
    responsive: true,
    defaultValue: "100px",
    validation: [
      { type: "min", value: 0, message: "Width cannot be negative." },
    ],
  },
  {
    property: "height",
    label: "Height",
    type: "length",
    category: "layout",
    responsive: true,
    defaultValue: "100px",
    validation: [
      { type: "min", value: 0, message: "Height cannot be negative." },
    ],
  },
  {
    property: "backgroundColor",
    label: "Background Color",
    type: "color",
    category: "appearance",
    responsive: true,
    defaultValue: "#ffffff",
  },
  {
    property: "color",
    label: "Text Color",
    type: "color",
    category: "typography",
    responsive: true,
    defaultValue: "#000000",
  },
  {
    property: "fontSize",
    label: "Font Size",
    type: "length",
    category: "typography",
    responsive: true,
    defaultValue: "16px",
    validation: [
      { type: "min", value: 0, message: "Font size cannot be negative." },
    ],
  },
  {
    property: "strokeWidth",
    label: "Stroke Width",
    type: "number",
    category: "appearance",
    responsive: false,
    defaultValue: "1",
    validation: [
      { type: "min", value: 0, message: "Stroke width cannot be negative." },
    ],
  },
  {
    property: "opacity",
    label: "Opacity",
    type: "number",
    category: "appearance",
    responsive: true,
    defaultValue: "1",
    validation: [
      { type: "min", value: 0, message: "Opacity must be between 0 and 1." },
      { type: "max", value: 1, message: "Opacity must be between 0 and 1." },
    ],
  },
];
