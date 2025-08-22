import {
  DeploymentConfig,
  DeploymentCredentials,
  DeploymentHistory,
  DeploymentStatus,
} from "@/types/deployment";

import { BaseDeploymentProvider, deploymentManager } from "./providers";

export class GitHubPagesDeploymentProvider extends BaseDeploymentProvider {
  platform = "github-pages" as const;

  async authenticate(credentials: DeploymentCredentials): Promise<boolean> {
    // GitHub Pages uses personal access tokens
    if (!credentials.accessToken) {
      return false;
    }

    try {
      await this.mockValidateToken(credentials.accessToken);
      return true;
    } catch (error) {
      console.error("GitHub Pages authentication failed:", error);
      return false;
    }
  }

  async deploy(config: DeploymentConfig): Promise<DeploymentStatus> {
    if (
      !config.project.repository ||
      !config.settings.environmentVariables?.["GITHUB_TOKEN"]
    ) {
      throw new Error(
        "GitHub repository and token are required for GitHub Pages deployment"
      );
    }

    const deploymentId = this.generateDeploymentId();

    try {
      const status = await this.simulateDeploymentProgress(
        deploymentId,
        status => {
          console.log("Deployment update:", status);
        },
        progress => {
          console.log("Deployment progress:", progress + "%");
        }
      );

      // Generate GitHub Pages URL
      const [owner, repo] = config.project.repository.split("/");
      const url = `https://${owner.toLowerCase()}.github.io/${repo.toLowerCase()}`;

      return {
        ...status,
        url,
        logUrl: `https://github.com/${owner}/${repo}/actions`,
      };
    } catch (error) {
      return this.createStatus(
        "failed",
        deploymentId,
        undefined,
        error instanceof Error ? error.message : "Deployment failed"
      );
    }
  }

  async getStatus(deploymentId: string): Promise<DeploymentStatus> {
    return this.createStatus("pending", deploymentId);
  }

  async getHistory(): Promise<DeploymentHistory[]> {
    return [];
  }

  async cancel(_deploymentId: string): Promise<boolean> {
    console.log("GitHub Pages deployments cannot be cancelled once started");
    return false;
  }

  override async getInstallUrl(): Promise<string> {
    // GitHub uses personal access tokens directly for GitHub Pages
    // No OAuth flow needed for basic deployment
    const scopes = ["repo", "pages"];
    return `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID || "mock-client-id"}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")}/api/auth/github/callback&scope=${encodeURIComponent(scopes.join(" "))}&state=${Date.now()}`;
  }

  private async mockValidateToken(token: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!token || token.length < 10) {
      throw new Error("Invalid GitHub token");
    }

    // Validate token format (GitHub personal access token starts with 'ghp_')
    if (!token.startsWith("ghp_")) {
      throw new Error("Invalid GitHub token format");
    }
  }

  // Helper method to validate repository format
  private validateRepositoryFormat(repository: string): boolean {
    // Should be in format: owner/repo
    const parts = repository.split("/");
    return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  }

  // Helper method to get GitHub Pages URL
  private getGitHubPagesUrl(repository: string, customDomain?: string): string {
    if (customDomain) {
      return `https://${customDomain}`;
    }

    const [owner, repo] = repository.split("/");
    return `https://${owner.toLowerCase()}.github.io/${repo.toLowerCase()}`;
  }
}

// Register the provider
const githubPagesProvider = new GitHubPagesDeploymentProvider();
deploymentManager.registerProvider("github-pages", githubPagesProvider);
