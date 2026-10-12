import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SecureImage from './SecureImage.jsx';
import CategoryPicker from './CategoryPicker.jsx';
import { formatDate } from '../utils.js';

export default function Lightbox({ memory, categories, onClose, onDelete, onUpdate, onPrev, onNext }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState(memory);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(memory);
    setEditing(false);
    setConfirming(false);
    setError('');
  }, [memory]);

  useEffect(() => {
    const onKey = (e) => {
      if (editing) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [editing, onClose, onPrev, onNext]);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try { await fn(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const save = () => run(async () => {
    await onUpdate(memory.id, {
      title: form.title, description: form.description, memoryDate: form.memoryDate, category: form.category || null,
    });
    setEditing(false);
  });

  return (
    <motion.div
      className="overlay lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && !editing && onClose()}
    >
      {onPrev && <button className="nav-btn prev" onClick={onPrev} aria-label="Ảnh trước">‹</button>}
      {onNext && <button className="nav-btn next" onClick={onNext} aria-label="Ảnh sau">›</button>}

      <div className="lightbox-inner">
        <motion.div layoutId={`photo-${memory.id}`} className="lightbox-photo">
          <SecureImage src={memory.imageUrl} alt={memory.title} />
        </motion.div>

        <motion.aside
          className="lightbox-info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ delay: 0.15 }}
        >
          <button className="close-btn" onClick={onClose} aria-label="Đóng">✕</button>

          {editing ? (
            <>
              <label className="field"><span>Tiêu đề</span>
                <input value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label className="field"><span>Ngày</span>
                <input type="date" value={form.memoryDate || ''} onChange={(e) => setForm({ ...form, memoryDate: e.target.value })} />
              </label>
              <CategoryPicker value={form.category || ''} options={categories}
                              onChange={(category) => setForm((s) => ({ ...s, category }))} />
              <label className="field"><span>Ghi chú</span>
                <textarea rows={5} maxLength={2000} value={form.description || ''}
                          onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
            </>
          ) : (
            <>
              <div className="row">
                <time>{formatDate(memory.memoryDate)}</time>
                {memory.category && <span className="tag">{memory.category}</span>}
              </div>
              <h2>{memory.title}</h2>
              <p className="desc">{memory.description || <i className="muted">Chưa có ghi chú</i>}</p>
            </>
          )}

          {error && <div className="error">{error}</div>}

          <div className="lightbox-actions">
            <AnimatePresence mode="wait" initial={false}>
              {editing ? (
                <motion.div key="edit" className="row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <button className="btn btn-ghost" onClick={() => { setEditing(false); setForm(memory); }} disabled={busy}>Huỷ</button>
                  <button className="btn btn-primary" onClick={save} disabled={busy || !form.title?.trim()}>Lưu</button>
                </motion.div>
              ) : confirming ? (
                <motion.div key="confirm" className="row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <span className="muted">Xoá kỉ niệm này?</span>
                  <button className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={busy}>Không</button>
                  <button className="btn btn-danger" onClick={() => run(() => onDelete(memory.id))} disabled={busy}>Xoá</button>
                </motion.div>
              ) : (
                <motion.div key="view" className="row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <button className="btn btn-ghost" onClick={() => setEditing(true)}>✏️ Sửa</button>
                  <button className="btn btn-ghost danger-text" onClick={() => setConfirming(true)}>🗑️ Xoá</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
