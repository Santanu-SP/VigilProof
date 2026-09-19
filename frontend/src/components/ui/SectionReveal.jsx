import React from 'react';
import { motion } from 'framer-motion';

/**
 * SectionReveal — shared scroll-triggered reveal wrapper.
 *
 * Wraps a section so it springs into view as the user scrolls.
 * Children are staggered by `staggerChildren` (default 0.15s).
 *
 * Usage:
 *   <SectionReveal>
 *     <RevealItem>...</RevealItem>
 *     <RevealItem>...</RevealItem>
 *   </SectionReveal>
 *
 * Or use `as` prop to render as a section, div, etc.
 */

// Container: triggers stagger when it enters the viewport
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

// Each direct child reveals with a spring from y:40, opacity:0
export const itemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 18,
      mass: 0.8,
    },
  },
};

/**
 * SectionReveal wrapper — applies whileInView stagger to the container.
 * `once: true` so animation only fires on first scroll-into-view.
 * `margin: "-80px"` so it triggers slightly before edge.
 */
export function SectionReveal({ children, className, style, as: Tag = 'div', id }) {
  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * RevealItem — individual child that slides up on scroll.
 * Wrap any card, heading, or block with this.
 */
export function RevealItem({ children, className, style }) {
  return (
    <motion.div variants={itemVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}
