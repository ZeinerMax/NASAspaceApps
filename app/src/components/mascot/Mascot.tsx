// Dr. Biscuit: image + typed speech bubble. Bounces when the mood (image) changes.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MASCOT_IMAGES, type MascotMood } from '../../data/mascot';

export default function Mascot({ mood, compact = false, floating = true }: { mood: MascotMood; compact?: boolean; floating?: boolean }) {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(mood.line);
  const [open, setOpen] = useState(true);

  // typewriter effect for the speech bubble
  useEffect(() => {
    if (reduce) { setTyped(mood.line); return; }
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setTyped(mood.line.slice(0, i));
      if (i >= mood.line.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [mood.line, reduce]);

  useEffect(() => setOpen(true), [mood.line]);

  const img = compact ? 92 : 120;
  return (
    <div style={floating ? { position: 'fixed', right: 24, bottom: 64, zIndex: 40, display: 'flex', alignItems: 'flex-end', gap: 10, pointerEvents: 'none' } : { display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="panel"
            style={{ pointerEvents: 'auto', maxWidth: 300, padding: '12px 16px', fontSize: 16, background: 'rgba(16,24,52,0.94)', borderRadius: '16px 16px 4px 16px', position: 'relative' }}
          >
            <div className="faint" style={{ fontSize: 13, marginBottom: 2 }}>Dr. Biscuit</div>
            <div aria-live="polite">{typed}<span style={{ opacity: typed.length < mood.line.length ? 1 : 0 }}>▍</span></div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        key={mood.image}
        onClick={() => setOpen((o) => !o)}
        aria-label="Dr. Biscuit, toggle speech bubble"
        initial={reduce ? false : { scale: 0.85, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 16 }}
        style={{
          pointerEvents: 'auto', width: img, height: img * 1.2, padding: 6, border: '2px solid rgba(94,231,255,0.45)',
          borderRadius: 18, background: '#f6f8ff', boxShadow: '0 0 28px rgba(94,231,255,0.25), 0 10px 30px rgba(0,0,0,0.45)', flex: 'none',
        }}
      >
        <img src={MASCOT_IMAGES[mood.image]} alt="Dr. Biscuit" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </motion.button>
    </div>
  );
}
