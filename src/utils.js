export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Điện thoại / máy cảm ứng: tắt bớt hiệu ứng nặng để cuộn mượt
export const isLowPower = () => window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
