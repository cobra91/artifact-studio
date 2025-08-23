"use client";

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = "", hover = false, ...props }) {
  return (
    <motion.div
      className={`
        backdrop-blur-md bg-white/[0.06] 
        border border-white/[0.08]
        rounded-2xl shadow-xl
        transition-all duration-300
        ${hover ? 'hover:-translate-y-2 hover:shadow-2xl hover:bg-white/[0.08]' : ''}
        ${className}
      `}
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