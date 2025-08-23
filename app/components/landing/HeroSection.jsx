"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const navigateToArtifactBuilder = () => {
    router.push("/artifact-builder");
  };
  const [typewriterText, setTypewriterText] = useState("");
  const fullCode = `const ArtifactBuilder = () => {
  const [canvas, setCanvas] = useState<ComponentNode[]>([])
  const [livePreview, setLivePreview] = useState('')
  
  const generateFromPrompt = async (description: string) => {
    const component = await aiCodeGen.create({
      prompt: description,
      framework: 'react',
      styling: 'tailwindcss',
      interactivity: 'high'
    })
    return sandboxExecute(component.code)
  }
}`;

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullCode.length) {
        setTypewriterText(fullCode.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const scrollToDemo = () => {
    document
      .getElementById("live-demo")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F14] to-[#0E1622]" />
        <div className="absolute top-20 left-20 h-96 w-96 animate-pulse rounded-full bg-[#61E8C1]/10 blur-3xl" />
        <div className="absolute right-20 bottom-20 h-80 w-80 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-2000" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        {/* Left Column - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="border-[#61E8C1]/20 bg-[#61E8C1]/10 px-4 py-2 text-sm text-[#61E8C1]">
              <Sparkles className="mr-2 h-4 w-4" />
              New • Private Beta
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl leading-tight font-bold text-white lg:text-7xl"
          >
            Build interactive
            <br />
            <span className="bg-gradient-to-r from-[#61E8C1] to-blue-400 bg-clip-text text-transparent">
              components
            </span>
            <br />— visually and with AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-lg text-xl leading-relaxed text-gray-300"
          >
            An external visual builder that generates production-ready React
            from natural language. Think{" "}
            <span className="text-[#61E8C1]">Figma + CodeSandbox + AI</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Button
              onClick={navigateToArtifactBuilder}
              size="lg"
              className="bg-[#61E8C1] px-8 py-6 text-lg font-semibold text-black hover:bg-[#61E8C1]/90"
            >
              Artifact Builder
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={scrollToDemo}
              variant="outline"
              size="lg"
              className="border-white/20 px-8 py-6 text-lg text-white hover:bg-white/10"
            >
              See it in action
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Column - Code Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="font-mono text-sm text-gray-400">
                ArtifactBuilder.tsx
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#61E8C1]/5 to-transparent opacity-50"></div>
              <pre className="relative z-10 overflow-x-auto font-mono text-sm text-gray-300">
                <code>
                  {typewriterText}
                  <span className="animate-pulse">|</span>
                </code>
              </pre>
            </div>
          </GlassCard>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-[#61E8C1]/20 blur-sm"
          />
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-6 -left-6 h-12 w-12 rounded-full bg-blue-500/20 blur-sm"
          />
        </motion.div>
      </div>
    </div>
  );
}
