import { ComponentNode } from "../types/artifact";

export interface Version {
  id: string;
  timestamp: number;
  name: string;
  components: ComponentNode[];
}

const VERSIONS_STORAGE_KEY = "artifact-versions";

export class VersionControl {
  private versions: Version[] = [];

  constructor() {
    this.loadVersions();
  }

  private loadVersions() {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const storedVersions = localStorage.getItem(VERSIONS_STORAGE_KEY);
      if (storedVersions) {
        this.versions = JSON.parse(storedVersions);
      }
    } catch (error) {
      console.error("Failed to load versions:", error);
    }
  }

  private saveVersions() {
    try {
      localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(this.versions));
    } catch (error) {
      console.error("Failed to save versions:", error);
    }
  }

  saveVersion(name: string, components: ComponentNode[]): Version {
    const version: Version = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      name,
      components,
    };

    this.versions.unshift(version);
    this.saveVersions();
    return version;
  }

  getVersions(): Version[] {
    return this.versions;
  }

  restoreVersion(id: string): ComponentNode[] | null {
    const version = this.versions.find((v) => v.id === id);
    return version ? version.components : null;
  }

  clearVersions() {
    this.versions = [];
    this.saveVersions();
  }
}

export const versionControl = new VersionControl();
