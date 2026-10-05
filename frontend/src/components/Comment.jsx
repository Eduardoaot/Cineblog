import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { avatarColor, compact, timeAgo } from '../lib/format'
import { IconUpvote } from './Icons'

function countAll(list) {
  return list.reduce((s, c) => s + 1 + countAll(c.replies), 0)
}

export default function Comment({ comment, depth = 0, sortFn }) {
  const [open, setOpen] = useState(depth < 3)
  const hidden = countAll(comment.replies)
  const replies = [...comment.replies].sort(sortFn)
  const color = avatarColor(comment.author)

  return (
    <motion.li
      layout="position"
      className={`comment depth-${Math.min(depth, 4)}`}
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45 }}
    >
      <div className="comment-gutter">
        <span className="avatar" style={{ '--av': color }}>
          {comment.author[0]}
        </span>
        {comment.replies.length > 0 && (
          <button
            className={`thread-line ${open ? '' : 'closed'}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Contraer hilo' : 'Expandir hilo'}
          />
        )}
      </div>

      <div className="comment-body">
        <header className="comment-head">
          <span className="comment-author">{comment.author}</span>
          {comment.isOp && <span className="badge-op">Autor</span>}
          <span className="comment-time">{timeAgo(comment.date)}</span>
        </header>
        <p className="comment-text">{comment.text}</p>
        <footer className="comment-actions">
          <span className="votes" title={`${comment.votes} votos`}>
            <IconUpvote width={15} height={15} />
            {compact(comment.votes)}
          </span>
          {comment.replies.length > 0 && (
            <button className="toggle" onClick={() => setOpen((o) => !o)}>
              {open ? 'Ocultar respuestas' : `Ver ${hidden} ${hidden === 1 ? 'respuesta' : 'respuestas'}`}
            </button>
          )}
        </footer>

        <AnimatePresence initial={false}>
          {open && replies.length > 0 && (
            <motion.ul
              className="replies"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {replies.map((r) => (
                <Comment key={r.id} comment={r} depth={depth + 1} sortFn={sortFn} />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}
