// Dr. Biscuit: image + typed speech bubble. Bounces when the mood (image) changes.
// Collapsible: the "–" button hides it into a small icon; clicking the icon brings it back.
// The choice is remembered for the browser session (store.mascotOpen → sessionStorage).
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MASCOT_IMAGES, type MascotMood } from '../../data/mascot';
import { useAppStore } from '../../store/useAppStore';

export default function Mascot({ mood }: { mood: MascotMood }) {
  const reduce = useReducedMotion();
  const open = useAppStore((s) => s.mascotOpen);
  const setOpen = useAppStore((s) => s.setMascotOpen);
  const [typed, setTyped] = useState(mood.line);
  const [bubble, setBubble] = useState(true);

  // typewriter effect for the speech bubble (only while the mascot is open)
  useEffect(() => {
    if (!open) return;
    if (reduce) { setTyped(mood.line); return; }
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setTyped(mood.line.slice(0, i));
      if (i >= mood.line.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [mood.line, reduce, open]);

  useEffect(() => setBubble(true), [mood.line]);

  const box = { position: 'fixed', right: 24, bottom: 64, zIndex: 40 } as const;

  if (!open) {
    return (
      <motion.button
        key="mascot-icon"
        onClick={() => setOpen(true)}
        aria-label="Show Dr. Biscuit"
        title="Show Dr. Biscuit"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{ ...box, bottom: 56, width: 56, height: 56, padding: 0, overflow: 'hidden', borderRadius: '50%', border: '2px solid rgba(94,231,255,0.55)', background: '#f6f8ff', boxShadow: '0 6px 20px rgba(0,0,0,0.45)' }}
      >
        <img src={MASCOT_IMAGES[mood.image]} alt="" style={{ width: '170%', height: '170%', objectFit: 'cover', objectPosition: '50% 18%', marginLeft: '-35%', marginTop: '-2%' }} />
      </motion.button>
    );
  }

  return (
    <div style={{ ...box, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, pointerEvents: 'none' }}>
      <AnimatePresence>
        {bubble && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="panel"
            style={{ pointerEvents: 'auto', maxWidth: 250, padding: '10px 14px', fontSize: 16, background: 'rgba(16,24,52,0.94)', borderRadius: '16px 16px 4px 16px', marginRight: 6 }}
          >
            <div aria-live="polite">{typed}<span style={{ opacity: typed.length < mood.line.length ? 1 : 0 }}>▍</span></div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ position: 'relative', pointerEvents: 'auto' }}>
        <motion.button
          key={mood.image}
          onClick={() => setBubble((b) => !b)}
          aria-label="Dr. Biscuit, show or hide the speech bubble"
          initial={reduce ? false : { scale: 0.85, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 16 }}
          style={{ display: 'block', width: 112, height: 134, padding: 6, border: '2px solid rgba(94,231,255,0.45)', borderRadius: 18, background: '#f6f8ff', boxShadow: '0 0 28px rgba(94,231,255,0.25), 0 10px 30px rgba(0,0,0,0.45)' }}
        >
          <img src={MASCOT_IMAGES[mood.image]} alt="Dr. Biscuit" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </motion.button>
        <button
          onClick={() => setOpen(false)}
          aria-label="Hide Dr. Biscuit"
          title="Hide"
          style={{ position: 'absolute', top: -10, right: -10, width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--panel-border)', background: 'var(--panel-solid)', color: 'var(--text)', fontSize: 16, lineHeight: 1, display: 'grid', placeItems: 'center', padding: 0 }}
        >–</button>
      </div>
    </div>
  );
}
