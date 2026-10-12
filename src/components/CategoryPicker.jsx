import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const normalizeCategory = (s) => s.trim().replace(/\s+/g, ' ');
const sameName = (a, b) => a.toLowerCase() === b.toLowerCase();

// Chọn một phân loại có sẵn hoặc tạo mục mới. value = '' nghĩa là chưa phân loại.
export default function CategoryPicker({ value, onChange, options }) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');

  // Mục mới tạo chưa có trên server thì vẫn hiện như một chip để user thấy mình đã chọn gì
  const isNew = value && !options.some((o) => sameName(o, value));
  const chips = isNew ? [...options, value] : options;

  const commit = () => {
    const name = normalizeCategory(draft).slice(0, 50);
    // Gõ trùng tên mục có sẵn (khác hoa thường) thì chọn luôn mục đó
    if (name) onChange(options.find((o) => sameName(o, name)) ?? name);
    setDraft('');
    setCreating(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.stopPropagation(); setDraft(''); setCreating(false); }
  };

  return (
    <div className="field">
      <span>Phân loại</span>
      <div className="chips">
        <AnimatePresence initial={false}>
          {chips.map((c) => (
            <motion.button
              key={c}
              type="button"
              layout
              className={`chip ${value === c ? 'is-active' : ''}`}
              onClick={() => onChange(value === c ? '' : c)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.94 }}
            >
              {c}{c === value && isNew && <small> · mới</small>}
            </motion.button>
          ))}
        </AnimatePresence>

        {creating ? (
          <div className="chip-input">
            <input
              autoFocus
              value={draft}
              maxLength={50}
              placeholder="vd. Đám cưới"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onBlur={commit}
            />
          </div>
        ) : (
          <button type="button" className="chip chip-add" onClick={() => setCreating(true)}>+ Tạo mục mới</button>
        )}
      </div>
      {options.length === 0 && !value && !creating && (
        <small className="chips-hint">Nhóm ảnh theo chủ đề, ví dụ Đám cưới, Du lịch...</small>
      )}
    </div>
  );
}
