import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../api/client.js';
import { today } from '../utils.js';
import { compressImage, formatSize } from '../compressImage.js';
import Modal from './Modal.jsx';
import CategoryPicker from './CategoryPicker.jsx';

const ACCEPT = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function UploadModal({ onClose, onCreated, categories, defaultCategory = '' }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', memoryDate: today(), category: defaultCategory });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [sizeInfo, setSizeInfo] = useState('');
  const inputRef = useRef();
  const pickId = useRef(0);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = async (f) => {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) { setError('Chỉ hỗ trợ ảnh JPG, PNG, GIF, WEBP'); return; }
    if (f.size > 15 * 1024 * 1024) { setError('Ảnh quá lớn (tối đa 15MB)'); return; }
    setError('');
    if (!form.title) setForm((s) => ({ ...s, title: f.name.replace(/\.[^.]+$/, '').slice(0, 120) }));

    // Bỏ qua kết quả nén cũ nếu người dùng đã chọn ảnh khác trong lúc đang nén
    const id = ++pickId.current;
    setCompressing(true);
    const out = await compressImage(f);
    if (id !== pickId.current) return;
    setCompressing(false);
    setFile(out);
    setPreview(URL.createObjectURL(out));
    setSizeInfo(out === f ? formatSize(f.size) : `${formatSize(f.size)} → ${formatSize(out.size)}`);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (compressing) return;
    if (!file) { setError('Vui lòng chọn ảnh'); return; }
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('memoryDate', form.memoryDate);
      if (form.category) fd.append('category', form.category);
      onCreated(await api.createMemory(fd));
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={busy ? undefined : onClose} className="upload-modal">
      <form onSubmit={submit}>
        <h2>Thêm kỉ niệm mới 📸</h2>

        <motion.div
          className={`dropzone ${dragging ? 'is-dragging' : ''} ${preview ? 'has-preview' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); }}
          animate={{ scale: dragging ? 1.03 : 1 }}
          whileHover={{ scale: 1.01 }}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.img
                key={preview}
                src={preview}
                alt="Xem trước"
                initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
              />
            ) : (
              <motion.div key="empty" className="dz-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.span
                  className="dz-icon"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🖼️
                </motion.span>
                <p><b>Kéo thả ảnh</b> vào đây hoặc bấm để chọn</p>
                <small>JPG, PNG, GIF, WEBP · tối đa 15MB</small>
              </motion.div>
            )}
          </AnimatePresence>
          {compressing && <div className="dz-status">Đang nén ảnh...</div>}
          {!compressing && sizeInfo && <div className="dz-status">{sizeInfo}</div>}
          <input ref={inputRef} type="file" accept={ACCEPT.join(',')} hidden onChange={(e) => pick(e.target.files[0])} />
        </motion.div>

        <label className="field">
          <span>Tiêu đề</span>
          <input value={form.title} maxLength={120} required
                 onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="field">
          <span>Ngày kỉ niệm</span>
          <input type="date" value={form.memoryDate} max={today()}
                 onChange={(e) => setForm({ ...form, memoryDate: e.target.value })} />
        </label>
        <CategoryPicker value={form.category} options={categories}
                        onChange={(category) => setForm((s) => ({ ...s, category }))} />
        <label className="field">
          <span>Ghi chú</span>
          <textarea rows={3} maxLength={2000} value={form.description} placeholder="Hôm đó có chuyện gì vui..."
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>

        <AnimatePresence>
          {error && (
            <motion.div className="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>Huỷ</button>
          <motion.button className="btn btn-primary" disabled={busy || compressing} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
            {busy ? <span className="dots"><i /><i /><i /></span> : 'Lưu kỉ niệm'}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}
