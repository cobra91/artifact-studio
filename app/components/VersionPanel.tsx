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
        <h3 className="mb-2 text-lg font-semibold text-gray-800">Versions</h3>
        <div className="flex">
          <input
            type="text"
            placeholder="Enter version name..."
            className="w-full rounded-l-md border p-2"
            value={versionName}
            onChange={e => setVersionName(e.target.value)}
          />
          <button
            onClick={handleSaveVersion}
            className="rounded-r-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {versions.map(version => (
          <div
            key={version.id}
            className="flex items-center justify-between rounded border p-2"
          >
            <div>
              <div className="font-semibold">{version.name}</div>
              <div className="text-xs text-gray-500">
                {new Date(version.timestamp).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => handleRestore(version.id)}
              className="rounded bg-gray-600 px-2 py-1 text-xs hover:bg-gray-300"
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
