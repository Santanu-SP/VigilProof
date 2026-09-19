import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ScanSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ForensicBackground from './ForensicBackground';

const contentVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const scrollToWorkflow = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <section className="forensic-hero">
      <ForensicBackground />
      <div className="forensic-hero__frame" aria-hidden="true" />

      <div className="forensic-hero__content">
        <motion.div
          initial={reducedMotion ? false : 'hidden'}
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p variants={contentVariants} className="forensic-hero__eyebrow">
            <ScanSearch size={15} aria-hidden="true" />
            Evidence-led investigation
          </motion.p>

          <motion.h1 variants={contentVariants} className="forensic-hero__title">
            Evidence, before<br />
            <span>the verdict.</span>
          </motion.h1>

          <motion.p variants={contentVariants} className="forensic-hero__description">
            VigilProof turns suspicious messages and screenshots into observable signals,
            so you can assess what is there—not simply trust a conclusion.
          </motion.p>

          <motion.div variants={contentVariants} className="forensic-hero__actions">
            <button className="forensic-button forensic-button--primary" type="button" onClick={() => navigate('/investigate')}>
              Start an investigation
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <button className="forensic-button forensic-button--secondary" type="button" onClick={scrollToWorkflow}>
              How it works
            </button>
          </motion.div>

          <motion.div variants={contentVariants} className="forensic-hero__note">
            <span aria-hidden="true" />
            Do not enter passwords or one-time codes into a suspicious page.
          </motion.div>
        </motion.div>
      </div>

      <motion.p
        className="forensic-hero__scroll-cue"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Scroll to examine
      </motion.p>
    </section>
  );
}
