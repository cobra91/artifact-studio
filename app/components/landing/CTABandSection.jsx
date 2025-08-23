"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CTABandSection() {
  const router = useRouter();
  const navigateToArtifactBuilder = () => {
    router.push("/artifact-builder");
  };

  const features = [
    "Natural-language to React with Tailwind",
    "Sandboxed live preview",
    "Template marketplace",
    "Auto-optimization for performance",
  ];

  return (
    <section className="relative px-4 py-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#61E8C1]/10 via-blue-500/10 to-purple-500/10" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl font-bold text-white lg:text-6xl">
            Build faster.{" "}
            <span className="bg-gradient-to-r from-[#61E8C1] to-blue-400 bg-clip-text text-transparent">
              Break less.
            </span>
          </h2>

          <div className="mx-auto grid max-w-2xl gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-[#61E8C1]" />
                <span className="text-sm font-medium text-white">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={navigateToArtifactBuilder}
              size="lg"
              className="bg-[#61E8C1] px-12 py-6 text-lg font-semibold text-black hover:bg-[#61E8C1]/90"
            >
              Artifact Builder
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
