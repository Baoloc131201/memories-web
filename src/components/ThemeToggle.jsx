import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getTheme, switchTheme } from '../theme.js';

const STARS = [
  { left: 38, top: 6, delay: 0 },
  { left: 50, top: 18, delay: 0.4 },
  { left: 42, top: 24, delay: 0.8 },
];

export default function ThemeToggle({ floating = false }) {
  const [theme, setTheme] = useState(getTheme);
  const dark = theme === 'dark';

  const toggle = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const next = dark ? 'light' : 'dark';
    switchTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 }, () => setTheme(next));
  };

  return (
    <motion.button
      type="button"
      className={`theme-toggle ${dark ? 'is-dark' : ''} ${floating ? 'theme-floating' : ''}`}
      onClick={toggle}
      aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={dark ? 'Giao diện sáng' : 'Giao diện tối'}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Vài ngôi sao nhỏ lấp lánh khi đang ở chế độ tối */}
      <AnimatePresence>
        {dark && STARS.map((s, i) => (
          <motion.span
            key={i}
            className="tiny-star"
            style={{ left: s.left - 30, top: s.top }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.3, 1, 0.3], scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ opacity: { duration: 1.6, repeat: Infinity, delay: s.delay }, scale: { duration: 0.3 } }}
          >
            ✦
          </motion.span>
        ))}
      </AnimatePresence>
      <motion.span
        className="knob"
        animate={{ x: dark ? 30 : 0, rotate: dark ? 360 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.4, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {dark ? '🌙' : '☀️'}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
