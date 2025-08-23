"use client";

import { usePerformanceMonitor } from "./usePerformanceMonitor";

export function PerformanceMonitor() {
  const { isOpen, toggle } = usePerformanceMonitor();

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div className="flex flex-col gap-2">
        <button
          onClick={toggle}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white"
        >
          Close Monitor
        </button>
        <div className="min-w-[250px] rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Performance Monitor
            </h3>
            <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Live
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-48 rounded p-2 dark:bg-gray-700">
              <div className="mb-1 flex justify-between text-xs">
                <span>Memory Usage</span>
                <span>47.68MB / 4,095.75MB</span>
              </div>
              <div className="relative h-full overflow-hidden rounded bg-gray-600 dark:bg-gray-600">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-green-500"
                  style={{ width: "20%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
