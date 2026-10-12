import { useEffect, useRef } from 'react';

// Tông vàng / cam / tím nhạt để nổi trên nền kem
const COLORS = ['#ffb347', '#ff9f7a', '#f5c26b', '#ff7a59', '#c9a0dc'];
const LAYERS = [
  { count: 0.00016, size: [0.6, 1.2], speed: 0.12, parallax: 10 },  // xa: nhỏ, chậm
  { count: 0.0001, size: [1.2, 2], speed: 0.22, parallax: 22 },
  { count: 0.00004, size: [2.2, 3.4], speed: 0.38, parallax: 40 }, // gần: to, có tia sáng
];

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Vẽ sẵn chấm sáng có quầng cho từng màu, mỗi frame chỉ việc drawImage (nhanh hơn shadowBlur rất nhiều)
function makeSprites() {
  const sprites = {};
  for (const c of COLORS) {
    const s = document.createElement('canvas');
    s.width = s.height = 64;
    const g = s.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.15, c);
    grad.addColorStop(0.45, c + '55');
    grad.addColorStop(1, c + '00');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    sprites[c] = s;
  }
  return sprites;
}

// Sao 4 cánh cho những ngôi sao lớn
function drawSparkle(ctx, x, y, r, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 3);
  ctx.quadraticCurveTo(x, y, x + r * 3, y);
  ctx.quadraticCurveTo(x, y, x, y + r * 3);
  ctx.quadraticCurveTo(x, y, x - r * 3, y);
  ctx.quadraticCurveTo(x, y, x, y - r * 3);
  ctx.fill();
  ctx.restore();
}

export default function StarField() {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sprites = makeSprites();
    let w = 0, h = 0, stars = [], meteors = [], raf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const spawnStars = () => {
      stars = LAYERS.flatMap((layer, li) =>
        Array.from({ length: Math.round(w * h * layer.count) }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: rand(...layer.size),
          color: pick(COLORS),
          phase: Math.random() * Math.PI * 2,
          twinkle: rand(1, 3),
          vx: rand(-0.6, 0.6) * layer.speed,
          vy: -layer.speed * rand(0.5, 1),
          layer: li,
        })));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnStars();
      if (reduced) draw(0);
    };

    const spawnMeteor = () => {
      const fromLeft = Math.random() < 0.5;
      meteors.push({
        x: fromLeft ? rand(-100, w * 0.4) : rand(w * 0.6, w + 100),
        y: rand(-60, h * 0.35),
        vx: (fromLeft ? 1 : -1) * rand(7, 11),
        vy: rand(3, 5),
        life: 1,
        color: pick(COLORS),
      });
    };

    const onMove = (e) => {
      mouse.tx = (e.clientX / w - 0.5) * 2;
      mouse.ty = (e.clientY / h - 0.5) * 2;
    };

    let last = 0;
    let nextMeteor = 1000;
    function draw(t) {
      const dt = Math.min(t - last, 50) || 16;
      last = t;
      ctx.clearRect(0, 0, w, h);
      // Nền tối thì cộng sáng để sao rực hơn, nền sáng thì vẽ bình thường
      const dark = document.documentElement.dataset.theme === 'dark';
      ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

      // Chuột di chuyển thì các lớp sao lệch theo, lớp gần lệch nhiều hơn tạo chiều sâu
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      for (const s of stars) {
        const layer = LAYERS[s.layer];
        if (!reduced) {
          s.x += s.vx * dt * 0.06;
          s.y += s.vy * dt * 0.06;
          if (s.y < -10) { s.y = h + 10; s.x = Math.random() * w; }
          if (s.x < -10) s.x = w + 10;
          if (s.x > w + 10) s.x = -10;
        }
        const alpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.twinkle + s.phase));
        const x = s.x - mouse.x * layer.parallax;
        const y = s.y - mouse.y * layer.parallax;
        const size = s.r * 6;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites[s.color], x - size / 2, y - size / 2, size, size);
        if (s.layer === 2) drawSparkle(ctx, x, y, s.r * 0.9, s.color, alpha * 0.8);
      }
      ctx.globalAlpha = 1;

      if (!reduced) {
        nextMeteor -= dt;
        if (nextMeteor <= 0) { spawnMeteor(); nextMeteor = rand(1500, 4000); }

        meteors = meteors.filter((m) => m.life > 0);
        for (const m of meteors) {
          m.x += m.vx * dt * 0.06;
          m.y += m.vy * dt * 0.06;
          m.life -= dt * 0.0007;
          const tail = 16;
          const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail);
          grad.addColorStop(0, m.color);
          grad.addColorStop(1, m.color + '00');
          ctx.globalAlpha = Math.max(m.life, 0);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail);
          ctx.stroke();
          ctx.drawImage(sprites[m.color], m.x - 10, m.y - 10, 20, 20);
        }

        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
      }
    }

    resize();
    window.addEventListener('resize', resize);
    // Chế độ giảm chuyển động chỉ vẽ một lần, nên đổi theme thì vẽ lại
    const themeObserver = new MutationObserver(() => reduced && draw(0));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (!reduced) {
      window.addEventListener('pointermove', onMove);
      raf = requestAnimationFrame(draw);
    }
    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="bg-stars" />;
}
