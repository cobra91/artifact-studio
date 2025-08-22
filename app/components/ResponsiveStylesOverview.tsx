"use client";

import { breakpointInfo } from "../lib/responsiveStyles";
import { ComponentNode } from "../types/artifact";

interface ResponsiveStylesOverviewProps {
  selectedNode: ComponentNode;
}

export const ResponsiveStylesOverview = ({
  selectedNode,
}: ResponsiveStylesOverviewProps) => {
  const breakpoints = ["base", "sm", "md", "lg"] as const;

  return (
    <div className="rounded border bg-gray-50 p-4">
      <h4 className="mb-3 text-sm font-medium text-gray-700">
        Responsive Styles Overview
      </h4>

      <div className="grid grid-cols-2 gap-3">
        {breakpoints.map(breakpoint => {
          const styles = selectedNode.responsiveStyles?.[breakpoint];
          const hasCustomStyles = styles && Object.keys(styles).length > 0;
          const info = breakpointInfo[breakpoint];

          return (
            <div
              key={breakpoint}
              className={`rounded border p-3 text-xs ${
                hasCustomStyles
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-gray-100"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-gray-700">{info.label}</span>
                <span className="text-gray-500">{info.width}</span>
              </div>

              {hasCustomStyles ? (
                <div className="space-y-1">
                  {Object.entries(styles).map(([property, value]) => (
                    <div key={property} className="flex justify-between">
                      <span className="text-gray-600">{property}:</span>
                      <span className="font-mono text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">No custom styles</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 border-t border-gray-200 pt-3">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span>Custom styles applied</span>
          <div className="ml-2 h-2 w-2 rounded-full bg-gray-300"></div>
          <span>Using defaults</span>
        </div>
      </div>
    </div>
  );
};
