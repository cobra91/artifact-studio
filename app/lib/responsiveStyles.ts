import { ComponentStyles, ResponsiveStyles } from "../types/artifact";

// Default responsive styles for different breakpoints
export const defaultResponsiveStyles: Record<string, ComponentStyles> = {
  base: {
    fontSize: "14px",
    padding: "8px",
    margin: "4px",
    width: "100%",
    display: "block",
  },
  sm: {
    fontSize: "16px",
    padding: "12px",
    margin: "8px",
    width: "auto",
    display: "block",
  },
  md: {
    fontSize: "18px",
    padding: "16px",
    margin: "12px",
    width: "auto",
    display: "flex",
  },
  lg: {
    fontSize: "20px",
    padding: "20px",
    margin: "16px",
    width: "auto",
    display: "flex",
  },
};

// Component-specific responsive styles
export const componentResponsiveStyles: Record<
  string,
  Record<string, ComponentStyles>
> = {
  text: {
    base: {
      fontSize: "14px",
      lineHeight: "1.4",
      textAlign: "left",
    },
    sm: {
      fontSize: "16px",
      lineHeight: "1.5",
    },
    md: {
      fontSize: "18px",
      lineHeight: "1.6",
    },
    lg: {
      fontSize: "20px",
      lineHeight: "1.7",
    },
  },
  button: {
    base: {
      fontSize: "14px",
      padding: "8px 16px",
      width: "100%",
    },
    sm: {
      fontSize: "16px",
      padding: "10px 20px",
      width: "auto",
    },
    md: {
      fontSize: "18px",
      padding: "12px 24px",
    },
    lg: {
      fontSize: "20px",
      padding: "14px 28px",
    },
  },
  input: {
    base: {
      fontSize: "14px",
      padding: "8px 12px",
      width: "100%",
    },
    sm: {
      fontSize: "16px",
      padding: "10px 14px",
      width: "auto",
    },
    md: {
      fontSize: "18px",
      padding: "12px 16px",
    },
    lg: {
      fontSize: "20px",
      padding: "14px 18px",
    },
  },
  container: {
    base: {
      padding: "8px",
      margin: "4px",
      width: "100%",
    },
    sm: {
      padding: "12px",
      margin: "8px",
    },
    md: {
      padding: "16px",
      margin: "12px",
    },
    lg: {
      padding: "20px",
      margin: "16px",
    },
  },
};

// Utility functions for responsive styles
export const getResponsiveStyle = (
  baseStyles: ComponentStyles,
  responsiveStyles: Record<string, ComponentStyles> | undefined,
  breakpoint: string,
): ComponentStyles => {
  if (!responsiveStyles || !responsiveStyles[breakpoint]) {
    return baseStyles;
  }

  return {
    ...baseStyles,
    ...responsiveStyles[breakpoint],
  };
};

export const generateResponsiveStyles = (
  componentType: string,
): Record<string, ComponentStyles> => {
  const componentStyles = componentResponsiveStyles[componentType];
  if (!componentStyles) {
    return defaultResponsiveStyles;
  }

  return {
    ...defaultResponsiveStyles,
    ...componentStyles,
  };
};

export const applyResponsiveOverrides = (
  baseStyles: ComponentStyles,
  responsiveStyles: Record<string, ComponentStyles> | ResponsiveStyles | undefined,
  breakpoint: string,
): ComponentStyles => {
  if (breakpoint === "base" || !responsiveStyles) {
    return baseStyles;
  }

  // Handle both Record<string, ComponentStyles> and ResponsiveStyles
  const breakpointStyles = 'base' in responsiveStyles 
    ? responsiveStyles[breakpoint as keyof ResponsiveStyles]
    : (responsiveStyles as Record<string, ComponentStyles>)[breakpoint];

  if (!breakpointStyles) {
    return baseStyles;
  }

  return {
    ...baseStyles,
    ...breakpointStyles,
  };
};

// Breakpoint information
export const breakpointInfo = {
  base: { min: 0, max: 639, label: "Mobile", width: "100%" },
  sm: { min: 640, max: 767, label: "Small", width: "640px" },
  md: { min: 768, max: 1023, label: "Medium", width: "768px" },
  lg: { min: 1024, max: Infinity, label: "Large", width: "1024px" },
};

// CSS Media queries for each breakpoint
export const mediaQueries = {
  sm: "@media (min-width: 640px)",
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
};

// Generate CSS for responsive styles
export const generateResponsiveCSS = (
  componentId: string,
  responsiveStyles: Record<string, ComponentStyles>,
): string => {
  let css = `#${componentId} {\n`;

  // Base styles
  if (responsiveStyles.base) {
    Object.entries(responsiveStyles.base).forEach(([property, value]) => {
      css += `  ${property}: ${value};\n`;
    });
  }

  css += "}\n\n";

  // Responsive overrides
  Object.entries(responsiveStyles).forEach(([breakpoint, styles]) => {
    if (breakpoint !== "base" && Object.keys(styles).length > 0) {
      css += `${mediaQueries[breakpoint as keyof typeof mediaQueries]} {\n`;
      css += `  #${componentId} {\n`;
      Object.entries(styles).forEach(([property, value]) => {
        css += `    ${property}: ${value};\n`;
      });
      css += `  }\n`;
      css += "}\n\n";
    }
  });

  return css;
};
