import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Background from '../components/Background.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

// Chữ "z" bay lên từ mặt trăng đang ngủ
const ZZZ = [
  { x: 18, size: 18, delay: 0 },
  { x: 34, size: 24, delay: 0.7 },
  { x: 52, size: 30, delay: 1.4 },
];

// Trang chờ khi máy chủ (Render free) đang khởi động lại sau khi ngủ.
// AuthContext tự thử lại, máy chủ dậy là vào app luôn, không cần tải lại trang.
export default function WakingPage() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.main
      className="waking-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Background />
      <ThemeToggle floating />

      <motion.section
        className="waking-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="waking-moon" aria-hidden="true">
          <motion.span
            className="moon"
            animate={{ rotate: [-6, 6, -6], y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            🌙
          </motion.span>
          {ZZZ.map((z, i) => (
            <motion.span
              key={i}
              className="zzz"
              style={{ left: `calc(50% + ${z.x}px)`, fontSize: z.size }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -50, x: [0, 8, -4] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: z.delay, ease: 'easeOut' }}
            >
              z
            </motion.span>
          ))}
        </div>

        <h2>The server is starting up</h2>
        <p className="muted">Please come back in a minute.</p>
        <p className="waking-note">
          Máy chủ đang được đánh thức, thường mất khoảng 30–60 giây.
          Trang sẽ tự vào khi máy chủ sẵn sàng.
        </p>

        <div className="waking-progress" role="status" aria-live="polite">
          <span className="dots"><i /><i /><i /></span>
          <span>Đã chờ {seconds}s</span>
        </div>
      </motion.section>
    </motion.main>
  );
}
