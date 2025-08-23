"use client";

import React from 'react';
import { Boxes, Palette, GitBranch, SplitSquareHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

export default function FeaturesSection() {
  const features = [
    {
      icon: Boxes,
      title: "Component Library",
      desc: "Buttons, forms, charts, tables, sliders, modals, tabs, quizzes—and more."
    },
    {
      icon: Palette,
      title: "Style Panel",
      desc: "Edit spacing, radii, shadows, states, and tokens with instant preview."
    },
    {
      icon: GitBranch,
      title: "Artifact Versions",
      desc: "Fork, diff, and label versions. Roll back in one click."
    },
    {
      icon: SplitSquareHorizontal,
      title: "A/B Experiments",
      desc: "Ship variants safely. Track CTR, dwell time, and interaction."
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
    hidden: { opacity: 0, y: 30, rotateX: -15 },
    show: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
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
            What's inside
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title} 
              variants={item}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              style={{ perspective: 1000 }}
            >
              <GlassCard className="p-8 h-full relative overflow-hidden group">
                {/* Tilt Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#61E8C1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#61E8C1]/30 to-[#61E8C1]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-[#61E8C1]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-[#61E8C1] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {feature.desc}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}