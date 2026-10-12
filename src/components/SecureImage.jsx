import { useEffect, useState } from 'react';
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

export default function SecureImage({ src, alt, className, onLoad }) {
  const [objUrl, setObjUrl] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    load(src).then((u) => alive && setObjUrl(u)).catch(() => {});
    return () => { alive = false; };
  }, [src]);

  return (
    <div className={`secure-img ${loaded ? 'is-loaded' : ''} ${className || ''}`}>
      {!loaded && <div className="shimmer" />}
      {objUrl && (
        <img
          src={objUrl}
          alt={alt}
          draggable={false}
          onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        />
      )}
    </div>
  );
}
