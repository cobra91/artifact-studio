"use client";

import React from "react";
import { Boxes, Palette, GitBranch, SplitSquareHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

export default function FeaturesSection() {
  const features = [
    {
      icon: Boxes,
      title: "Component Library",
      desc: "Buttons, forms, charts, tables, sliders, modals, tabs, quizzes—and more.",
    },
    {
      icon: Palette,
      title: "Style Panel",
      desc: "Edit spacing, radii, shadows, states, and tokens with instant preview.",
    },
    {
      icon: GitBranch,
      title: "Artifact Versions",
      desc: "Fork, diff, and label versions. Roll back in one click.",
    },
    {
      icon: SplitSquareHorizontal,
      title: "A/B Experiments",
      desc: "Ship variants safely. Track CTR, dwell time, and interaction.",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
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
        damping: 10,
      },
    },
  };

  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
            What's inside
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 },
              }}
              style={{ perspective: 1000 }}
            >
              <GlassCard className="group relative h-full overflow-hidden p-8">
                {/* Tilt Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#61E8C1]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#61E8C1]/30 to-[#61E8C1]/10 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-8 w-8 text-[#61E8C1]" />
                  </div>
                  <h3 className="mb-4 text-2xl font-semibold text-white transition-colors duration-300 group-hover:text-[#61E8C1]">
                    {feature.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-gray-400">
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
