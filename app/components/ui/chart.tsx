"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: Record<string, {
      label?: React.ReactNode;
      icon?: React.ComponentType;
    } & (
      | { color?: string; theme?: never }
      | { color?: never; theme: Record<string, string> }
    )>;
  }
>(({ className, children, config: _config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("aspect-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

// For Recharts compatibility, we'll use the Recharts Tooltip directly
const ChartTooltip = ({ _cursor, _content, ..._props }: any) => {
  // This is just a wrapper that passes props through to Recharts Tooltip
  return null; // Recharts will handle the actual rendering
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean;
    payload?: any[];
    label?: string;
    labelKey?: string;
    nameKey?: string;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    labelFormatter?: (label: any, payload: any[]) => React.ReactNode;
    labelClassName?: string;
    formatter?: (value: any, name: any, item: any, index: number) => React.ReactNode;
  }
>(({ 
    className,
    active,
    payload,
    label,
    hideLabel = false,
    hideIndicator = false,
    indicator = "dot",
    labelFormatter,
    labelClassName,
    formatter,
    children,
    ...props 
  }, ref) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-2 rounded-lg border bg-background p-2 shadow-md",
        className
      )}
      {...props}
    >
      {!hideLabel && label && (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      )}
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          {!hideIndicator && (
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                indicator === "dot" && "bg-current",
                indicator === "line" && "h-0.5 w-4 rounded-none",
                indicator === "dashed" && "h-0.5 w-4 rounded-none border-t-2 border-dashed"
              )}
              style={{ color: item.color }}
            />
          )}
          <div className="grid gap-1">
            <div className="text-sm font-medium">
              {formatter ? formatter(item.value, item.name, item, index) : item.value}
            </div>
            {item.name && (
              <div className="text-xs text-muted-foreground">{item.name}</div>
            )}
          </div>
        </div>
      ))}
      {children}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
};
