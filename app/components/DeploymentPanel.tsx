"use client";

import {
  CheckCircle,
  Clock,
  ExternalLink,
  History as HistoryIcon,
  RefreshCw,
  Rocket,
  Settings,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deploymentManager } from "@/lib/deployment/providers";
import {
  DeploymentConfig,
  DeploymentHistory,
  DeploymentPlatform,
  DeploymentStatus,
} from "@/types/deployment";

export function DeploymentPanel() {
  const [selectedPlatform, setSelectedPlatform] =
    useState<DeploymentPlatform | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentHistory, setDeploymentHistory] = useState<
    DeploymentHistory[]
  >([]);
  const [currentDeploymentStatus, setCurrentDeploymentStatus] =
    useState<DeploymentStatus | null>(null);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [repository, setRepository] = useState("");
  const [branch, setBranch] = useState("main");
  const [customDomain, setCustomDomain] = useState("");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [installCommand, setInstallCommand] = useState("npm install");
  const [outputDirectory, setOutputDirectory] = useState(".next");

  const loadDeploymentHistory = useCallback(async () => {
    if (!selectedPlatform) return;

    try {
      const history =
        await deploymentManager.getDeploymentHistory(selectedPlatform);
      setDeploymentHistory(history);
    } catch (error) {
      console.error("Failed to load deployment history:", error);
    }
  }, [selectedPlatform]);

  useEffect(() => {
    // Load deployment history for selected platform
    if (selectedPlatform) {
      loadDeploymentHistory();
    }
  }, [selectedPlatform, loadDeploymentHistory]);

  const handlePlatformSelect = (platform: DeploymentPlatform) => {
    setSelectedPlatform(platform);
  };

  const handleAuthenticate = async () => {
    if (!selectedPlatform) return;

    setIsAuthenticating(true);
    try {
      const installUrl = await deploymentManager
        .getProvider(selectedPlatform)
        ?.getInstallUrl?.();
      if (installUrl) {
        // In a real implementation, this would open OAuth flow
        window.open(installUrl, "_blank");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedPlatform || !projectName) return;

    setIsDeploying(true);

    try {
      const config: DeploymentConfig = {
        platform: selectedPlatform,
        project: {
          name: projectName,
          description: `Artifact Studio project - ${new Date().toLocaleDateString()}`,
          repository,
          branch,
          framework: "nextjs",
        },
        settings: {
          buildCommand,
          outputDirectory,
          installCommand,
          environmentVariables: {
            NODE_ENV: "production",
          },
        },
        customDomain,
      };

      const status = await deploymentManager.deployToPlatform(
        selectedPlatform,
        config
      );
      setCurrentDeploymentStatus(status);
      await loadDeploymentHistory();
    } catch (error) {
      console.error("Deployment failed:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  const getStatusIcon = (status: DeploymentStatus["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
      case "building":
      case "deploying":
        return <Clock className="h-4 w-4 animate-spin text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: DeploymentStatus["status"]) => {
    switch (status) {
      case "success":
        return "Success";
      case "failed":
        return "Failed";
      case "building":
        return "Building";
      case "deploying":
        return "Deploying";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const availablePlatforms = deploymentManager.getAvailablePlatforms();

  return (
    <div className="h-full space-y-6 overflow-y-auto p-4">
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          Deployments
        </h3>
        <p className="text-sm">Deploy your artifacts to production platforms</p>
      </div>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Choose Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {availablePlatforms.map(platform => (
              <Button
                key={platform}
                variant={selectedPlatform === platform ? "default" : "outline"}
                onClick={() => handlePlatformSelect(platform)}
                className="flex h-20 flex-col items-center gap-2"
              >
                <div className="text-lg font-semibold">
                  {platform.toUpperCase()}
                </div>
              </Button>
            ))}
          </div>

          {selectedPlatform && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm">Connected to {selectedPlatform}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Connect Account"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deployment Configuration */}
      {selectedPlatform && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="my-awesome-project"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="repository">Repository (optional)</Label>
                <Input
                  id="repository"
                  value={repository}
                  onChange={e => setRepository(e.target.value)}
                  placeholder="owner/repo"
                />
              </div>
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="main"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="custom-domain">Custom Domain (optional)</Label>
              <Input
                id="custom-domain"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="example.com"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="build-cmd">Build Command</Label>
                <Input
                  id="build-cmd"
                  value={buildCommand}
                  onChange={e => setBuildCommand(e.target.value)}
                  placeholder="npm run build"
                />
              </div>
              <div>
                <Label htmlFor="install-cmd">Install Command</Label>
                <Input
                  id="install-cmd"
                  value={installCommand}
                  onChange={e => setInstallCommand(e.target.value)}
                  placeholder="npm install"
                />
              </div>
              <div>
                <Label htmlFor="output-dir">Output Directory</Label>
                <Input
                  id="output-dir"
                  value={outputDirectory}
                  onChange={e => setOutputDirectory(e.target.value)}
                  placeholder=".next"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deploy Button */}
      {selectedPlatform && projectName && (
        <Button
          onClick={handleDeploy}
          disabled={isDeploying || !projectName}
          className="w-full"
          size="lg"
        >
          {isDeploying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy Now
            </>
          )}
        </Button>
      )}

      {/* Current Deployment Status */}
      {currentDeploymentStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Deployment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(currentDeploymentStatus.status)}
                <span>
                  {getStatusText(currentDeploymentStatus.status)}
                  {currentDeploymentStatus.progress && (
                    <span className="ml-2 text-gray-500">
                      ({currentDeploymentStatus.progress}%)
                    </span>
                  )}
                </span>
              </div>
              {currentDeploymentStatus.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(currentDeploymentStatus.url, "_blank")
                  }
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  View Site
                </Button>
              )}
            </div>
            {currentDeploymentStatus.error && (
              <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">
                {currentDeploymentStatus.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deployment History */}
      {deploymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Deployment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deploymentHistory.map(deployment => (
                <div
                  key={deployment.id}
                  className="flex items-center justify-between rounded border p-2"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deployment.status.status)}
                    <span className="text-sm">
                      {deployment.config.project.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {deployment.status.createdAt.toLocaleString()}
                    </span>
                    {deployment.status.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(deployment.status.url, "_blank")
                        }
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
