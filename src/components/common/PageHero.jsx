import Reveal from './Reveal';

/** Centred page opener: eyebrow, large serif title, one line of lead text. */
export default function PageHero({ eyebrow, title, lead, children }) {
  return (
    <section className="container-page flex flex-col items-center gap-6 pb-20 pt-24 text-center md:pt-36">
      {eyebrow && (
        <Reveal as="span" className="eyebrow">
          {eyebrow}
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h1 className="h-display max-w-[920px]">{title}</h1>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className="max-w-prose text-[17px] leading-[1.55] text-ink-muted md:text-lead">{lead}</p>
        </Reveal>
      )}
      {children}
    </section>
  );
}
