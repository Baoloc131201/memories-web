import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import MemoryCard from '../components/MemoryCard.jsx';
import UploadModal from '../components/UploadModal.jsx';
import Lightbox from '../components/Lightbox.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { clearImageCache, revokeImage } from '../components/SecureImage.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export default function GalleryPage() {
  const { user, logout } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  // null = tất cả, '' = chưa phân loại, còn lại là tên phân loại
  const [category, setCategory] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    api.listMemories()
      .then(setMemories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Phân loại lấy từ chính danh sách ảnh: BE tự xoá phân loại không còn ảnh nào
  const categories = useMemo(() => {
    const counts = new Map();
    memories.forEach((m) => m.category && counts.set(m.category, (counts.get(m.category) || 0) + 1));
    return [...counts].map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [memories]);
  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);
  const uncategorized = memories.filter((m) => !m.category).length;

  // Mục đang chọn bị xoá hết ảnh (hoặc đổi tên) thì quay về "Tất cả"
  const activeCategory = category === null ? null
    : category === '' ? (uncategorized > 0 ? '' : null)
    : categoryNames.includes(category) ? category : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return memories.filter((m) =>
      (activeCategory === null || (m.category || '') === activeCategory)
      && (!q || m.title.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q)));
  }, [memories, query, activeCategory]);

  const years = useMemo(() => new Set(memories.map((m) => m.memoryDate?.slice(0, 4))).size, [memories]);

  const openIndex = filtered.findIndex((m) => m.id === openId);
  const opened = openIndex >= 0 ? filtered[openIndex] : null;

  const sortMemories = (list) =>
    [...list].sort((a, b) => (b.memoryDate || '').localeCompare(a.memoryDate || '') || b.createdAt.localeCompare(a.createdAt));

  const handleCreated = (m) => setMemories((list) => sortMemories([m, ...list]));
  const handleUpdate = async (id, data) => {
    const updated = await api.updateMemory(id, data);
    setMemories((list) => sortMemories(list.map((m) => (m.id === id ? updated : m))));
  };
  const handleDelete = async (id) => {
    const target = memories.find((m) => m.id === id);
    await api.deleteMemory(id);
    setOpenId(null);
    setMemories((list) => list.filter((m) => m.id !== id));
    if (target) setTimeout(() => revokeImage(target.imageUrl), 500);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    clearImageCache();
  };

  return (
    <motion.main
      className="gallery-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <motion.header
        className="topbar"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <div className="brand small">Kỉ Niệm<span>.</span></div>
        <div className="topbar-right">
          <ThemeToggle />
          <div className="avatar" title={user.displayName}>{user.displayName.charAt(0).toUpperCase()}</div>
          <motion.button
            className="btn btn-ghost"
            onClick={handleLogout}
            disabled={loggingOut}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
          >
            {loggingOut ? 'Đang thoát…' : 'Đăng xuất ↪'}
          </motion.button>
        </div>
      </motion.header>

      <section className="hero">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {greeting()}, <em>{user.displayName}</em>
        </motion.h1>
        <motion.p className="muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {memories.length > 0
            ? `Bạn đang lưu giữ ${memories.length} kỉ niệm trải dài ${years} năm.`
            : 'Album của bạn đang chờ khoảnh khắc đầu tiên.'}
        </motion.p>

        <motion.div className="toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="search">
            <span>🔍</span>
            <input placeholder="Tìm kỉ niệm…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowUpload(true)}
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            + Thêm ảnh
          </motion.button>
        </motion.div>

        {categories.length > 0 && (
          <motion.div className="chips category-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <CategoryTab active={activeCategory === null} onClick={() => setCategory(null)} label="Tất cả" count={memories.length} />
            {categories.map((c) => (
              <CategoryTab key={c.name} active={activeCategory === c.name} onClick={() => setCategory(c.name)}
                           label={c.name} count={c.count} />
            ))}
            {uncategorized > 0 && (
              <CategoryTab active={activeCategory === ''} onClick={() => setCategory('')}
                           label="Chưa phân loại" count={uncategorized} />
            )}
          </motion.div>
        )}
      </section>

      {error && <div className="error center">{error}</div>}

      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="polaroid skeleton"><div className="polaroid-photo"><div className="shimmer" /></div><div className="sk-line" /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div className="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div
            className="empty-icon"
            animate={{ rotate: [0, -8, 8, 0], y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {query || activeCategory !== null ? '🔎' : '📷'}
          </motion.div>
          <h3>{query || activeCategory !== null ? 'Không tìm thấy kỉ niệm nào' : 'Chưa có kỉ niệm nào'}</h3>
          {!query && activeCategory === null && (
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>Thêm kỉ niệm đầu tiên</button>
          )}
        </motion.div>
      ) : (
        <LayoutGroup>
          <motion.div layout className="grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((m, i) => (
                <MemoryCard key={m.id} memory={m} index={i} onOpen={(mem) => setOpenId(mem.id)} />
              ))}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {opened && (
              <Lightbox
                key="lightbox"
                memory={opened}
                categories={categoryNames}
                onClose={() => setOpenId(null)}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onPrev={openIndex > 0 ? () => setOpenId(filtered[openIndex - 1].id) : undefined}
                onNext={openIndex < filtered.length - 1 ? () => setOpenId(filtered[openIndex + 1].id) : undefined}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      )}

      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onCreated={handleCreated}
            categories={categoryNames}
            defaultCategory={activeCategory || ''}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}

function CategoryTab({ active, onClick, label, count }) {
  return (
    <motion.button type="button" className={`chip ${active ? 'is-active' : ''}`} onClick={onClick} whileTap={{ scale: 0.94 }}>
      {label} <small>{count}</small>
    </motion.button>
  );
}
