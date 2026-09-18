import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Skeleton({ className, ...props }) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden bg-slate-200 rounded-md",
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-60"
        animate={{
          translateX: ["-100%", "100%"]
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
    </motion.div>
  );
}
