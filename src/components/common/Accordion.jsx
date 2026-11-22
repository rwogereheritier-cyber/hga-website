import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** Hairline accordion. items: [{ q, a }] */
export default function Accordion({ items, defaultOpen = -1 }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-hairline">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="border-t border-hairline">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 py-6 text-left text-[18px] font-medium md:py-7 md:text-[19px]"
            >
              {f.q}
              <span aria-hidden="true" className="text-[20px] text-ink-muted">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-7 text-[16px] leading-[1.65] text-ink-muted">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
