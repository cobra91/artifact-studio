import React from "react";

import { propertyPresets, styleTemplates } from "../lib/stylePresets";
import { PropertyPreset, StyleTemplate } from "../types/artifact";

interface StylePresetsPanelProps {
  onUpdateElement: (elementId: string, updates: any) => void;
  selectedElementId: string;
}

export const StylePresetsPanel: React.FC<StylePresetsPanelProps> = ({
  onUpdateElement,
  selectedElementId,
}) => {
  const handleApplyPreset = (preset: PropertyPreset) => {
    onUpdateElement(selectedElementId, { [preset.propertyKey]: preset.value });
  };

  const handleApplyTemplate = (template: StyleTemplate) => {
    onUpdateElement(selectedElementId, { styles: { ...template.styles } });
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Property Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          {propertyPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded-md text-left"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs text-gray-600">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Style Templates</h3>
        <div className="grid grid-cols-1 gap-3">
          {styleTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleApplyTemplate(template)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded-md text-left"
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-xs text-gray-600">
                {template.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
