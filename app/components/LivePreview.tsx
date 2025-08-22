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
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-3">
        <div className="flex">
          <button
            onClick={() => setActiveTab("preview")}
            className={`rounded-l px-3 py-1 text-sm ${
              activeTab === "preview"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`rounded-r px-3 py-1 text-sm ${
              activeTab === "code"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
    <div className="h-full w-full bg-white">
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        title="Live Preview"
        className="h-full w-full border-0"
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
      <div className="flex items-center justify-between bg-gray-800 p-3 text-white">
        <span className="font-mono text-sm">Generated Code</span>
        <button
          onClick={copyCode}
          className="rounded bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
        <button
          onClick={exportCode}
          className="ml-2 rounded bg-green-700 px-2 py-1 text-xs hover:bg-green-600"
        >
          Export
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900 p-4 text-gray-100">
        <pre className="font-mono text-sm whitespace-pre-wrap">
          <code>{code || "Generate a component to see the code here."}</code>
        </pre>
      </div>
    </div>
  );
};
