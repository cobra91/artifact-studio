"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Code, Eye } from 'lucide-react';
import GlassCard from './GlassCard';

export default function DemoSection() {
  const [activePrompt, setActivePrompt] = useState(0);
  
  const prompts = [
    {
      text: "Create a loan calculator with sliders",
      component: "LoanCalculator",
      preview: "Interactive form with amount, rate, and term sliders with real-time payment calculations"
    },
    {
      text: "Make a data visualization for sales",
      component: "SalesChart",
      preview: "Responsive bar chart with hover tooltips showing monthly sales data"
    },
    {
      text: "Build a quiz about React",
      component: "ReactQuiz",
      preview: "Multi-step quiz with progress bar, scoring, and results summary"
    },
    {
      text: "Design a pricing table",
      component: "PricingGrid",
      preview: "Three-tier pricing cards with feature comparison and CTA buttons"
    }
  ];

  return (
    <section id="live-demo" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            From prompt → working component
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Try sample prompts and watch components generate in the sandbox.
          </p>
        </motion.div>

        <GlassCard className="p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left - Prompt Input */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Code className="w-5 h-5 mr-2 text-[#61E8C1]" />
                Try these prompts
              </h3>
              
              <div className="space-y-3">
                {prompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setActivePrompt(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all
                      ${activePrompt === index 
                        ? 'bg-[#61E8C1]/10 border border-[#61E8C1]/30 text-white' 
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-3 h-3 rounded-full transition-colors
                        ${activePrompt === index ? 'bg-[#61E8C1]' : 'bg-gray-500'}
                      `} />
                      <span className="text-sm font-medium">{prompt.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <Button className="w-full bg-[#61E8C1] hover:bg-[#61E8C1]/90 text-black">
                <Play className="w-4 h-4 mr-2" />
                Generate Component
              </Button>
            </div>

            {/* Right - Preview */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-[#61E8C1]" />
                Live Preview
              </h3>
              
              <motion.div
                key={activePrompt}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-80 bg-black/20 rounded-xl border border-white/10 p-6"
              >
                <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#61E8C1]/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#61E8C1]">
                      {prompts[activePrompt].component[0]}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    {prompts[activePrompt].component}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                    {prompts[activePrompt].preview}
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <div className="w-2 h-2 bg-[#61E8C1] rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-[#61E8C1] rounded-full animate-pulse delay-200" />
                    <div className="w-2 h-2 bg-[#61E8C1] rounded-full animate-pulse delay-400" />
                  </div>
                </div>
              </motion.div>
              
              <p className="text-xs text-gray-500 text-center">
                Demo is simulated for landing; no external calls.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}