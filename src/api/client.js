// Token nằm trong cookie HttpOnly do BE đặt; JS không đọc/ghi token, trình duyệt tự gửi kèm.
// Access token sống 15 phút. Hết hạn thì gọi /api/auth/refresh để BE cấp token mới rồi gửi lại request.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

// Các API này trả 401 vì lý do khác (sai mật khẩu, refresh hết hạn...), không thử refresh
const NO_REFRESH = [
  '/api/auth/login', '/api/auth/register', '/api/auth/google', '/api/auth/facebook',
  '/api/auth/refresh', '/api/auth/logout',
];

// Nhiều request hết hạn cùng lúc (vd. tải nhiều ảnh) chỉ gọi refresh một lần
let refreshing = null;
const refreshSession = () => {
  refreshing ??= fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
};

async function request(path, { method = 'GET', body, raw = false } = {}) {
  const headers = {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const send = () => fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let res = await send();
  if (res.status === 401 && !NO_REFRESH.includes(path)) {
    // Gửi lại kể cả khi refresh thất bại: tab khác có thể vừa refresh xong và cookie đã là token mới
    await refreshSession();
    res = await send();
    if (res.status === 401) onUnauthorized();
  }
  if (!res.ok) {
    let message = 'Có lỗi xảy ra, thử lại nhé';
    try { message = (await res.json()).message || message; } catch { /* body rỗng */ }
    throw new Error(message);
  }
  if (raw) return res;
  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: data }),
  loginGoogle: (credential) => request('/api/auth/google', { method: 'POST', body: { credential } }),
  loginFacebook: (accessToken) => request('/api/auth/facebook', { method: 'POST', body: { accessToken } }),
  providers: () => request('/api/auth/providers'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),
  listMemories: () => request('/api/memories'),
  createMemory: (formData) => request('/api/memories', { method: 'POST', body: formData }),
  updateMemory: (id, data) => request(`/api/memories/${id}`, { method: 'PUT', body: data }),
  deleteMemory: (id) => request(`/api/memories/${id}`, { method: 'DELETE' }),
  imageBlob: async (url) => (await request(url, { raw: true })).blob(),
};
