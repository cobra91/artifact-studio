"use client";

import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

export default function TimelineSection() {
  const milestones = [
    {
      label: "Day 1–2 · Visual Builder Core",
      points: [
        "Drag & drop interface for component creation",
        "Real-time preview with hot reload",
        "Component library with pre-built templates",
        "Style customization panel"
      ]
    },
    {
      label: "Day 3–4 · AI-Powered Generation",
      points: [
        "\"Create a loan calculator with sliders\" → Interactive calculator",
        "\"Make a data visualization for sales\" → Chart component",
        "\"Build a quiz about React\" → Interactive quiz widget",
        "\"Design a pricing table\" → Responsive pricing grid"
      ]
    },
    {
      label: "Day 5 · Integration & Deployment",
      points: [
        "Version control for artifacts",
        "A/B testing framework for components",
        "Performance monitoring per artifact"
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -50 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Game-Changing Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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
                    <div className="w-12 h-12 bg-gradient-to-br from-[#61E8C1] to-blue-400 rounded-full flex items-center justify-center text-black font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-6">
                      {milestone.label}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {milestone.points.map((point, pointIndex) => (
                        <div key={pointIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-[#61E8C1] rounded-full mt-2 flex-shrink-0" />
                          <p className="text-gray-300 leading-relaxed">{point}</p>
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