import { useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SocialLogin from '../components/SocialLogin.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const polaroids = [
  { rot: -12, x: -70, y: 20, color: '#ffccbc', emoji: '🌅', label: 'Hoàng hôn' },
  { rot: 8, x: 60, y: -10, color: '#c8e6c9', emoji: '🏕️', label: 'Cắm trại' },
  { rot: -3, x: 0, y: 0, color: '#bbdefb', emoji: '🎂', label: 'Sinh nhật' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register, loginGoogle, loginFacebook } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', displayName: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const shakeControls = useAnimationControls();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const showError = (message) => {
    setError(message);
    shakeControls.start({ x: [0, -12, 12, -8, 8, 0], transition: { duration: 0.4 } });
  };

  const run = async (action) => {
    setError('');
    setBusy(true);
    try {
      await action();
      navigate('/', { replace: true });
    } catch (err) {
      showError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run(() => (isLogin ? login(form.username, form.password) : register(form)));
  };

  return (
    <motion.main
      className="auth-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
    >
      <ThemeToggle floating />
      <section className="auth-hero">
        <motion.h1
          className="brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Kỉ Niệm<span>.</span>
        </motion.h1>
        <motion.p
          className="tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Nơi cất giữ những khoảnh khắc đáng nhớ nhất của bạn.
        </motion.p>

        <div className="polaroid-stack">
          {polaroids.map((p, i) => (
            <motion.div
              key={i}
              className="mini-polaroid"
              initial={{ opacity: 0, y: 120, rotate: 0 }}
              animate={{ opacity: 1, y: [p.y, p.y - 12, p.y], x: p.x, rotate: p.rot }}
              transition={{
                opacity: { delay: 0.3 + i * 0.15 },
                x: { delay: 0.3 + i * 0.15, type: 'spring', stiffness: 120, damping: 14 },
                rotate: { delay: 0.3 + i * 0.15, type: 'spring', stiffness: 120, damping: 14 },
                y: { delay: 0.9 + i * 0.3, duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileHover={{ scale: 1.08, rotate: 0, zIndex: 5 }}
            >
              <div className="mini-photo" style={{ background: p.color }}>{p.emoji}</div>
              <span>{p.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section
        className="auth-card"
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <motion.div animate={shakeControls}>
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={submit}
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, x: -20 }}
          >
            <motion.h2 variants={item}>{isLogin ? 'Chào mừng trở lại 👋' : 'Tạo tài khoản ✨'}</motion.h2>
            <motion.p variants={item} className="muted">
              {isLogin ? 'Đăng nhập để xem lại album của bạn' : 'Bắt đầu lưu giữ kỉ niệm ngay hôm nay'}
            </motion.p>

            <motion.label variants={item} className="field">
              <span>Tên đăng nhập</span>
              <input value={form.username} onChange={update('username')} autoComplete="username" required minLength={3} />
            </motion.label>

            {!isLogin && (
              <motion.label variants={item} className="field">
                <span>Tên hiển thị</span>
                <input value={form.displayName} onChange={update('displayName')} required />
              </motion.label>
            )}

            <motion.label variants={item} className="field">
              <span>Mật khẩu</span>
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={isLogin ? 1 : 6}
              />
            </motion.label>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              variants={item}
              className="btn btn-primary btn-block"
              disabled={busy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {busy ? <span className="dots"><i /><i /><i /></span> : isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </motion.button>

            <SocialLogin
              variants={item}
              busy={busy}
              onGoogle={(credential) => run(() => loginGoogle(credential))}
              onFacebook={(accessToken) => run(() => loginFacebook(accessToken))}
              onError={showError}
            />

            <motion.p variants={item} className="switch">
              {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Đăng ký' : 'Đăng nhập'}</Link>
            </motion.p>
          </motion.form>
        </AnimatePresence>
        </motion.div>
      </motion.section>
    </motion.main>
  );
}
