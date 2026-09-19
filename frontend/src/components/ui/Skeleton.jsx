import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * NeonSkeleton — dark translucent panel with a pulsing neon green
 * edge-glow sweep to signify active data extraction.
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-xl', className)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(34,197,94,0.12)',
        boxShadow: '0 0 0 1px rgba(34,197,94,0.06)',
      }}
      {...props}
    >
      {/* Sweep shimmer */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(105deg, transparent 30%, rgba(34,197,94,0.12) 50%, rgba(34,197,94,0.06) 55%, transparent 70%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPositionX: ['200%', '-200%'] }}
        transition={{
          duration: 1.8,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />
      {/* Pulsing green edge glow */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }}
        animate={{
          boxShadow: [
            'inset 0 0 0px 0px rgba(34,197,94,0)',
            'inset 0 0 14px 1px rgba(34,197,94,0.18)',
            'inset 0 0 0px 0px rgba(34,197,94,0)',
          ],
        }}
        transition={{
          duration: 2.2,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />
    </div>
  );
}

/* ── Composite skeleton layouts used as Suspense fallbacks ── */

/** Hero upload panel skeleton */
export function HeroSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 680,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 20,
      }}
    >
      <Skeleton style={{ height: 160 }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <Skeleton style={{ height: 44, flex: 1 }} />
        <Skeleton style={{ height: 44, width: 120 }} />
      </div>
    </div>
  );
}

/** Generic section skeleton — 4 card grid */
export function SectionSkeleton({ cards = 4, cardHeight = 180 }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '64px 24px',
      }}
    >
      {/* Section heading placeholder */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginBottom: 48,
        }}
      >
        <Skeleton style={{ height: 14, width: 120 }} />
        <Skeleton style={{ height: 36, width: 320 }} />
        <Skeleton style={{ height: 18, width: 480, maxWidth: '80vw' }} />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
          gap: 16,
        }}
      >
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} style={{ height: cardHeight }} />
        ))}
      </div>
    </div>
  );
}

/** Result view skeleton */
export function ResultSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '80px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <Skeleton style={{ height: 80 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Skeleton style={{ height: 220 }} />
        <Skeleton style={{ height: 220 }} />
      </div>
      <Skeleton style={{ height: 300 }} />
    </div>
  );
}

/** Analysis progress skeleton */
export function ProgressSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 760,
        margin: '120px auto',
        padding: '0 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Skeleton style={{ height: 56 }} />
      <Skeleton style={{ height: 8, borderRadius: 999 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[100, 80, 90].map((w, i) => (
          <Skeleton key={i} style={{ height: 20, width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
