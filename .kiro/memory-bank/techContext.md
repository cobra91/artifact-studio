# Visual Artifact Studio - Technical Context

## Technology Stack

### Core Framework

- **Next.js 15.4.7**: React framework with App Router
- **React 19.1.0**: UI library with latest features
- **TypeScript 5.x**: Type safety and developer experience

### Styling & UI

- **Tailwind CSS 4.x**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **TailwindCSS v4**: Latest styling approach

### State Management

- **React Hooks**: useState, useEffect, useCallback
- **Zustand Patterns**: Global state management patterns
- **LiveBlocks**: Real-time collaboration

### Development Tools

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Testing Library**: React Testing Library

### External Integrations

- **OpenAI**: AI-powered component generation
- **LiveBlocks**: Real-time collaboration
- **File-saver**: Export functionality
- **JSZip**: Package generation

## Development Environment

### Scripts

```json
{
  "dev": "set NODE_OPTIONS=--inspect && next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "format": "prettier --write . && next lint --fix"
}
```

### Configuration Files

- `next.config.ts`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `eslint.config.mjs`: ESLint configuration

## Current Architecture

### Project Structure

```
artifact-studio/
├── app/                    # Next.js App Router
│   ├── components/         # React components
│   │   ├── ArtifactBuilder.tsx
│   │   ├── VisualCanvas.tsx
│   │   ├── AIPromptPanel.tsx
│   │   ├── ComponentLibrary.tsx
│   │   ├── StylePanel.tsx
│   │   └── LivePreview.tsx
│   ├── lib/                # Utilities and services
│   │   ├── aiCodeGen.ts
│   │   ├── templates.ts
│   │   ├── canvasStore.ts
│   │   └── storage.ts
│   ├── api/                # API routes
│   ├── types/              # TypeScript definitions
│   └── page.tsx            # Main page
├── public/                 # Static assets
├── components/             # Shared UI components
└── docs/                   # Documentation
```

### Data Flow

1. **Server Components**: Handle data fetching and initial render
2. **Client Components**: Handle interactivity and state management
3. **Server Actions**: Handle form submissions and data mutations
4. **API Routes**: Handle external service integrations

### API Endpoints

- `/api/liveblocks-auth`: Authentication for real-time features
- `/api/deploy/*`: New deployment endpoints (to be implemented)

## New Technology Requirements

### Deployment Platform APIs

- **Vercel API**: For Vercel deployments
- **Netlify API**: For Netlify deployments
- **GitHub API**: For GitHub Pages deployments

### Additional Dependencies Needed

```json
{
  "dependencies": {
    "vercel": "^28.0.0", // Vercel CLI and API client
    "@netlify/next-on-netlify": "^4.0.0", // Netlify integration
    "gh-pages": "^6.0.0", // GitHub Pages deployment
    "zod": "^3.22.0", // Schema validation
    "crypto-js": "^4.2.0" // Encryption for credentials
  }
}
```

### Security Considerations

- **Environment Variables**: Store API keys and secrets
- **OAuth Flows**: Secure authentication with platforms
- **Credential Encryption**: Protect stored credentials
- **CORS**: Proper cross-origin resource sharing

## Performance Optimization

### Current Optimizations

- Next.js Turbopack for fast development
- React Server Components for reduced bundle size
- Dynamic imports for heavy components
- Image optimization with Next.js Image component

### Planned Optimizations

- Code splitting for deployment features
- Lazy loading for platform integrations
- Caching for deployment status
- Optimistic UI for deployment operations

## Testing Strategy

### Current Testing

- Component testing with React Testing Library
- Integration tests for key features
- E2E tests with Playwright (planned)

### Testing for Deployment Features

- Unit tests for deployment providers
- Integration tests for OAuth flows
- Mock tests for API calls
- E2E tests for complete deployment workflows
