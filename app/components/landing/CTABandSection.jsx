"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CTABandSection() {
  const router = useRouter();
  const navigateToArtifactBuilder = () => {
    router.push('/artifact-builder');
  };

  const features = [
    "Natural-language to React with Tailwind",
    "Sandboxed live preview",
    "Template marketplace",
    "Auto-optimization for performance"
  ];

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#61E8C1]/10 via-blue-500/10 to-purple-500/10" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-white">
            Build faster.{" "}
            <span className="bg-gradient-to-r from-[#61E8C1] to-blue-400 bg-clip-text text-transparent">
              Break less.
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 backdrop-blur-sm bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <CheckCircle className="w-5 h-5 text-[#61E8C1] flex-shrink-0" />
                <span className="text-white text-sm font-medium">{feature}</span>
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
              className="bg-[#61E8C1] hover:bg-[#61E8C1]/90 text-black font-semibold px-12 py-6 text-lg"
            >
              Artifact Builder
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}