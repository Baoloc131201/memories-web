// Logo Bảo Lộc: chữ B kèm chồi lộc non. Chữ dùng font của trang nên đổi màu theo theme.
export default function Logo({ size = 40, showText = true, className = '' }) {
  return (
    <span className={`logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden={showText} role={showText ? undefined : 'img'} aria-label={showText ? undefined : 'Bảo Lộc'}>
        <defs>
          <linearGradient id="bl-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb38a" />
            <stop offset="1" stopColor="#ff6b4a" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#bl-bg)" />
        <path d="M22 17V47M22 17H32a7 7 0 0 1 0 14H22M22 31H34a8 8 0 0 1 0 16H22" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M37 14C37 8 42 5 49 5C49 11 45 14 37 14Z" fill="#ffe9a8" />
        <path d="M38.5 12.8L46 7.5" stroke="#ff8a65" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {showText && (
        <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: size * 0.6, letterSpacing: '-0.5px', color: 'var(--ink)' }}>
          Bảo Lộc<span style={{ color: 'var(--accent)' }}>.</span>
        </span>
      )}
    </span>
  );
}
