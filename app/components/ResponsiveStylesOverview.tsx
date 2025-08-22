"use client";

import { breakpointInfo } from "../lib/responsiveStyles";
import { ComponentNode } from "../types/artifact";

interface ResponsiveStylesOverviewProps {
  selectedNode: ComponentNode;
}

export const ResponsiveStylesOverview = ({ selectedNode }: ResponsiveStylesOverviewProps) => {
  const breakpoints = ["base", "sm", "md", "lg"] as const;

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Responsive Styles Overview</h4>
      
      <div className="grid grid-cols-2 gap-3">
        {breakpoints.map((breakpoint) => {
          const styles = selectedNode.responsiveStyles?.[breakpoint];
          const hasCustomStyles = styles && Object.keys(styles).length > 0;
          const info = breakpointInfo[breakpoint];
          
          return (
            <div 
              key={breakpoint}
              className={`p-3 rounded border text-xs ${
                hasCustomStyles 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">
                  {info.label}
                </span>
                <span className="text-gray-500">
                  {info.width}
                </span>
              </div>
              
              {hasCustomStyles ? (
                <div className="space-y-1">
                  {Object.entries(styles).map(([property, value]) => (
                    <div key={property} className="flex justify-between">
                      <span className="text-gray-600">{property}:</span>
                      <span className="text-gray-800 font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  No custom styles
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Custom styles applied</span>
          <div className="w-2 h-2 bg-gray-300 rounded-full ml-2"></div>
          <span>Using defaults</span>
        </div>
      </div>
    </div>
  );
};
