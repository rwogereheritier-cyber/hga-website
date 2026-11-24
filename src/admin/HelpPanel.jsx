import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { guidesFor } from '../data/help';
import { Guide } from './Help';

/** "?" button that opens the guides for the current screen in a side panel. */
export default function HelpPanel({ area }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const list = guidesFor(area);

  useEffect(() => {
    setOpen(false);
    setActive(null);
  }, [area]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!list.length) return null;
  const guide = active || (list.length === 1 ? list[0] : null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Help for this screen"
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-hairline px-4 text-[13px] font-medium text-charcoal hover:border-charcoal"
      >
        <span aria-hidden="true" className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-current text-[11px]">?</span>
        Help for this screen
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-[rgba(41,37,42,0.3)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              role="dialog"
              aria-label="Help"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[440px] flex-col gap-6 overflow-y-auto bg-white p-8 shadow-overlay"
            >
              <div className="flex items-center justify-between">
                {guide && list.length > 1 ? (
                  <button type="button" onClick={() => setActive(null)} className="text-[14px] font-medium text-burgundy">
                    ‹ Guides for this screen
                  </button>
                ) : (
                  <span className="text-[14px] text-ink-muted">Help for this screen</span>
                )}
                <button type="button" onClick={() => setOpen(false)} aria-label="Close help" className="flex h-9 w-9 items-center justify-center rounded-full text-[18px] text-ink-muted hover:bg-grey-100">
                  ×
                </button>
              </div>
              {guide ? (
                <Guide guide={guide} />
              ) : (
                <ul className="border-b border-hairline">
                  {list.map((g) => (
                    <li key={g.id} className="border-t border-hairline">
                      <button type="button" onClick={() => setActive(g)} className="flex w-full flex-col gap-1 py-4 text-left hover:text-burgundy">
                        <span className="text-[15px] font-medium">{g.title}</span>
                        <span className="text-[13px] text-ink-muted">{g.summary}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/help" onClick={() => setOpen(false)} className="mt-auto text-[14px] font-medium text-burgundy">
                All help guides ›
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
