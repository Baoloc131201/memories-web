import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);
const SERVER_DOWN = [502, 503, 504];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Máy chủ đang ngủ (Render free ngủ sau 15 phút) và đang được đánh thức
  const [waking, setWaking] = useState(false);

  const clearSession = useCallback(() => setUser(null), []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    let cancelled = false;
    let retryTimer;
    // Máy chủ đang ngủ thì request đầu bị treo 30–60 giây: quá 2,5 giây chưa xong là hiện trang chờ
    const slowTimer = setTimeout(() => setWaking(true), 2500);

    const check = async () => {
      try {
        const me = await api.me();
        if (cancelled) return;
        setUser(me);
      } catch (err) {
        if (cancelled) return;
        // Không có status (lỗi mạng) hoặc 502/503/504: máy chủ chưa dậy, thử lại sau 3 giây
        if (!err.status || SERVER_DOWN.includes(err.status)) {
          setWaking(true);
          retryTimer = setTimeout(check, 3000);
          return;
        }
        clearSession();
      }
      clearTimeout(slowTimer);
      setWaking(false);
      setLoading(false);
    };
    check();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
      clearTimeout(retryTimer);
    };
  }, [clearSession]);

  const login = async (username, password) => setUser(await api.login(username, password));
  const register = async (data) => setUser(await api.register(data));
  const loginGoogle = async (credential) => setUser(await api.loginGoogle(credential));
  const loginFacebook = async (accessToken) => setUser(await api.loginFacebook(accessToken));
  const logout = async () => {
    try { await api.logout(); } catch { /* phiên có thể đã hết hạn */ }
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, loading, waking, login, register, loginGoogle, loginFacebook, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
