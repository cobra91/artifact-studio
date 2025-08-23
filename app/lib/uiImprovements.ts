// Advanced UI improvements and enhancements system
import { Artifact, ComponentNode } from "../types/artifact";
import { generateAccessibilityReport, generateResponsiveReport } from "./uiEnhancer";

export interface ComponentLibraryEntry {
  id: string;
  name: string;
  category: 'layout' | 'input' | 'display' | 'navigation' | 'feedback' | 'overlay';
  description: string;
  props: ComponentProp[];
  variants: ComponentVariant[];
  accessibility: AccessibilityFeatures;
  responsive: boolean;
  usage: string;
  examples: ComponentExample[];
}

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'function' | 'array';
  required: boolean;
  default?: any;
  description: string;
  validation?: string;
}

export interface ComponentVariant {
  name: string;
  description: string;
  props: Record<string, any>;
  preview?: string;
}

export interface AccessibilityFeatures {
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
  focusManagement: boolean;
  ariaLabels: boolean;
  wcagCompliance: 'AA' | 'AAA' | 'partial';
}

export interface ComponentExample {
  title: string;
  description: string;
  code: string;
  preview?: string;
}

export interface ThemeConfiguration {
  colors: ColorPalette;
  typography: Typography;
  spacing: SpacingScale;
  borders: BorderSystem;
  shadows: ShadowSystem;
  animations: AnimationSystem;
  breakpoints: BreakpointSystem;
  accessibility: AccessibilityTheme;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  tertiary: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
  surface: SurfaceColors;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

export interface SurfaceColors {
  background: string;
  foreground: string;
  card: string;
  popover: string;
  modal: string;
  overlay: string;
}

export interface Typography {
  families: FontFamilies;
  sizes: FontSizes;
  weights: FontWeights;
  lineHeights: LineHeights;
  letterSpacing: LetterSpacing;
}

export interface FontFamilies {
  sans: string[];
  serif: string[];
  mono: string[];
  display: string[];
}

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface FontWeights {
  thin: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
}

export interface LineHeights {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface SpacingScale {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

export interface BorderSystem {
  widths: Record<string, string>;
  styles: Record<string, string>;
  radius: Record<string, string>;
}

export interface ShadowSystem {
  sm: string;
  default: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface AnimationSystem {
  durations: Record<string, string>;
  easings: Record<string, string>;
  keyframes: Record<string, string>;
}

export interface BreakpointSystem {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface AccessibilityTheme {
  focusRing: {
    width: string;
    color: string;
    style: string;
  };
  highContrast: {
    enabled: boolean;
    colors: Partial<ColorPalette>;
  };
  reducedMotion: {
    enabled: boolean;
    alternatives: Record<string, string>;
  };
}

export interface DesignSystemMetrics {
  consistency: number;
  accessibility: number;
  performance: number;
  maintainability: number;
  usability: number;
  overall: number;
}

export interface UIImprovementSuggestion {
  id: string;
  type: 'accessibility' | 'performance' | 'consistency' | 'usability' | 'responsive';
  priority: 'critical' | 'high' | 'medium' | 'low';
  component: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string;
  before?: string;
  after?: string;
}

export class UIImprovements {
  private componentLibrary: Map<string, ComponentLibraryEntry> = new Map();
  private theme: ThemeConfiguration;
  private improvementHistory: UIImprovementSuggestion[] = [];

  constructor() {
    this.theme = this.createDefaultTheme();
    this.initializeComponentLibrary();
  }

  // Component Library Management
  private initializeComponentLibrary(): void {
    const components: ComponentLibraryEntry[] = [
      {
        id: 'button',
        name: 'Button',
        category: 'input',
        description: 'A versatile button component with multiple variants and states',
        props: [
          {
            name: 'variant',
            type: 'string',
            required: false,
            default: 'primary',
            description: 'Visual style variant of the button',
            validation: 'primary | secondary | tertiary | ghost | danger',
          },
          {
            name: 'size',
            type: 'string',
            required: false,
            default: 'medium',
            description: 'Size of the button',
            validation: 'small | medium | large',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            default: false,
            description: 'Whether the button is disabled',
          },
          {
            name: 'loading',
            type: 'boolean',
            required: false,
            default: false,
            description: 'Shows loading state with spinner',
          },
          {
            name: 'icon',
            type: 'string',
            required: false,
            description: 'Icon to display in the button',
          },
          {
            name: 'onClick',
            type: 'function',
            required: false,
            description: 'Click event handler',
          },
        ],
        variants: [
          {
            name: 'Primary',
            description: 'Main action button with prominent styling',
            props: { variant: 'primary', size: 'medium' },
          },
          {
            name: 'Secondary',
            description: 'Secondary action button with subtle styling',
            props: { variant: 'secondary', size: 'medium' },
          },
          {
            name: 'Danger',
            description: 'Destructive action button with warning styling',
            props: { variant: 'danger', size: 'medium' },
          },
          {
            name: 'Ghost',
            description: 'Minimal button with no background',
            props: { variant: 'ghost', size: 'medium' },
          },
        ],
        accessibility: {
          keyboardNavigation: true,
          screenReaderSupport: true,
          highContrast: true,
          focusManagement: true,
          ariaLabels: true,
          wcagCompliance: 'AA',
        },
        responsive: true,
        usage: 'Use for primary and secondary actions throughout the application. Choose variants based on action hierarchy.',
        examples: [
          {
            title: 'Basic Usage',
            description: 'Simple button with text',
            code: '<Button>Click me</Button>',
          },
          {
            title: 'With Icon',
            description: 'Button with icon and text',
            code: '<Button icon="plus">Add Item</Button>',
          },
          {
            title: 'Loading State',
            description: 'Button in loading state',
            code: '<Button loading>Saving...</Button>',
          },
        ],
      },
      {
        id: 'input',
        name: 'Input',
        category: 'input',
        description: 'Text input field with validation and various states',
        props: [
          {
            name: 'type',
            type: 'string',
            required: false,
            default: 'text',
            description: 'Input type',
            validation: 'text | email | password | number | tel | url',
          },
          {
            name: 'placeholder',
            type: 'string',
            required: false,
            description: 'Placeholder text',
          },
          {
            name: 'label',
            type: 'string',
            required: false,
            description: 'Input label',
          },
          {
            name: 'error',
            type: 'string',
            required: false,
            description: 'Error message to display',
          },
          {
            name: 'disabled',
            type: 'boolean',
            required: false,
            default: false,
            description: 'Whether the input is disabled',
          },
          {
            name: 'required',
            type: 'boolean',
            required: false,
            default: false,
            description: 'Whether the input is required',
          },
        ],
        variants: [
          {
            name: 'Default',
            description: 'Standard text input',
            props: { type: 'text' },
          },
          {
            name: 'Email',
            description: 'Email input with validation',
            props: { type: 'email' },
          },
          {
            name: 'Password',
            description: 'Password input with visibility toggle',
            props: { type: 'password' },
          },
        ],
        accessibility: {
          keyboardNavigation: true,
          screenReaderSupport: true,
          highContrast: true,
          focusManagement: true,
          ariaLabels: true,
          wcagCompliance: 'AA',
        },
        responsive: true,
        usage: 'Use for collecting text input from users. Always provide clear labels and helpful error messages.',
        examples: [
          {
            title: 'Basic Input',
            description: 'Simple text input with label',
            code: '<Input label="Name" placeholder="Enter your name" />',
          },
          {
            title: 'With Validation',
            description: 'Input with error state',
            code: '<Input label="Email" type="email" error="Please enter a valid email" />',
          },
        ],
      },
      {
        id: 'card',
        name: 'Card',
        category: 'layout',
        description: 'Container component for grouping related content',
        props: [
          {
            name: 'variant',
            type: 'string',
            required: false,
            default: 'default',
            description: 'Visual style variant',
            validation: 'default | outlined | elevated',
          },
          {
            name: 'padding',
            type: 'string',
            required: false,
            default: 'medium',
            description: 'Internal padding',
            validation: 'none | small | medium | large',
          },
          {
            name: 'clickable',
            type: 'boolean',
            required: false,
            default: false,
            description: 'Whether the card is clickable',
          },
        ],
        variants: [
          {
            name: 'Default',
            description: 'Standard card with subtle background',
            props: { variant: 'default' },
          },
          {
            name: 'Outlined',
            description: 'Card with border and no background',
            props: { variant: 'outlined' },
          },
          {
            name: 'Elevated',
            description: 'Card with shadow for emphasis',
            props: { variant: 'elevated' },
          },
        ],
        accessibility: {
          keyboardNavigation: true,
          screenReaderSupport: true,
          highContrast: true,
          focusManagement: true,
          ariaLabels: false,
          wcagCompliance: 'AA',
        },
        responsive: true,
        usage: 'Use to group related content and create visual hierarchy. Consider clickable variant for interactive cards.',
        examples: [
          {
            title: 'Content Card',
            description: 'Card with text content',
            code: '<Card><h3>Title</h3><p>Content goes here</p></Card>',
          },
          {
            title: 'Clickable Card',
            description: 'Interactive card with hover effects',
            code: '<Card clickable onClick={handleClick}>Interactive content</Card>',
          },
        ],
      },
    ];

    components.forEach(component => {
      this.componentLibrary.set(component.id, component);
    });
  }

  getComponentLibrary(): ComponentLibraryEntry[] {
    return Array.from(this.componentLibrary.values());
  }

  getComponent(id: string): ComponentLibraryEntry | undefined {
    return this.componentLibrary.get(id);
  }

  // Theme Management
  private createDefaultTheme(): ThemeConfiguration {
    return {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        tertiary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        semantic: {
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16',
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          },
          error: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          },
          info: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
        },
        surface: {
          background: '#ffffff',
          foreground: '#09090b',
          card: '#ffffff',
          popover: '#ffffff',
          modal: '#ffffff',
          overlay: 'rgba(0, 0, 0, 0.5)',
        },
      },
      typography: {
        families: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          serif: ['Georgia', 'Times New Roman', 'serif'],
          mono: ['JetBrains Mono', 'Monaco', 'monospace'],
          display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
        },
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem',
        },
        weights: {
          thin: 100,
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800,
        },
        lineHeights: {
          none: 1,
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2,
        },
        letterSpacing: {
          tighter: '-0.05em',
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em',
          wider: '0.05em',
          widest: '0.1em',
        },
      },
      spacing: {
        0: '0px',
        px: '1px',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        2.5: '0.625rem',
        3: '0.75rem',
        3.5: '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        11: '2.75rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
      },
      borders: {
        widths: {
          0: '0px',
          2: '2px',
          4: '4px',
          8: '8px',
          default: '1px',
        },
        styles: {
          solid: 'solid',
          dashed: 'dashed',
          dotted: 'dotted',
          double: 'double',
          none: 'none',
        },
        radius: {
          none: '0px',
          sm: '0.125rem',
          default: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem',
          full: '9999px',
        },
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      animations: {
        durations: {
          fast: '150ms',
          normal: '250ms',
          slow: '350ms',
          slower: '500ms',
        },
        easings: {
          linear: 'linear',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        },
        keyframes: {
          fadeIn: 'fadeIn 0.25s ease-out',
          slideIn: 'slideIn 0.3s ease-out',
          bounce: 'bounce 1s infinite',
          pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      accessibility: {
        focusRing: {
          width: '2px',
          color: '#3b82f6',
          style: 'solid',
        },
        highContrast: {
          enabled: false,
          colors: {},
        },
        reducedMotion: {
          enabled: false,
          alternatives: {},
        },
      },
    };
  }

  getTheme(): ThemeConfiguration {
    return this.theme;
  }

  updateTheme(updates: Partial<ThemeConfiguration>): void {
    this.theme = { ...this.theme, ...updates };
  }

  // Design System Analysis
  analyzeDesignSystem(artifact: Artifact): DesignSystemMetrics {
    const components = artifact.components || [];
    
    // Analyze accessibility
    const accessibilityReport = generateAccessibilityReport(components);
    const accessibilityScore = accessibilityReport.score;

    // Analyze responsive design
    const responsiveReport = generateResponsiveReport(components);
    const responsiveScore = responsiveReport.flexibilityScore;

    // Analyze consistency
    const consistencyScore = this.analyzeConsistency(components);

    // Analyze performance (simplified)
    const performanceScore = this.analyzePerformance(components);

    // Analyze usability
    const usabilityScore = this.analyzeUsability(components);

    // Calculate overall score
    const overall = Math.round(
      (accessibilityScore + responsiveScore + consistencyScore + performanceScore + usabilityScore) / 5
    );

    return {
      consistency: consistencyScore,
      accessibility: accessibilityScore,
      performance: performanceScore,
      maintainability: consistencyScore, // Simplified
      usability: usabilityScore,
      overall,
    };
  }

  private analyzeConsistency(components: ComponentNode[]): number {
    let consistencyScore = 100;
    const styleValues = {
      colors: new Set<string>(),
      fontSizes: new Set<string>(),
      spacing: new Set<string>(),
      borderRadius: new Set<string>(),
    };

    // Collect style values
    components.forEach(component => {
      if (component.styles) {
        const styles = component.styles;
        
        if (styles.color) styleValues.colors.add(styles.color as string);
        if (styles.backgroundColor) styleValues.colors.add(styles.backgroundColor as string);
        if (styles.fontSize) styleValues.fontSizes.add(styles.fontSize as string);
        if (styles.padding) styleValues.spacing.add(styles.padding as string);
        if (styles.margin) styleValues.spacing.add(styles.margin as string);
        if (styles.borderRadius) styleValues.borderRadius.add(styles.borderRadius as string);
      }
    });

    // Check for consistency issues
    if (styleValues.colors.size > 20) consistencyScore -= 15; // Too many colors
    if (styleValues.fontSizes.size > 8) consistencyScore -= 10; // Too many font sizes
    if (styleValues.spacing.size > 15) consistencyScore -= 10; // Too many spacing values
    if (styleValues.borderRadius.size > 6) consistencyScore -= 5; // Too many border radius values

    return Math.max(0, consistencyScore);
  }

  private analyzePerformance(components: ComponentNode[]): number {
    let performanceScore = 100;

    // Check for performance issues
    if (components.length > 50) {
      performanceScore -= 10; // Too many components might impact performance
    }

    // Check for complex nesting
    const maxDepth = this.getMaxComponentDepth(components);
    if (maxDepth > 6) {
      performanceScore -= Math.min(20, (maxDepth - 6) * 3);
    }

    return Math.max(0, performanceScore);
  }

  private analyzeUsability(components: ComponentNode[]): number {
    let usabilityScore = 100;

    // Check for usability issues
    let interactiveComponents = 0;
    let componentsWithLabels = 0;

    components.forEach(component => {
      if (['button', 'input', 'select', 'textarea'].includes(component.type)) {
        interactiveComponents++;
        
        if (component.props?.label || component.props?.['aria-label'] || component.props?.children) {
          componentsWithLabels++;
        }

        // Check button/touch target sizes
        if (component.type === 'button' && component.size.height && component.size.height < 44) {
          usabilityScore -= 5;
        }
      }
    });

    // Calculate label coverage
    if (interactiveComponents > 0) {
      const labelCoverage = (componentsWithLabels / interactiveComponents) * 100;
      if (labelCoverage < 80) {
        usabilityScore -= Math.round((80 - labelCoverage) / 4);
      }
    }

    return Math.max(0, usabilityScore);
  }

  private getMaxComponentDepth(components: ComponentNode[], currentDepth = 0): number {
    let maxDepth = currentDepth;
    
    components.forEach(component => {
      if (component.children && component.children.length > 0) {
        const childDepth = this.getMaxComponentDepth(component.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });
    
    return maxDepth;
  }

  // Improvement Suggestions
  generateImprovementSuggestions(artifact: Artifact): UIImprovementSuggestion[] {
    const suggestions: UIImprovementSuggestion[] = [];
    const components = artifact.components || [];

    // Accessibility suggestions
    const accessibilityReport = generateAccessibilityReport(components);
    accessibilityReport.issues.forEach((issue, index) => {
      suggestions.push({
        id: `accessibility-${index}`,
        type: 'accessibility',
        priority: issue.severity === 'critical' ? 'critical' : 
                 issue.severity === 'high' ? 'high' : 
                 issue.severity === 'medium' ? 'medium' : 'low',
        component: issue.element,
        title: issue.description,
        description: issue.fix,
        impact: `Improves ${issue.type} compliance`,
        effort: issue.severity === 'critical' ? 'high' : 'medium',
        implementation: issue.fix,
      });
    });

    // Responsive design suggestions
    const responsiveReport = generateResponsiveReport(components);
    responsiveReport.issues.forEach((issue, index) => {
      suggestions.push({
        id: `responsive-${index}`,
        type: 'responsive',
        priority: issue.severity === 'critical' ? 'critical' : 
                 issue.severity === 'high' ? 'high' : 
                 issue.severity === 'medium' ? 'medium' : 'low',
        component: issue.component,
        title: issue.issue,
        description: issue.fix,
        impact: 'Improves mobile experience',
        effort: 'medium',
        implementation: issue.fix,
      });
    });

    // Consistency suggestions
    const consistencySuggestions = this.generateConsistencySuggestions(components);
    suggestions.push(...consistencySuggestions);

    // Performance suggestions
    const performanceSuggestions = this.generatePerformanceSuggestions(components);
    suggestions.push(...performanceSuggestions);

    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private generateConsistencySuggestions(components: ComponentNode[]): UIImprovementSuggestion[] {
    const suggestions: UIImprovementSuggestion[] = [];
    
    // Check for inconsistent spacing
    const spacingValues = new Set<string>();
    components.forEach(component => {
      if (component.styles?.padding) spacingValues.add(component.styles.padding as string);
      if (component.styles?.margin) spacingValues.add(component.styles.margin as string);
    });

    if (spacingValues.size > 10) {
      suggestions.push({
        id: 'consistency-spacing',
        type: 'consistency',
        priority: 'medium',
        component: 'multiple',
        title: 'Inconsistent spacing values detected',
        description: 'Multiple spacing values are being used throughout the design',
        impact: 'Improves visual consistency and maintainability',
        effort: 'medium',
        implementation: 'Establish a spacing scale and replace custom values with scale values',
      });
    }

    return suggestions;
  }

  private generatePerformanceSuggestions(components: ComponentNode[]): UIImprovementSuggestion[] {
    const suggestions: UIImprovementSuggestion[] = [];
    
    // Check for deeply nested components
    const maxDepth = this.getMaxComponentDepth(components);
    if (maxDepth > 8) {
      suggestions.push({
        id: 'performance-nesting',
        type: 'performance',
        priority: 'medium',
        component: 'layout',
        title: 'Deep component nesting detected',
        description: 'Components are nested too deeply, which may impact performance',
        impact: 'Improves rendering performance and maintainability',
        effort: 'high',
        implementation: 'Flatten component hierarchy and consider using composition patterns',
      });
    }

    return suggestions;
  }

  // Apply Improvements
  applyImprovement(suggestion: UIImprovementSuggestion, artifact: Artifact): Artifact {
    // This would contain the logic to apply the specific improvement
    // For now, we'll just add it to the history
    this.improvementHistory.push(suggestion);
    
    // Return modified artifact (implementation would depend on the specific improvement)
    return artifact;
  }

  getImprovementHistory(): UIImprovementSuggestion[] {
    return [...this.improvementHistory];
  }

  // Export utilities
  exportThemeAsCSS(): string {
    const theme = this.theme;
    let css = ':root {\n';

    // Colors
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      css += `  --color-primary-${key}: ${value};\n`;
    });

    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      css += `  --color-secondary-${key}: ${value};\n`;
    });

    // Typography
    Object.entries(theme.typography.sizes).forEach(([key, value]) => {
      css += `  --font-size-${key}: ${value};\n`;
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`;
    });

    css += '}\n';
    return css;
  }

  exportThemeAsTailwind(): string {
    const theme = this.theme;
    
    const config = {
      theme: {
        colors: theme.colors,
        fontFamily: theme.typography.families,
        fontSize: theme.typography.sizes,
        fontWeight: theme.typography.weights,
        spacing: theme.spacing,
        borderRadius: theme.borders.radius,
        boxShadow: theme.shadows,
        screens: theme.breakpoints,
      },
    };

    return `module.exports = ${JSON.stringify(config, null, 2)};`;
  }
}

export const uiImprovements = new UIImprovements();
