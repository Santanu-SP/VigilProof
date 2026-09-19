import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

export default function ForensicBackground() {
  const fieldRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: fieldRef, offset: ['start start', 'end start'] });
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 48]);
  const traceY = useTransform(scrollYProgress, [0, 1], [0, 96]);

  return (
    <div ref={fieldRef} className="forensic-background" aria-hidden="true">
      <div className="forensic-background__light" />
      <motion.div className="forensic-background__grid" style={reduceMotion ? undefined : { y: gridY }} />
      <motion.div className="forensic-background__traces" style={reduceMotion ? undefined : { y: traceY }}>
        <span className="forensic-background__node node-a" />
        <span className="forensic-background__node node-b" />
        <span className="forensic-background__node node-c" />
        <span className="forensic-background__node node-d" />
      </motion.div>
      <div className="forensic-background__scan" />
    </div>
  );
}
