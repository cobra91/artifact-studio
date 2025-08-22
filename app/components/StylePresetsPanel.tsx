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
        <h3 className="mb-3 text-lg font-semibold">Property Presets</h3>
        <div className="grid grid-cols-2 gap-3">
          {propertyPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="rounded-md bg-gray-100 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-200"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Style Templates</h3>
        <div className="grid grid-cols-1 gap-3">
          {styleTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => handleApplyTemplate(template)}
              className="rounded-md bg-gray-100 px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-200"
            >
              <div className="font-medium">{template.name}</div>
              <div className="text-xs">
                {template.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
