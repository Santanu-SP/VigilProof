import { motion } from 'framer-motion';

export function PageTransition({ children, keyProp }) {
  return (
    <motion.div
      key={keyProp}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, position: 'absolute', top: 0, left: 0, right: 0, zIndex: -1 }}
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
