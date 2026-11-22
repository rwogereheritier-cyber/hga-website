import { LinkAction } from '../../components/common/Button';

/** Temporary page for routes not built yet. */
export default function ComingSoon({ title }) {
  return (
    <section className="container-page section flex flex-col items-center gap-6 text-center">
      <span className="eyebrow">In progress</span>
      <h1 className="h-section">{title}</h1>
      <p className="max-w-prose text-lead text-ink-muted">This page is being built next.</p>
      <LinkAction to="/">Back to home</LinkAction>
    </section>
  );
}
