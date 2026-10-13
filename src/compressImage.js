// Nén ảnh ở trình duyệt trước khi upload: thu nhỏ cạnh dài về tối đa MAX_SIDE và chuyển sang WebP.
const MAX_SIDE = 1920;
const QUALITY = 0.8;

const toBlob = (canvas, type) => new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

async function encodeWebpWasm(ctx, canvas) {
  try {
    const { default: encode } = await import('@jsquash/webp/encode');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return new Blob([await encode(data, { quality: QUALITY * 100 })], { type: 'image/webp' });
  } catch {
    return null;
  }
}

export async function compressImage(file) {
  // GIF động sẽ mất chuyển động nếu vẽ qua canvas, nên giữ nguyên
  if (file.type === 'image/gif') return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file; // trình duyệt không đọc được ảnh → gửi bản gốc
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await toBlob(canvas, 'image/webp');
  let type = 'image/webp';
  let ext = '.webp';
  // Safari không encode được WebP bằng canvas (toBlob trả về PNG) → encode bằng WASM (chỉ tải khi cần)
  if (!blob || blob.type !== 'image/webp') blob = await encodeWebpWasm(ctx, canvas);
  // WASM cũng lỗi (vd. mất mạng khi tải file .wasm) → dùng JPEG, phủ nền trắng cho vùng trong suốt
  if (!blob) {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    blob = await toBlob(canvas, 'image/jpeg');
    type = 'image/jpeg';
    ext = '.jpg';
  }

  // Ảnh gốc vốn đã nhỏ hơn (vd. WebP sẵn) thì giữ bản gốc
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + ext, { type, lastModified: file.lastModified });
}

export const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
