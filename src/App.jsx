import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import Background from './components/Background.jsx';
import ClickSparkles from './components/ClickSparkles.jsx';
import Footer from './components/Footer.jsx';
import WakingPage from './pages/WakingPage.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  const { loading, waking } = useAuth();
  const location = useLocation();

  if (waking) return <WakingPage />;

  if (loading) {
    return (
      <div className="splash">
        <Background />
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <Background />
      <ClickSparkles />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<GuestOnly><AuthPage mode="login" /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><AuthPage mode="register" /></GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly><AuthPage mode="forgot" /></GuestOnly>} />
          {/* Không chặn khi đang đăng nhập: link trong email có thể được mở ở trình duyệt đang có phiên */}
          <Route path="/reset-password" element={<AuthPage mode="reset" />} />
          <Route path="/" element={<Protected><GalleryPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}
