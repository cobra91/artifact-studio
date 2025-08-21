import {
  DeploymentConfig,
  DeploymentCredentials,
  DeploymentHistory,
  DeploymentStatus,
} from "@/types/deployment";

import { BaseDeploymentProvider, deploymentManager } from "./providers";

export class NetlifyDeploymentProvider extends BaseDeploymentProvider {
  platform = "netlify" as const;

  async authenticate(credentials: DeploymentCredentials): Promise<boolean> {
    if (!credentials.accessToken) {
      return false;
    }

    try {
      await this.mockValidateToken(credentials.accessToken);
      return true;
    } catch (error) {
      console.error("Netlify authentication failed:", error);
      return false;
    }
  }

  async deploy(config: DeploymentConfig): Promise<DeploymentStatus> {
    if (!config.settings.environmentVariables?.["NETLIFY_AUTH_TOKEN"]) {
      throw new Error("Netlify auth token is required for deployment");
    }

    const deploymentId = this.generateDeploymentId();

    try {
      const status = await this.simulateDeploymentProgress(
        deploymentId,
        (status) => {
          console.log("Deployment update:", status);
        },
        (progress) => {
          console.log("Deployment progress:", progress + "%");
        },
      );

      return {
        ...status,
        url: `https://${config.project.name.toLowerCase().replace(/\s+/g, "-")}-netlify.app`,
        logUrl: `https://app.netlify.com/sites/${config.project.name.toLowerCase().replace(/\s+/g, "-")}/deploys`,
      };
    } catch (error) {
      return this.createStatus(
        "failed",
        deploymentId,
        undefined,
        error instanceof Error ? error.message : "Deployment failed",
      );
    }
  }

  async getStatus(deploymentId: string): Promise<DeploymentStatus> {
    return this.createStatus("pending", deploymentId);
  }

  async getHistory(): Promise<DeploymentHistory[]> {
    return [];
  }

  async cancel(deploymentId: string): Promise<boolean> {
    console.log("Cancelling Netlify deployment:", deploymentId);
    return true;
  }

  async getInstallUrl(): Promise<string> {
    const clientId = process.env.NETLIFY_CLIENT_ID || "mock-client-id";
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/netlify/callback`;
    const scope = "site:write deploy:write";

    return `https://app.netlify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${Date.now()}`;
  }

  private async mockValidateToken(token: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!token || token.length < 10) {
      throw new Error("Invalid token");
    }
  }
}

// Register the provider
const netlifyProvider = new NetlifyDeploymentProvider();
deploymentManager.registerProvider("netlify", netlifyProvider);
