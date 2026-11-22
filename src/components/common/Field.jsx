import { cloneElement, useId } from 'react';

/** Label + control + hint/error, wired for screen readers. Pass one input/select/textarea as the child. */
export default function Field({ label, error, hint, children, className = '' }) {
  const id = useId();
  const msgId = `${id}-msg`;
  const control = cloneElement(children, {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || hint ? msgId : undefined,
  });
  return (
    <div className={`flex flex-col text-caption text-ink-muted ${className}`}>
      <label htmlFor={id}>{label}</label>
      {control}
      {(error || hint) && (
        <span id={msgId} className={`mt-1.5 ${error ? 'text-danger' : ''}`} role={error ? 'alert' : undefined}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
