import { motion } from 'framer-motion';
import SecureImage from './SecureImage.jsx';
import { formatDate } from '../utils.js';

export default function MemoryCard({ memory, index, onOpen }) {
  // Mỗi ảnh nghiêng nhẹ một chút cho giống polaroid dán tường
  const tilt = ((memory.id * 7) % 7) - 3;

  return (
    <motion.article
      layout
      className="polaroid"
      initial={{ opacity: 0, y: 40, rotate: tilt * 2, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6, rotate: tilt * 4, transition: { duration: 0.3 } }}
      transition={{ type: 'spring', stiffness: 180, damping: 20, delay: Math.min(index, 12) * 0.05 }}
      whileHover={{ rotate: 0, y: -8, scale: 1.03, zIndex: 2 }}
      onClick={() => onOpen(memory)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(memory)}
    >
      <span className="tape" />
      <motion.div layoutId={`photo-${memory.id}`} className="polaroid-photo">
        <SecureImage src={memory.imageUrl} alt={memory.title} />
      </motion.div>
      <div className="polaroid-caption">
        <h3>{memory.title}</h3>
        <time>{formatDate(memory.memoryDate)}</time>
        {memory.category && <span className="tag">{memory.category}</span>}
      </div>
    </motion.article>
  );
}
