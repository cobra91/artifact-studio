"use client";

import { useState } from "react";

interface LivePreviewProps {
  code: string;
  framework: "react" | "vue" | "svelte";
}

export const LivePreview = ({
  code,
  framework: _framework,
}: LivePreviewProps) => {
  return (
    <div className="flex h-full flex-col">
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <CodePane code={code} />
      </div>
    </div>
  );
};

const CodePane = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const exportCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "component.tsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="glass text-foreground flex items-center justify-between p-3">
        <span className="font-mono text-sm">Generated Code</span>
        <div className="flex gap-2">
          <button
            onClick={copyCode}
            className="glass text-foreground hover:bg-accent rounded px-2 py-1 text-xs transition-all duration-200"
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
          <button
            onClick={exportCode}
            className="glass bg-primary text-primary-foreground hover:bg-primary/90 rounded px-2 py-1 text-xs transition-all duration-200"
          >
            Export
          </button>
        </div>
      </div>

      <div className="glass flex-1 overflow-auto p-4">
        <pre className="text-foreground font-mono text-sm whitespace-pre-wrap">
          <code>{code || "Generate a component to see the code here."}</code>
        </pre>
      </div>
    </div>
  );
};
