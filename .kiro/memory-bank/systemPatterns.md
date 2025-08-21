# Visual Artifact Studio - System Patterns

## Architecture Overview

### Core Design Patterns

1. **Server Components First**: Maximize use of React Server Components for performance
2. **Composition Over Inheritance**: Reuse through composition and hooks
3. **Unidirectional Data Flow**: Clear data flow from server → state → UI
4. **Error Boundaries**: Graceful error handling at strategic levels

### Component Patterns

```
ArtifactBuilder (Main Container)
├── VisualCanvas (Drag & Drop)
├── ComponentLibrary (Template Palette)
├── StylePanel (Property Editor)
├── AIPromptPanel (AI Generation)
├── LivePreview (Code Output)
└── DeploymentPanel (New Integration)
```

### State Management Patterns

- **Local State**: useState for component-specific state
- **Global State**: Zustand patterns for cross-component data
- **Server State**: React Server Components for data fetching
- **Persistent Storage**: localStorage + IndexedDB for user preferences

### Data Flow Patterns

```
User Action → Local State → Server Action → API → Update Store → Re-render
```

### File Organization Patterns

```
app/
├── components/          # UI Components
│   ├── [Feature]/       # Feature-specific subfolders
│   ├── ui/             # Reusable UI elements
│   └── *.tsx           # Top-level components
├── lib/                # Utilities & Services
│   ├── [Domain]/       # Domain-specific logic
│   ├── *.ts            # Core utilities
│   └── hooks/          # Custom React hooks
├── types/              # TypeScript definitions
├── api/                # API routes
└── page.tsx           # Entry points
```

## Deployment Integration Patterns

### Provider Pattern

Create abstract deployment provider interface:

```typescript
interface DeploymentProvider {
  authenticate(credentials: DeploymentCredentials): Promise<void>;
  deploy(config: DeploymentConfig): Promise<DeploymentResult>;
  getStatus(deploymentId: string): Promise<DeploymentStatus>;
  cancel(deploymentId: string): Promise<void>;
  getHistory(): Promise<DeploymentHistory[]>;
}
```

### OAuth Flow Pattern

Implement consistent OAuth authentication:

1. Initiate OAuth flow with platform
2. Handle callback and exchange code for tokens
3. Store credentials securely
4. Refresh tokens when expired
5. Handle revocation gracefully

### Error Handling Pattern

```typescript
try {
  const result = await provider.deploy(config);
  return { success: true, data: result };
} catch (error) {
  if (error.isRetryable) {
    // Retry logic
  } else {
    // User-facing error
  }
}
```

### Loading State Pattern

```typescript
// Component level
const [deployments, setDeployments] = useState<Deployment[]>([]);
const [isLoading, setIsLoading] = useState(false);

// Server action level
("use server");
export async function deployProject() {
  "use server";
  // Handle deployment logic
}
```

## Performance Optimization Patterns

### Code Splitting

- Dynamic imports for heavy components
- Route-based splitting
- Feature-based loading

### Caching Strategy

- Server component data caching
- API response caching
- Client-side state optimization
- Deployment history caching

### Rendering Optimization

- React.memo for expensive components
- useMemo for complex calculations
- useCallback for stable references
- Virtual scrolling for lists

## Security Patterns

### Credential Management

- Encrypt sensitive data at rest
- Use secure HTTP-only cookies
- Implement proper CORS policies
- Rate limit API endpoints

### Authentication Flows

- Platform-specific OAuth implementations
- Token refresh mechanisms
- Session management
- Secure storage practices

### Input Validation

- TypeScript strict mode
- Runtime validation with Zod
- Sanitize user inputs
- Validate API responses

## Testing Patterns

### Component Testing

- React Testing Library for interaction tests
- Mock external dependencies
- Test error scenarios
- Accessibility testing

### Integration Testing

- Test deployment flows end-to-end
- Mock API responses
- Test authentication flows
- Verify error handling

### E2E Testing

- Playwright for user journey tests
- Test deployment workflows
- Verify UI responsiveness
- Test cross-platform compatibility
