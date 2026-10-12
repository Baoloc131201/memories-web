import { flushSync } from 'react-dom';

const KEY = 'theme';

// index.html đã đặt data-theme trước khi React chạy để không bị nháy sáng khi tải trang
export const getTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function saveTheme(theme) {
  try { localStorage.setItem(KEY, theme); } catch { /* chế độ ẩn danh, chặn storage */ }
}

// Đổi theme kèm hiệu ứng vòng tròn lan ra từ vị trí nút (trình duyệt không hỗ trợ thì đổi ngay)
export function switchTheme(next, origin, apply) {
  const set = () => {
    document.documentElement.dataset.theme = next;
    saveTheme(next);
    flushSync(apply);
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced) { set(); return; }

  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(set).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}
