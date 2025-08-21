"use client";

import { useEffect, useState } from "react";

import { Version, versionControl } from "../lib/versions";

interface VersionPanelProps {
  onRestoreVersion: (components: any[]) => void;
}

export const VersionPanel = ({ onRestoreVersion }: VersionPanelProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [versionName, setVersionName] = useState("");

  useEffect(() => {
    setVersions(versionControl.getVersions());
  }, []);

  const handleSaveVersion = () => {
    if (!versionName.trim()) return;
    const currentCanvas = JSON.parse(localStorage.getItem("canvas") || "[]");
    versionControl.saveVersion(versionName, currentCanvas);
    setVersions(versionControl.getVersions());
    setVersionName("");
  };

  const handleRestore = (id: string) => {
    const components = versionControl.restoreVersion(id);
    if (components) {
      onRestoreVersion(components);
    }
  };

  const handleClearVersions = () => {
    versionControl.clearVersions();
    setVersions([]);
  };

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Versions</h3>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter version name..."
            className="w-full p-2 border rounded-l-md"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
          />
          <button
            onClick={handleSaveVersion}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {versions.map((version) => (
          <div key={version.id} className="flex justify-between items-center p-2 border rounded">
            <div>
              <div className="font-semibold">{version.name}</div>
              <div className="text-xs text-gray-500">{new Date(version.timestamp).toLocaleString()}</div>
            </div>
            <button
              onClick={() => handleRestore(version.id)}
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
      {versions.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleClearVersions}
            className="w-full py-2 text-sm text-red-600 hover:text-red-800"
          >
            Clear All Versions
          </button>
        </div>
      )}
    </div>
  );
};
