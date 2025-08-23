"use client";

import React from "react";
import { Wand2, LayoutGrid, Beaker, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

export default function ValuePropsSection() {
  const features = [
    {
      icon: Wand2,
      title: "No-Code AI Components",
      desc: "Describe it in plain English. Get interactive, accessible React with Tailwind.",
    },
    {
      icon: LayoutGrid,
      title: "Template Marketplace",
      desc: "Kickstart builds with community templates and share your own artifacts.",
    },
    {
      icon: Beaker,
      title: "Live Testing Sandbox",
      desc: "Preview safely. Hot reload, version snapshots, and instant rollbacks.",
    },
    {
      icon: Gauge,
      title: "Performance Optimized",
      desc: "Mobile and desktop auto-tuning with Lighthouse-minded defaults.",
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
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0 },
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
            Why Visual Artifact Studio?
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={item}>
              <GlassCard hover className="h-full p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#61E8C1]/20 to-[#61E8C1]/5">
                  <feature.icon className="h-7 w-7 text-[#61E8C1]" />
                </div>
                <h3 className="mb-4 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-gray-400">{feature.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
