"use client";

import { useEffect, useRef, useState } from "react";

import {
  postSandboxMessage,
  RENDER_COMPONENT_MESSAGE,
  SANDBOX_READY_MESSAGE,
} from "../lib/sandbox";

interface LivePreviewProps {
  code: string;
  framework: "react" | "vue" | "svelte";
}

export const LivePreview = ({ code, framework }: LivePreviewProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="glass border-border/20 flex items-center justify-between border-b p-3">
        <div className="flex">
          <button
            onClick={() => setActiveTab("preview")}
            className={`rounded-l px-3 py-1 text-sm transition-all duration-200 ${
              activeTab === "preview"
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`rounded-r px-3 py-1 text-sm transition-all duration-200 ${
              activeTab === "code"
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            Code
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "preview" ? (
          <PreviewPane code={code} framework={framework} />
        ) : (
          <CodePane code={code} />
        )}
      </div>
    </div>
  );
};

const PreviewPane = ({
  code,
  framework,
}: {
  code: string;
  framework: "react" | "vue" | "svelte";
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSandboxReady, setIsSandboxReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data.type === SANDBOX_READY_MESSAGE) {
        setIsSandboxReady(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (isSandboxReady && iframeRef.current && code) {
      postSandboxMessage(iframeRef.current, {
        type: RENDER_COMPONENT_MESSAGE,
        payload: { code, framework },
      });
    }
  }, [code, isSandboxReady, framework]);

  return (
    <div className="glass h-full w-full">
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        title="Live Preview"
        className="h-full w-full rounded border-0"
        sandbox="allow-scripts allow-same-origin"
      />
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
