// Types for deployment system

export type DeploymentPlatform = "vercel" | "netlify" | "github-pages";

export interface DeploymentCredentials {
  platform: DeploymentPlatform;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string[];
  installationId?: string;
}

export interface DeploymentConfig {
  platform: DeploymentPlatform;
  project: {
    name: string;
    description?: string;
    repository?: string;
    branch?: string;
    framework: "nextjs";
  };
  settings: {
    buildCommand: string;
    outputDirectory: string;
    installCommand: string;
    publishDirectory?: string;
    environmentVariables?: Record<string, string>;
  };
  customDomain?: string;
}

export interface DeploymentStatus {
  id: string;
  status:
    | "pending"
    | "building"
    | "deploying"
    | "success"
    | "failed"
    | "cancelled";
  url?: string;
  logUrl?: string;
  progress?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface DeploymentHistory {
  id: string;
  config: DeploymentConfig;
  status: DeploymentStatus;
  triggeredBy: "user" | "auto";
  artifactVersion?: string;
}

export interface DeploymentProvider {
  platform: DeploymentPlatform;
  authenticate(credentials: DeploymentCredentials): Promise<boolean>;
  deploy(config: DeploymentConfig): Promise<DeploymentStatus>;
  getStatus(deploymentId: string): Promise<DeploymentStatus>;
  getHistory(): Promise<DeploymentHistory[]>;
  cancel(deploymentId: string): Promise<boolean>;
  getInstallUrl?: () => Promise<string>;
}

export interface DeploymentFormState {
  selectedPlatform: DeploymentPlatform | null;
  config: Partial<DeploymentConfig>;
  credentials: DeploymentCredentials;
  isAuthenticating: boolean;
  isDeploying: boolean;
  deploymentHistory: DeploymentHistory[];
  currentDeploymentStatus: DeploymentStatus | null;
}

export interface DeploymentEvents {
  onAuthComplete: (
    platform: DeploymentPlatform,
    credentials: DeploymentCredentials,
  ) => void;
  onDeploymentStart: (config: DeploymentConfig) => void;
  onDeploymentUpdate: (status: DeploymentStatus) => void;
  onDeploymentComplete: (result: DeploymentStatus) => void;
  onDeploymentError: (error: Error) => void;
}
