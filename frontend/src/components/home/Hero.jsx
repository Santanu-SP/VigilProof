import React, { useState, useRef, useCallback, Suspense, lazy } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const ParticleWave = lazy(() => import('./ParticleWave'));

// ── Magnetic Button ────────────────────────────────────────────────────────────
function MagneticButton({ children, className, id, onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      id={id}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// ── Stagger animation variants ─────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// ── Hero ───────────────────────────────────────────────────────────────────────
export default function Hero({ children }) {
  const [inspecting, setInspecting] = useState(false);

  const scrollToInspect = () => {
    setInspecting(true);
    document.getElementById('inspect')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden pt-24 pb-12"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 70%), #09090b' }}
    >
      {/* ── Three.js particle background ── */}
      <Suspense fallback={null}>
        <ParticleWave />
      </Suspense>

      {/* ── Scan-line overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Trust badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#22c55e',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              animation: 'trust-badge-glow 3s ease-in-out infinite',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e',
                flexShrink: 0,
              }}
            />
            Trusted by 5,000+ teams worldwide
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontSize: 'clamp(3rem, 7vw, 5.5rem)',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
          }}
        >
          Every Signal.{' '}
          <span style={{ color: '#22c55e', position: 'relative' }}>
            One Platform.
            {/* Underline glow */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: '-4px',
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
                borderRadius: '9999px',
                filter: 'blur(1px)',
              }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7,
            maxWidth: '600px',
            marginBottom: '2.5rem',
            fontWeight: 400,
          }}
        >
          Collect, process, and visualize your data through a unified platform
          built for teams that move fast.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3.5rem' }}
        >
          {/* Primary CTA */}
          <MagneticButton
            id="cta-start-free"
            onClick={scrollToInspect}
            className=""
            style={{}}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                borderRadius: '9999px',
                background: '#22c55e',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.01em',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                transition: 'background 0.2s, box-shadow 0.2s',
                boxShadow: '0 0 20px rgba(34,197,94,0.35)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#16a34a';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(34,197,94,0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#22c55e';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(34,197,94,0.35)';
              }}
            >
              Start Free
            </span>
          </MagneticButton>

          {/* Secondary CTA */}
          <MagneticButton
            id="cta-learn-more"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                borderRadius: '9999px',
                background: 'transparent',
                color: '#22c55e',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.01em',
                cursor: 'pointer',
                border: '1.5px solid rgba(34,197,94,0.6)',
                outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#22c55e';
                e.currentTarget.style.background = 'rgba(34,197,94,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(34,197,94,0.6)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Learn More
            </span>
          </MagneticButton>
        </motion.div>

        {/* Upload Panel (children) wrapped in glassmorphism card */}
        {children && (
          <motion.div
            variants={itemVariants}
            id="inspect"
            style={{
              width: '100%',
              maxWidth: '680px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '4px',
              boxShadow: '0 0 0 1px rgba(34,197,94,0.08), 0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {children}
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.p
          variants={itemVariants}
          style={{
            marginTop: '1.5rem',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'monospace',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          No credentials required. Never enter passwords or OTPs.
        </motion.p>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontFamily: 'monospace',
        }}
      >
        <span>scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 28,
            background: 'linear-gradient(to bottom, rgba(34,197,94,0.6), transparent)',
          }}
        />
      </motion.div>
    </section>
  );
}
