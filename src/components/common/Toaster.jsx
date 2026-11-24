import { AnimatePresence, motion } from 'framer-motion';
import { useToasts } from '../../lib/toast';

export default function Toaster() {
  const toasts = useToasts();
  return (
    <div aria-live="polite" className="pointer-events-none fixed top-5 left-1/2 z-[60] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className="flex items-center gap-3 rounded-full bg-charcoal px-5 py-3 text-[14px] text-white shadow-overlay"
          >
            <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${t.tone === 'error' ? 'bg-[#F09595]' : 'bg-[#7FD1A0]'}`} />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
