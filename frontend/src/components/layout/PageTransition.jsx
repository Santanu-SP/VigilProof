import { motion } from 'framer-motion';

export function PageTransition({ children, keyProp }) {
  return (
    <motion.div
      key={keyProp}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
