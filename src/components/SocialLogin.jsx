import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/client.js';

// Phiên bản Graph API của Facebook, mỗi phiên bản dùng được khoảng 2 năm
const FB_VERSION = 'v23.0';

// Mỗi script SDK chỉ tải một lần dù component mount lại khi chuyển Đăng nhập ↔ Đăng ký
const scripts = {};
const loadScript = (src) => (scripts[src] ??= new Promise((resolve, reject) => {
  const el = document.createElement('script');
  el.src = src;
  el.async = true;
  el.onload = resolve;
  el.onerror = () => { delete scripts[src]; el.remove(); reject(new Error(src)); };
  document.head.appendChild(el);
}));

let providersPromise = null;
const loadProviders = () => (providersPromise ??= api.providers().catch(() => { providersPromise = null; return {}; }));

// Google chỉ cho initialize một lần; callback trỏ tới component đang hiển thị
let googleInitedFor = null;
let googleCallback = () => {};
let fbInited = false;

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
  </svg>
);

export default function SocialLogin({ onGoogle, onFacebook, onError, busy, variants }) {
  const [providers, setProviders] = useState(null);
  const [fbReady, setFbReady] = useState(false);
  const googleRef = useRef(null);
  const latest = useRef();
  latest.current = { onGoogle, onError };

  useEffect(() => {
    let alive = true;
    loadProviders().then((p) => alive && setProviders(p));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const clientId = providers?.googleClientId;
    if (!clientId) return;
    googleCallback = (res) => latest.current.onGoogle(res.credential);
    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        if (!googleRef.current) return;
        if (googleInitedFor !== clientId) {
          window.google.accounts.id.initialize({ client_id: clientId, callback: (res) => googleCallback(res) });
          googleInitedFor = clientId;
        }
        window.google.accounts.id.renderButton(googleRef.current, {
          theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', locale: 'vi',
          width: Math.min(400, googleRef.current.offsetWidth || 400),
        });
      })
      .catch(() => latest.current.onError('Không tải được Google, kiểm tra kết nối mạng'));
  }, [providers]);

  useEffect(() => {
    const appId = providers?.facebookAppId;
    if (!appId) return;
    let alive = true;
    loadScript('https://connect.facebook.net/vi_VN/sdk.js')
      .then(() => {
        if (!fbInited) {
          window.FB.init({ appId, version: FB_VERSION, cookie: false, xfbml: false });
          fbInited = true;
        }
        if (alive) setFbReady(true);
      })
      .catch(() => latest.current.onError('Không tải được Facebook, kiểm tra kết nối mạng'));
    return () => { alive = false; };
  }, [providers]);

  // FB.login phải được gọi ngay trong sự kiện click, nếu không trình duyệt sẽ chặn popup
  const loginFacebook = () => {
    window.FB.login((res) => {
      if (res.authResponse?.accessToken) onFacebook(res.authResponse.accessToken);
    }, { scope: 'public_profile,email' });
  };

  if (!providers?.googleClientId && !providers?.facebookAppId) return null;

  return (
    <motion.div variants={variants} className={`social ${busy ? 'is-busy' : ''}`}>
      <div className="divider"><span>hoặc</span></div>
      {providers.googleClientId && <div ref={googleRef} className="google-btn" />}
      {providers.facebookAppId && (
        <button type="button" className="fb-btn" onClick={loginFacebook} disabled={!fbReady || busy}>
          <FacebookIcon /> Tiếp tục với Facebook
        </button>
      )}
    </motion.div>
  );
}
