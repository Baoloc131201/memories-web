import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CHARS = ['✦', '✧', '★', '♥'];
const COLORS = ['#ffb347', '#ff9f7a', '#f5c26b', '#ff7a59', '#c9a0dc'];
const COUNT = 8;

// Bấm chuột thì bung ra một chùm sao nhỏ, nằm trên cùng nhưng không chặn click
export default function ClickSparkles() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let id = 0;
    const onDown = (e) => {
      // Không bung khi gõ chữ hay kéo thả trong ô nhập
      if (e.target.closest('input, textarea, select')) return;
      const burst = {
        id: ++id,
        x: e.clientX,
        y: e.clientY,
        parts: Array.from({ length: COUNT }, (_, i) => {
          const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 30 + Math.random() * 30;
          return {
            dx: Math.cos(angle) * dist,
            dy: Math.sin(angle) * dist,
            char: CHARS[i % CHARS.length],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: 10 + Math.random() * 8,
          };
        }),
      };
      setBursts((list) => [...list.slice(-5), burst]);
      setTimeout(() => setBursts((list) => list.filter((b) => b.id !== burst.id)), 700);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <div className="click-sparkles" aria-hidden="true">
      {bursts.map((b) => (
        <div key={b.id} className="burst" style={{ left: b.x, top: b.y }}>
          {b.parts.map((p, i) => (
            <motion.span
              key={i}
              style={{ color: p.color, fontSize: p.size }}
              initial={{ x: 0, y: 0, scale: 0.3, opacity: 1, rotate: 0 }}
              animate={{ x: p.dx, y: p.dy, scale: 1, opacity: 0, rotate: 180 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            >
              {p.char}
            </motion.span>
          ))}
        </div>
      ))}
    </div>
  );
}
