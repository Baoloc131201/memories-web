import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

// Ảnh cần token nên phải fetch dạng blob; cache để lightbox dùng lại ngay.
const cache = new Map();

export function revokeImage(url) {
  const cached = cache.get(url);
  if (cached) {
    cached.then((objUrl) => URL.revokeObjectURL(objUrl)).catch(() => {});
    cache.delete(url);
  }
}

export function clearImageCache() {
  [...cache.keys()].forEach(revokeImage);
}

function load(url) {
  if (!cache.has(url)) {
    const p = api.imageBlob(url).then((blob) => URL.createObjectURL(blob));
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return cache.get(url);
}

// Chỉ tải ảnh khi khung sắp lọt vào màn hình (lazy load). Ảnh đã có trong cache thì hiện luôn.
export default function SecureImage({ src, alt, className, onLoad }) {
  const ref = useRef(null);
  const [objUrl, setObjUrl] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(() => cache.has(src) || typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (visible) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: '400px 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    load(src).then((u) => alive && setObjUrl(u)).catch(() => {});
    return () => { alive = false; };
  }, [src, visible]);

  return (
    <div ref={ref} className={`secure-img ${loaded ? 'is-loaded' : ''} ${className || ''}`}>
      {!loaded && <div className="shimmer" />}
      {objUrl && (
        <img
          src={objUrl}
          alt={alt}
          draggable={false}
          decoding="async"
          onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        />
      )}
    </div>
  );
}
