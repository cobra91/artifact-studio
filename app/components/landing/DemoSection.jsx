"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Code, Eye } from "lucide-react";
import GlassCard from "./GlassCard";

export default function DemoSection() {
  const [activePrompt, setActivePrompt] = useState(0);

  const prompts = [
    {
      text: "Create a loan calculator with sliders",
      component: "LoanCalculator",
      preview:
        "Interactive form with amount, rate, and term sliders with real-time payment calculations",
    },
    {
      text: "Make a data visualization for sales",
      component: "SalesChart",
      preview:
        "Responsive bar chart with hover tooltips showing monthly sales data",
    },
    {
      text: "Build a quiz about React",
      component: "ReactQuiz",
      preview:
        "Multi-step quiz with progress bar, scoring, and results summary",
    },
    {
      text: "Design a pricing table",
      component: "PricingGrid",
      preview:
        "Three-tier pricing cards with feature comparison and CTA buttons",
    },
  ];

  return (
    <section id="live-demo" className="relative px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
            From prompt → working component
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Try sample prompts and watch components generate in the sandbox.
          </p>
        </motion.div>

        <GlassCard className="p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left - Prompt Input */}
            <div className="space-y-6">
              <h3 className="flex items-center text-xl font-semibold text-white">
                <Code className="mr-2 h-5 w-5 text-[#61E8C1]" />
                Try these prompts
              </h3>

              <div className="space-y-3">
                {prompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setActivePrompt(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-xl p-4 text-left transition-all ${
                      activePrompt === index
                        ? "border border-[#61E8C1]/30 bg-[#61E8C1]/10 text-white"
                        : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                    } `}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-3 w-3 rounded-full transition-colors ${activePrompt === index ? "bg-[#61E8C1]" : "bg-gray-500"} `}
                      />
                      <span className="text-sm font-medium">{prompt.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <Button className="w-full bg-[#61E8C1] text-black hover:bg-[#61E8C1]/90">
                <Play className="mr-2 h-4 w-4" />
                Generate Component
              </Button>
            </div>

            {/* Right - Preview */}
            <div className="space-y-6">
              <h3 className="flex items-center text-xl font-semibold text-white">
                <Eye className="mr-2 h-5 w-5 text-[#61E8C1]" />
                Live Preview
              </h3>

              <motion.div
                key={activePrompt}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="h-80 rounded-xl border border-white/10 bg-black/20 p-6"
              >
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#61E8C1]/20">
                    <span className="text-2xl font-bold text-[#61E8C1]">
                      {prompts[activePrompt].component[0]}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    {prompts[activePrompt].component}
                  </h4>
                  <p className="max-w-sm text-sm leading-relaxed text-gray-400">
                    {prompts[activePrompt].preview}
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-[#61E8C1]" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-[#61E8C1] delay-200" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-[#61E8C1] delay-400" />
                  </div>
                </div>
              </motion.div>

              <p className="text-center text-xs text-gray-500">
                Demo is simulated for landing; no external calls.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
