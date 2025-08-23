# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Visual Artifact Studio is an AI-powered visual builder that transforms natural language into interactive React components. It combines drag-and-drop visual design with AI code generation, similar to "Figma meets CodeSandbox meets AI."

### Key Capabilities
- **Visual Canvas**: Drag-and-drop component creation with real-time positioning
- **AI Generation**: Natural language to React component transformation
- **Live Preview**: Hot reload with instant visual feedback and code export
- **Component Library**: Pre-built templates and reusable components
- **Multi-Framework Support**: React (primary), Vue, and Svelte generation
- **Responsive Design**: Built-in responsive styling system

## Development Commands

### Core Development
```bash
# Start development server with turbopack and debugging enabled
pnpm dev

# Build production version
pnpm build

# Start production server
pnpm start
```

### Code Quality & Testing
```bash
# Format code and auto-fix linting issues
pnpm format

# Run ESLint
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Strict linting with all rules
pnpm lint:strict

# Run test suite
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate test coverage report
pnpm test:coverage

# Run performance benchmarks
pnpm test -- --testPathPattern=performanceBenchmarks
```

### Single Test Execution
```bash
# Run specific test file
pnpm test -- ArtifactBuilder.test.tsx

# Run performance benchmarks only
pnpm test -- --testPathPattern=performanceBenchmarks

# Run tests matching pattern
pnpm test -- --testPathPattern=canvas

# Run tests with verbose output
pnpm test -- --verbose
```

## Architecture Overview

### Core Components Architecture

The application follows a modular component architecture with clear separation of concerns:

```
ArtifactBuilder (Main Container)
├── VisualCanvas (Drag & Drop Interface)
│   ├── ComponentRenderer (Dynamic component rendering)
│   ├── SelectionBox (Multi-component selection)
│   └── ResizeHandles (Component resizing)
├── AIPromptPanel (Natural language input)
├── ComponentLibrary (Pre-built component palette)
├── StylePanel (Visual property editor)
│   └── AppearanceTab (Responsive styling controls)
├── LivePreview (Code generation & preview)
└── Various Feature Panels (Responsive, Analytics, etc.)
```

### State Management

- **Primary Store**: Zustand-based `canvasStore` with persistence
- **Component State**: React hooks for UI state management
- **Performance Monitoring**: Real-time metrics tracking via `PerformanceMonitor`

### AI Integration

The AI system uses a flexible provider architecture:

```typescript
// Primary AI flow
AIGenerationRequest → aiCodeGen.ts → Component Tree → React Code
```

- **OpenAI Integration**: GPT-4 for component generation via structured prompts
- **Multi-Provider Support**: OpenRouter, custom AI/ML providers
- **Structured Output**: JSON schema for consistent component tree generation

### Component System

Components are defined by the `ComponentNode` interface with:
- **Type System**: Strongly-typed component types (container, text, button, input, image, chart, custom)
- **Responsive Styles**: Breakpoint-based styling (base, sm, md, lg)
- **Metadata Tracking**: Version control, authoring, and timestamps
- **Validation System**: Comprehensive prop and component validation

### Performance Architecture

The application includes a sophisticated performance monitoring system:

- **Real-time Monitoring**: `PerformanceMonitor` class for live metrics
- **Benchmark Suite**: Automated performance testing for all major operations
- **Memory Leak Detection**: Continuous memory usage tracking
- **Performance Thresholds**: Configurable limits for regression detection

Key performance scenarios monitored:
- Component rendering (1000+ components in < 5s)
- Canvas interactions (drag/resize in < 50ms avg)
- AI generation (< 30s for complex prompts)
- Memory usage (< 100MB peak)

### Template System

- **Template Management**: `templateManagement.ts` handles creation, validation, and persistence
- **Template Storage**: Local storage with export/import capabilities
- **Community Features**: Rating, reviews, and marketplace functionality
- **Multi-Framework**: Templates support React, Vue, and Svelte generation

## Key File Locations

### Core Architecture
- `app/types/artifact.ts` - Core type definitions and interfaces
- `app/lib/canvasStore.ts` - Central state management
- `app/components/ArtifactBuilder.tsx` - Main application container

### AI & Generation
- `app/lib/aiCodeGen.ts` - AI-powered component generation
- `app/lib/aiProvider.ts` - Multi-provider AI integration
- `app/lib/templates.ts` - Template system and code generation

### Performance & Utilities
- `app/lib/performanceUtils.ts` - Performance monitoring and benchmarking
- `app/lib/componentOperations.ts` - Component CRUD operations
- `app/lib/validationUtils.ts` - Data validation utilities

### Visual Components
- `app/components/VisualCanvas/` - Main canvas implementation
- `app/components/StylePanel/` - Property editing interface
- `app/components/ui/` - Reusable UI components (shadcn/ui based)

### Testing
- `app/__tests__/` - Comprehensive test suite including performance benchmarks
- `jest.config.js` - Jest configuration with custom paths

## Development Guidelines

### Component Creation Workflow
1. Define component type in `artifact.ts` type definitions
2. Implement rendering logic in `ComponentRenderer.tsx`
3. Add styling controls in `StylePanel`
4. Create AI generation prompts in `aiCodeGen.ts`
5. Add performance benchmarks if needed

### AI Prompt Engineering
The system uses structured prompts that generate JSON with:
- `components` array defining structure
- `layout` object with styles and hierarchy
- `componentDetails` object with props and content

### Performance Considerations
- All major operations should have performance benchmarks
- Memory usage is monitored continuously
- Component rendering is optimized for 1000+ components
- Canvas interactions target sub-50ms response times

### Responsive Design Implementation
Components support responsive styles with breakpoints:
- `base` (mobile-first)
- `sm` (≥640px)  
- `md` (≥768px)
- `lg` (≥1024px)

### Testing Strategy
- Unit tests for all utility functions
- Integration tests for component workflows
- Performance benchmarks for critical operations
- Jest with jsdom environment for React component testing

## Technology Stack

- **Framework**: Next.js 15.4.7 with App Router
- **UI Library**: React 19.1.0 with TypeScript 5.x
- **Styling**: Tailwind CSS 4.x with responsive design system
- **State Management**: Zustand with persistence middleware
- **Component Library**: Radix UI primitives with shadcn/ui
- **Drag & Drop**: react-dnd with HTML5 backend
- **AI Integration**: OpenAI API with structured JSON responses
- **Testing**: Jest with React Testing Library and performance benchmarks
- **Code Quality**: ESLint + Prettier with import sorting

The codebase emphasizes performance, type safety, and developer experience with comprehensive tooling for both development and production use.
