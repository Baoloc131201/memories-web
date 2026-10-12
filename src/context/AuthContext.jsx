import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => setUser(null), []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    api.me().then(setUser).catch(clearSession).finally(() => setLoading(false));
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
    <AuthContext.Provider value={{ user, loading, login, register, loginGoogle, loginFacebook, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
