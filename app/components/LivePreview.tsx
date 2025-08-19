'use client'

import { useState, useEffect } from 'react'

interface LivePreviewProps {
  code: string
}

export const LivePreview = ({ code }: LivePreviewProps) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-sm rounded-l ${
              activeTab === 'preview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 text-sm rounded-r ${
              activeTab === 'code' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Code
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Toggle fullscreen"
          >
            {isFullscreen ? '🗗' : '🗖'}
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Refresh preview"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' ? (
          <PreviewPane />
        ) : (
          <CodePane code={code} />
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Live Preview</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const PreviewPane = () => {
  return (
    <div className="h-full p-4 bg-gray-50">
      <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Mock preview content */}
        <div className="space-y-4">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">👁️</div>
            <p className="text-lg font-medium">Live Preview</p>
            <p className="text-sm">Your components will appear here in real-time</p>
          </div>
          
          {/* Sample preview elements */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="bg-blue-600 text-white px-4 py-2 rounded mb-2 inline-block">
              Sample Button
            </div>
            <p className="text-gray-700">Sample text component</p>
            <input 
              className="border border-gray-300 rounded px-3 py-2 mt-2 w-full" 
              placeholder="Sample input field"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const CodePane = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code || sampleCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const sampleCode = `export const GeneratedComponent = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Generated Component
      </h2>
      <p className="text-gray-600 mb-4">
        This is a sample generated component. 
        Use the AI prompt panel to create custom components.
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Get Started
      </button>
    </div>
  )
}`

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-800 text-white">
        <span className="text-sm font-mono">Generated Code</span>
        <button
          onClick={copyCode}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-900 text-gray-100 p-4">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          <code>{code || sampleCode}</code>
        </pre>
      </div>
    </div>
  )
}