"use client";

import { useEffect, useRef,useState } from "react";

import {
  postSandboxMessage,
  RENDER_COMPONENT_MESSAGE,
  SANDBOX_READY_MESSAGE,
} from "../lib/sandbox";

interface LivePreviewProps {
  code: string;
}

export const LivePreview = ({ code }: LivePreviewProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 text-sm rounded-l ${
              activeTab === "preview"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1 text-sm rounded-r ${
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
          <PreviewPane code={code} />
        ) : (
          <CodePane code={code} />
        )}
      </div>
    </div>
  );
};

const PreviewPane = ({ code }: { code: string }) => {
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
        payload: { code },
      });
    }
  }, [code, isSandboxReady]);

  return (
    <div className="w-full h-full bg-white">
      <iframe
        ref={iframeRef}
        src="/sandbox.html"
        title="Live Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts"
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-800 text-white">
        <span className="text-sm font-mono">Generated Code</span>
        <button
          onClick={copyCode}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900 text-gray-100 p-4">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          <code>{code || "Generate a component to see the code here."}</code>
        </pre>
      </div>
    </div>
  );
};
