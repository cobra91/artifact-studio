"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();
  const navigateToArtifactBuilder = () => {
    router.push('/artifact-builder');
  };
  const [typewriterText, setTypewriterText] = useState('');
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
    document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F14] to-[#0E1622]" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#61E8C1]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
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
            <Badge className="bg-[#61E8C1]/10 text-[#61E8C1] border-[#61E8C1]/20 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              New • Private Beta
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl lg:text-7xl font-bold text-white leading-tight"
          >
            Build interactive
            <br />
            <span className="bg-gradient-to-r from-[#61E8C1] to-blue-400 bg-clip-text text-transparent">
              components
            </span>
            <br />
            — visually and with AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-300 leading-relaxed max-w-lg"
          >
            An external visual builder that generates production-ready React from natural language. 
            Think <span className="text-[#61E8C1]">Figma + CodeSandbox + AI</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              onClick={navigateToArtifactBuilder}
              size="lg"
              className="bg-[#61E8C1] hover:bg-[#61E8C1]/90 text-black font-semibold px-8 py-6 text-lg"
            >
              Artifact Builder
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={scrollToDemo}
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm font-mono">ArtifactBuilder.tsx</span>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#61E8C1]/5 to-transparent rounded-lg opacity-50"></div>
              <pre className="text-sm text-gray-300 font-mono overflow-x-auto relative z-10">
                <code>{typewriterText}<span className="animate-pulse">|</span></code>
              </pre>
            </div>
          </GlassCard>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-4 -right-4 w-8 h-8 bg-[#61E8C1]/20 rounded-full blur-sm"
          />
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-6 -left-6 w-12 h-12 bg-blue-500/20 rounded-full blur-sm"
          />
        </motion.div>
      </div>
    </div>
  );
}