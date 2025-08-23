"use client";

import React from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

export default function TimelineSection() {
  const milestones = [
    {
      label: "Day 1–2 · Visual Builder Core",
      points: [
        "Drag & drop interface for component creation",
        "Real-time preview with hot reload",
        "Component library with pre-built templates",
        "Style customization panel",
      ],
    },
    {
      label: "Day 3–4 · AI-Powered Generation",
      points: [
        '"Create a loan calculator with sliders" → Interactive calculator',
        '"Make a data visualization for sales" → Chart component',
        '"Build a quiz about React" → Interactive quiz widget',
        '"Design a pricing table" → Responsive pricing grid',
      ],
    },
    {
      label: "Day 5 · Integration & Deployment",
      points: [
        "Version control for artifacts",
        "A/B testing framework for components",
        "Performance monitoring per artifact",
      ],
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
            Game-Changing Features
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Fast track to MVP: Day-by-day launch plan
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {milestones.map((milestone, index) => (
            <motion.div key={milestone.label} variants={item}>
              <GlassCard className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#61E8C1] to-blue-400 text-lg font-bold text-black">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-6 text-2xl font-semibold text-white">
                      {milestone.label}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {milestone.points.map((point, pointIndex) => (
                        <div
                          key={pointIndex}
                          className="flex items-start space-x-3"
                        >
                          <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#61E8C1]" />
                          <p className="leading-relaxed text-gray-300">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
