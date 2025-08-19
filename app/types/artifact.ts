// Core component types
export type ComponentType = 
  | 'container'    // Layout containers
  | 'text'         // Text elements
  | 'button'       // Interactive buttons
  | 'input'        // Form inputs
  | 'image'        // Images and media
  | 'chart'        // Data visualizations
  | 'custom'       // User-defined components

// Enhanced ComponentNode with metadata and validation
export interface ComponentNode {
  id: string
  type: ComponentType
  props: ComponentProps
  children?: ComponentNode[]
  position: { x: number; y: number }
  size: { width: number; height: number }
  styles: ComponentStyles
  metadata?: ComponentMetadata
}

// Type-safe component properties
export interface ComponentProps {
  [key: string]: string | number | boolean | string[] | undefined
  className?: string
  children?: string
  placeholder?: string
  src?: string
  alt?: string
  href?: string
  target?: string
  disabled?: boolean
  required?: boolean
}

// Enhanced styles with responsive support
export interface ComponentStyles {
  [property: string]: string | undefined
  // Layout
  display?: string
  position?: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  width?: string
  height?: string
  margin?: string
  padding?: string
  // Typography
  fontSize?: string
  fontWeight?: string
  fontFamily?: string
  lineHeight?: string
  textAlign?: string
  color?: string
  // Appearance
  backgroundColor?: string
  border?: string
  borderRadius?: string
  boxShadow?: string
  opacity?: string
  // Responsive breakpoints
  '@mobile'?: Partial<ComponentStyles>
  '@tablet'?: Partial<ComponentStyles>
  '@desktop'?: Partial<ComponentStyles>
}

// Component metadata for versioning and tracking
export interface ComponentMetadata {
  version: string
  created: Date
  modified: Date
  author?: string
  description?: string
  tags?: string[]
  locked?: boolean
  hidden?: boolean
}

// Enhanced template system with community features
export interface ArtifactTemplate {
  id: string
  name: string
  description: string
  category: string
  preview: string                      // Base64 or URL
  code: string                        // Generated React code
  components: ComponentNode[]         // Component tree
  tags: string[]                      // Search tags
  rating: number                      // Community rating (0-5)
  downloads: number                   // Usage statistics
  author: string                      // Creator info
  license: string                     // Usage license
  created: Date
  modified: Date
  isPublic: boolean                   // Available in marketplace
  framework: Framework                // Target framework
  styling: StylingApproach           // Styling method
}

export interface AIGenerationRequest {
  prompt: string
  framework: 'react' | 'vue' | 'svelte'
  styling: 'tailwindcss' | 'css' | 'styled-components'
  interactivity: 'low' | 'medium' | 'high'
}

export interface SandboxResult {
  success: boolean
  code: string
  preview: string
  errors?: string[]
}