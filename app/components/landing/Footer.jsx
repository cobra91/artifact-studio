"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const links = [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <footer className="border-t border-white/10 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0"
        >
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#61E8C1] to-blue-400">
              <span className="text-sm font-bold text-black">V</span>
            </div>
            <span className="font-semibold text-white">
              Visual Artifact Studio
            </span>
          </div>

          <div className="flex items-center space-x-8">
            {links.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-sm text-gray-500">© Visual Artifact Studio</p>
        </motion.div>
      </div>
    </footer>
  );
}
