"use client";

import { Modal } from "./ui/modal";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const shortcuts = [
    { key: "Ctrl+K", description: "Open Command Palette" },
    { key: "Ctrl+C", description: "Copy selected component" },
    { key: "Ctrl+V", description: "Paste component" },
    { key: "Ctrl+Z", description: "Undo last action" },
    { key: "Ctrl+Shift+Z", description: "Redo last action" },
    { key: "Ctrl+A", description: "Select all components" },
    { key: "Ctrl+D", description: "Duplicate selected component" },
    { key: "Delete", description: "Delete selected components" },
    { key: "Esc", description: "Clear selection" },
  ];

  const features = [
    {
      title: "Visual Editor",
      description:
        "Drag and drop components, resize, and position them visually",
    },
    {
      title: "Responsive Design",
      description:
        "Create responsive layouts with breakpoints (Base, Small, Medium, Large)",
    },
    {
      title: "Style Panel",
      description: "Customize colors, typography, spacing, and more",
    },
    {
      title: "Live Preview",
      description: "See your component in action with real-time updates",
    },
    {
      title: "Export & Deploy",
      description: "Export as package or deploy directly to production",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Help & Keyboard Shortcuts"
      size="lg"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            Welcome to Visual Artifact Studio! 🎨
          </h3>
          <p className="text-blue-700">
            Create stunning UI components with our powerful visual editor. Use
            the keyboard shortcuts below to work efficiently.
          </p>
        </div>

        {/* Keyboard Shortcuts */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {shortcuts.map(shortcut => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3"
              >
                <span className="font-mono text-sm font-medium">
                  {shortcut.key}
                </span>
                <span className="text-sm">{shortcut.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Key Features
          </h3>
          <div className="space-y-3">
            {features.map(feature => (
              <div
                key={feature.title}
                className="rounded-lg border border-gray-200 p-4"
              >
                <h4 className="mb-1 font-semibold text-gray-900">
                  {feature.title}
                </h4>
                <p className="text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="mb-2 text-lg font-semibold text-green-900">
            💡 Quick Tips
          </h3>
          <ul className="space-y-1 text-sm text-green-700">
            <li>
              • Use the Command Palette (Ctrl+K) to quickly access any feature
            </li>
            <li>
              • Switch between Edit and Preview modes to test your components
            </li>
            <li>• Use the responsive panel to test different screen sizes</li>
            <li>• Group components together for easier management</li>
            <li>• Export your work as a package to share with others</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-300"
          >
            Got it!
          </button>
        </div>
      </div>
    </Modal>
  );
};
