import { GitHubPagesDeploymentProvider } from "./github-pages";
import { NetlifyDeploymentProvider } from "./netlify";
import { deploymentManager } from "./providers";
import { VercelDeploymentProvider } from "./vercel";

// Initialize all deployment providers
export function initializeDeploymentProviders() {
  // Providers are automatically registered when imported
  // This ensures all providers are available when the system starts

  if (typeof window !== "undefined") {
    // Client-side initialization
    console.log(
      "Deployment providers initialized:",
      deploymentManager.getAvailablePlatforms()
    );
  }
}

// Get available platforms for UI rendering
export function getDeploymentPlatforms() {
  return deploymentManager.getAvailablePlatforms();
}

// Helper function to check if a platform is authenticated
export async function isPlatformAuthenticated(
  _platform: string
): Promise<boolean> {
  try {
    // In a real implementation, this would check stored credentials
    return false; // Always require authentication for now
  } catch (error) {
    console.error("Error checking platform authentication:", error);
    return false;
  }
}

// Export for convenience
export { deploymentManager };

// Export individual providers for advanced use cases
export {
  GitHubPagesDeploymentProvider,
  NetlifyDeploymentProvider,
  VercelDeploymentProvider,
};
