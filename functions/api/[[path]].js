// Cloudflare Pages Function: chuyển mọi request /api/* sang BE trên Render.
// Trình duyệt chỉ thấy một domain (*.pages.dev) nên cookie HttpOnly + SameSite=Strict vẫn hoạt động
// như khi chạy ở máy với Vite proxy, không phải mở CORS hay đổi sang SameSite=None.
export async function onRequest({ request, env }) {
  if (!env.BACKEND_URL) {
    return Response.json({ status: 500, message: 'Chưa cấu hình BACKEND_URL' }, { status: 500 });
  }

  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, env.BACKEND_URL);

  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', 'https');
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) headers.set('X-Forwarded-For', ip);

  try {
    const res = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });
    // Giữ nguyên status, body và các header Set-Cookie của BE
    return new Response(res.body, res);
  } catch {
    // Render gói free ngủ sau 15 phút, lần gọi đầu có thể mất 30–60 giây hoặc lỗi
    return Response.json({ status: 503, message: 'Máy chủ đang khởi động, thử lại sau ít giây nhé' }, { status: 503 });
  }
}
