import { motion, useReducedMotion } from 'framer-motion';

/** Fades content in and lifts it 12px the first time it scrolls into view.
 *  With reduced motion turned on, it renders without movement. */
export default function Reveal({ children, delay = 0, as = 'div', className = '' }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  );
}
