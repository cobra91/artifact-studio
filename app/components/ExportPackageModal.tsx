"use client";

import { ChangeEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ExportOptions,
  generateAndDownloadPackage,
} from "@/lib/packageGenerator";
import { ComponentNode } from "@/types/artifact";

interface ExportPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: ComponentNode[];
}

export function ExportPackageModal({
  isOpen,
  onClose,
  components,
}: ExportPackageModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    type: "package",
    framework: "react",
    styling: "tailwind",
    includeTests: false,
    includeStorybook: false,
    packageName: "my-ui-components",
    description: "A collection of UI components",
    author: "Your Name",
    version: "1.0.0",
    license: "MIT",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    if (components.length === 0) {
      alert("Please add at least one component to export");
      return;
    }

    setIsGenerating(true);
    try {
      await generateAndDownloadPackage(components, exportOptions);
      onClose();
    } catch (error) {
      console.error("Error generating package:", error);
      alert("Error generating package. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (
    field: keyof ExportOptions,
    value: string | boolean,
  ) => {
    setExportOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Package</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="packageName">Package Name</Label>
              <Input
                id="packageName"
                value={exportOptions.packageName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("packageName", e.target.value)
                }
                placeholder="my-ui-components"
              />
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={exportOptions.version}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("version", e.target.value)
                }
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={exportOptions.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("description", e.target.value)
              }
              placeholder="A collection of UI components"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={exportOptions.author}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleInputChange("author", e.target.value)
                }
                placeholder="Your Name"
              />
            </div>

            <div>
              <Label htmlFor="license">License</Label>
              <Select
                value={exportOptions.license}
                onValueChange={(value: string) =>
                  handleInputChange("license", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select license" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIT">MIT</SelectItem>
                  <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                  <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                  <SelectItem value="BSD-3-Clause">BSD 3-Clause</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Export Type</Label>
              <Select
                value={exportOptions.type}
                onValueChange={(value: "component" | "package" | "project") =>
                  handleInputChange("type", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="framework">Framework</Label>
              <Select
                value={exportOptions.framework}
                onValueChange={(value: "react" | "vue" | "svelte" | "nextjs") =>
                  handleInputChange("framework", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue</SelectItem>
                  <SelectItem value="svelte">Svelte</SelectItem>
                  <SelectItem value="nextjs">Next.js</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="styling">Styling</Label>
              <Select
                value={exportOptions.styling}
                onValueChange={(
                  value: "tailwind" | "css" | "scss" | "styled-components",
                ) => handleInputChange("styling", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select styling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="scss">SCSS</SelectItem>
                  <SelectItem value="styled-components">
                    Styled Components
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="includeTests">Include Tests</Label>
                <p className="text-sm text-muted-foreground">
                  Add Jest/Testing Library setup
                </p>
              </div>
              <Switch
                id="includeTests"
                checked={exportOptions.includeTests}
                onCheckedChange={(checked: boolean) =>
                  handleInputChange("includeTests", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="includeStorybook">Include Storybook</Label>
                <p className="text-sm text-muted-foreground">
                  Add Storybook configuration
                </p>
              </div>
              <Switch
                id="includeStorybook"
                checked={exportOptions.includeStorybook}
                onCheckedChange={(checked: boolean) =>
                  handleInputChange("includeStorybook", checked)
                }
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Components to Export</h3>
            <p className="text-sm text-muted-foreground">
              {components.length} component{components.length !== 1 ? "s" : ""}{" "}
              will be included in the package
            </p>
            <div className="mt-2 max-h-32 overflow-y-auto">
              {components.map((component, index) => (
                <div key={index} className="text-sm py-1">
                  • {component.type}{" "}
                  {component.props?.className
                    ? `(${component.props.className})`
                    : ""}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isGenerating || components.length === 0}
          >
            {isGenerating ? "Generating..." : "Export Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
