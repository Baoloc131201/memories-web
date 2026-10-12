import { motion } from 'framer-motion';
import StarField from './StarField.jsx';

const blobs = [
  { color: 'var(--blob-1)', size: 520, x: '-10%', y: '-15%', dur: 22 },
  { color: 'var(--blob-2)', size: 420, x: '70%', y: '5%', dur: 26 },
  { color: 'var(--blob-3)', size: 480, x: '40%', y: '65%', dur: 30 },
  { color: 'var(--blob-4)', size: 360, x: '-5%', y: '70%', dur: 24 },
];

const sparkles = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: (i * 1.3) % 9,
  dur: 10 + (i % 5) * 2,
  size: 8 + (i % 4) * 4,
  char: ['✦', '♥', '✧', '❀'][i % 4],
}));

export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="bg-blob"
          style={{ background: b.color, width: b.size, height: b.size, left: b.x, top: b.y }}
          animate={{ x: [0, 60, -40, 0], y: [0, -50, 30, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <StarField />
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          className="bg-sparkle"
          style={{ left: s.left, fontSize: s.size }}
          initial={{ y: '105vh', opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.8, 0.8, 0], rotate: 360 }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'linear' }}
        >
          {s.char}
        </motion.span>
      ))}
      <div className="bg-grain" />
    </div>
  );
}
