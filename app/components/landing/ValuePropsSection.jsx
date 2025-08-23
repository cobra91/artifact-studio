"use client";

import React from 'react';
import { Wand2, LayoutGrid, Beaker, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

export default function ValuePropsSection() {
  const features = [
    {
      icon: Wand2,
      title: "No-Code AI Components",
      desc: "Describe it in plain English. Get interactive, accessible React with Tailwind."
    },
    {
      icon: LayoutGrid,
      title: "Template Marketplace",
      desc: "Kickstart builds with community templates and share your own artifacts."
    },
    {
      icon: Beaker,
      title: "Live Testing Sandbox",
      desc: "Preview safely. Hot reload, version snapshots, and instant rollbacks."
    },
    {
      icon: Gauge,
      title: "Performance Optimized",
      desc: "Mobile and desktop auto-tuning with Lighthouse-minded defaults."
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Why Visual Artifact Studio?
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={item}>
              <GlassCard hover className="p-8 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-[#61E8C1]/20 to-[#61E8C1]/5 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#61E8C1]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}