import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.6" />
    <path d="M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.5" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="M2 2l20 20" />
  </svg>
);

// Ô mật khẩu có nút con mắt để hiện / ẩn mật khẩu
export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-wrap">
      <input {...props} type={visible ? 'text' : 'password'} />
      <motion.button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        // Giữ con trỏ trong ô nhập khi bấm nút
        onMouseDown={(e) => e.preventDefault()}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={visible}
        title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        whileTap={{ scale: 0.85 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.i
            key={visible ? 'off' : 'on'}
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
            transition={{ duration: 0.15 }}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </motion.i>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
