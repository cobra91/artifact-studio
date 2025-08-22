"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Command {
  id: string;
  name: string;
  description: string;
  shortcut?: string;
  category: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette = ({
  isOpen,
  onClose,
  commands,
}: CommandPaletteProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter(
    command =>
      command.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const executeCommand = useCallback(
    (command: Command) => {
      command.action();
      onClose();
      setSearchQuery("");
      setSelectedIndex(0);
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex, executeCommand, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  const commandPaletteContent = (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-20 transition-all duration-200 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-2xl transform rounded-lg border border-gray-200 bg-white shadow-2xl transition-all duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Type a command or search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 border-none bg-transparent px-4 py-3 text-lg outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="hover: ml-2 rounded-md p-2 text-gray-400 hover:bg-gray-100"
              title="Close (Esc)"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => executeCommand(command)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                    index === selectedIndex
                      ? "border-r-2 border-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {command.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {command.description}
                      </div>
                      <div className="mt-1 text-xs text-blue-600">
                        {command.category}
                      </div>
                    </div>
                    {command.shortcut && (
                      <div className="ml-4 rounded bg-gray-100 px-2 py-1 font-mono text-xs">
                        {command.shortcut}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rounded-b-lg border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            <span>{filteredCommands.length} commands</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render command palette outside the main component tree
  if (typeof window !== "undefined") {
    return createPortal(commandPaletteContent, document.body);
  }

  return null;
};
