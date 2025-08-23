"use client";

import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  hover = false,
  ...props
}) {
  return (
    <motion.div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.06] shadow-xl backdrop-blur-md transition-all duration-300 ${hover ? "hover:-translate-y-2 hover:bg-white/[0.08] hover:shadow-2xl" : ""} ${className} `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

GlassCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  hover: PropTypes.bool,
};
