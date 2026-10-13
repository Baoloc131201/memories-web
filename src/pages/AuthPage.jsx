import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import SocialLogin from '../components/SocialLogin.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import PasswordInput from '../components/PasswordInput.jsx';

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

const TEXT = {
  login: { title: 'Chào mừng trở lại 👋', sub: 'Đăng nhập để xem lại album của bạn', button: 'Đăng nhập' },
  register: { title: 'Tạo tài khoản ✨', sub: 'Bắt đầu lưu giữ kỉ niệm ngay hôm nay', button: 'Đăng ký' },
  forgot: { title: 'Quên mật khẩu? 🔑', sub: 'Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu', button: 'Gửi link' },
  reset: { title: 'Đặt mật khẩu mới 🔒', sub: 'Chọn mật khẩu mới cho tài khoản của bạn', button: 'Đổi mật khẩu' },
};

// mode: login | register | forgot (nhập email nhận link) | reset (mở từ link trong email, có ?token=)
export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  const isReset = mode === 'reset';
  const { login, register, loginGoogle, loginFacebook, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ username: '', email: '', displayName: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  // Trang khác chuyển sang kèm thông báo (vd. đổi mật khẩu xong → trang login)
  const [notice, setNotice] = useState(location.state?.notice || '');
  // Trang đặt lại mật khẩu: kiểm tra link trước khi hiện form (checking | valid | invalid)
  const [tokenStatus, setTokenStatus] = useState(token ? 'checking' : 'invalid');

  useEffect(() => {
    if (!isReset || !token) return;
    let cancelled = false;
    api.validateResetToken(token)
      .then(() => !cancelled && setTokenStatus('valid'))
      .catch(() => !cancelled && setTokenStatus('invalid'));
    return () => { cancelled = true; };
  }, [isReset, token]);
  const [busy, setBusy] = useState(false);
  const shakeControls = useAnimationControls();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const showError = (message) => {
    setError(message);
    shakeControls.start({ x: [0, -12, 12, -8, 8, 0], transition: { duration: 0.4 } });
  };

  const run = async (action) => {
    setError('');
    setNotice('');
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

  const submit = async (e) => {
    e.preventDefault();
    if (isLogin) return run(() => login(form.username, form.password));
    if (isRegister) {
      const { username, email, displayName, password } = form;
      return run(() => register({ username, email, displayName, password }));
    }
    if (isReset && form.password !== form.confirm) return showError('Mật khẩu nhập lại không khớp');

    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (isForgot) {
        await api.forgotPassword(form.email);
        setNotice(`Link đặt lại mật khẩu đã được gửi tới ${form.email.trim()}. Nhớ kiểm tra cả mục Spam nhé.`);
      } else {
        await api.resetPassword(token, form.password);
        // Mọi phiên đã bị BE thu hồi; xoá luôn phiên ở trình duyệt này (nếu có) để vào được trang login
        await logout();
        // replace: link có token không còn trong lịch sử, bấm Back không quay lại được
        navigate('/login', { replace: true, state: { notice: 'Đổi mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.' } });
        return;
      }
    } catch (err) {
      // Link vừa hết hạn hoặc đã được dùng ở tab khác
      if (isReset && err.status === 400) setTokenStatus('invalid');
      showError(err.message);
    }
    setBusy(false);
  };

  const showResetForm = isReset && tokenStatus === 'valid';

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
            <motion.h2 variants={item}>{TEXT[mode].title}</motion.h2>
            <motion.p variants={item} className="muted">{TEXT[mode].sub}</motion.p>

            {(isLogin || isRegister) && (
              <motion.label variants={item} className="field">
                <span>{isLogin ? 'Tên đăng nhập hoặc email' : 'Tên đăng nhập'}</span>
                <input value={form.username} onChange={update('username')} autoComplete="username" required minLength={isLogin ? 1 : 3} />
              </motion.label>
            )}

            {(isRegister || isForgot) && (
              <motion.label variants={item} className="field">
                <span>Email</span>
                <input type="email" value={form.email} onChange={update('email')} autoComplete="email" required maxLength={254} />
              </motion.label>
            )}

            {isRegister && (
              <motion.label variants={item} className="field">
                <span>Tên hiển thị</span>
                <input value={form.displayName} onChange={update('displayName')} required />
              </motion.label>
            )}

            {isReset && tokenStatus === 'checking' && (
              <motion.p variants={item} className="muted">Đang kiểm tra link...</motion.p>
            )}

            {isReset && tokenStatus === 'invalid' && !error && (
              <motion.div variants={item} className="error">
                Link đặt lại mật khẩu đã được sử dụng hoặc đã hết hạn. Hãy yêu cầu gửi link mới.
              </motion.div>
            )}

            {(isLogin || isRegister || showResetForm) && (
              <motion.label variants={item} className="field">
                <span>{isReset ? 'Mật khẩu mới' : 'Mật khẩu'}</span>
                <PasswordInput
                  value={form.password}
                  onChange={update('password')}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={isLogin ? 1 : 6}
                />
              </motion.label>
            )}

            {showResetForm && (
              <motion.label variants={item} className="field">
                <span>Nhập lại mật khẩu mới</span>
                <PasswordInput value={form.confirm} onChange={update('confirm')} autoComplete="new-password" required minLength={6} />
              </motion.label>
            )}

            {isLogin && (
              <motion.p variants={item} className="forgot-link">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </motion.p>
            )}

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
              {notice && (
                <motion.div
                  className="notice"
                  role="status"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {notice}
                </motion.div>
              )}
            </AnimatePresence>

            {(!isReset || showResetForm) && (
              <motion.button
                variants={item}
                className="btn btn-primary btn-block"
                disabled={busy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {busy ? <span className="dots"><i /><i /><i /></span> : TEXT[mode].button}
              </motion.button>
            )}

            {(isLogin || isRegister) && (
              <SocialLogin
                variants={item}
                busy={busy}
                onGoogle={(credential) => run(() => loginGoogle(credential))}
                onFacebook={(accessToken) => run(() => loginFacebook(accessToken))}
                onError={showError}
              />
            )}

            <motion.p variants={item} className="switch">
              {isLogin && <>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></>}
              {isRegister && <>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></>}
              {isForgot && <>Nhớ ra mật khẩu rồi? <Link to="/login">Đăng nhập</Link></>}
              {isReset && <><Link to="/forgot-password">Gửi lại link</Link> · <Link to="/login">Đăng nhập</Link></>}
            </motion.p>
          </motion.form>
        </AnimatePresence>
        </motion.div>
      </motion.section>
    </motion.main>
  );
}
