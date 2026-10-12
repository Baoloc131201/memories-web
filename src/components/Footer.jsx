import Logo from './Logo.jsx';

const CONTACTS = [
  {
    label: 'Điện thoại', value: '0337 041 207', href: 'tel:0337041207',
    icon: <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />,
  },
  {
    label: 'Email', value: 'baoloc131201@gmail.com', href: 'mailto:baoloc131201@gmail.com',
    icon: <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v.5l8 5 8-5V6zm16 2.85-8 5-8-5V18h16z" />,
  },
  {
    label: 'Facebook', value: 'facebook.com/bao.loc.663694', href: 'https://www.facebook.com/bao.loc.663694/', external: true,
    icon: <path d="M14 8V6.5c0-.7.15-1.5 1.3-1.5H17V2h-2.6C11.6 2 11 3.9 11 5.9V8H9v3h2v11h3V11h2.6l.4-3z" />,
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-about">
          <Logo size={40} />

        </div>
        <ul className="footer-contacts">
          {CONTACTS.map((c) => (
            <li key={c.label}>
              <a href={c.href} {...(c.external && { target: '_blank', rel: 'noopener noreferrer' })}>
                <span className="footer-icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{c.icon}</svg></span>
                <span><small>{c.label}</small>{c.value}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer-bottom muted">© {new Date().getFullYear()} Huỳnh Bảo Lộc</div>
    </footer>
  );
}
