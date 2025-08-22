import { NextRequest, NextResponse } from "next/server";

import { getDeploymentPlatforms } from "@/lib/deployment";
import { deploymentManager } from "@/lib/deployment/providers";
import { DeploymentConfig, DeploymentPlatform } from "@/types/deployment";

// GET /api/deploy - Get available platforms and deployment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") as DeploymentPlatform | null;
    const deploymentId = searchParams.get("deploymentId");

    if (platform && deploymentId) {
      // Get specific deployment status
      const status = await deploymentManager.getStatus(platform, deploymentId);
      return NextResponse.json({ status });
    }

    if (platform) {
      // Get deployment history for a platform
      const history = await deploymentManager.getDeploymentHistory(platform);
      return NextResponse.json({ history });
    }

    // Get available platforms
    const platforms = getDeploymentPlatforms();
    return NextResponse.json({ platforms });
  } catch (error) {
    console.error("Error in GET /api/deploy:", error);
    return NextResponse.json(
      { error: "Failed to fetch deployment information" },
      { status: 500 },
    );
  }
}

// POST /api/deploy - Trigger deployment
export async function POST(request: NextRequest) {
  try {
    const {
      platform,
      config,
    }: { platform: DeploymentPlatform; config: DeploymentConfig } =
      await request.json();

    if (!platform || !config) {
      return NextResponse.json(
        { error: "Platform and configuration are required" },
        { status: 400 },
      );
    }

    // Validate platform availability
    const availablePlatforms = getDeploymentPlatforms();
    if (!availablePlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `Platform ${platform} is not supported` },
        { status: 400 },
      );
    }

    // Trigger deployment
    const status = await deploymentManager.deployToPlatform(platform, config);

    return NextResponse.json({
      success: true,
      deployment: status,
    });
  } catch (error) {
    console.error("Error in POST /api/deploy:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deployment failed" },
      { status: 500 },
    );
  }
}

// DELETE /api/deploy - Cancel deployment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") as DeploymentPlatform | null;
    const deploymentId = searchParams.get("deploymentId");

    if (!platform || !deploymentId) {
      return NextResponse.json(
        { error: "Platform and deployment ID are required" },
        { status: 400 },
      );
    }

    const success = await deploymentManager.cancelDeployment(
      platform,
      deploymentId,
    );

    return NextResponse.json({
      success,
      message: success
        ? "Deployment cancelled successfully"
        : "Failed to cancel deployment",
    });
  } catch (error) {
    console.error("Error in DELETE /api/deploy:", error);
    return NextResponse.json(
      { error: "Failed to cancel deployment" },
      { status: 500 },
    );
  }
}
