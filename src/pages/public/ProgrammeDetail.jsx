import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../../components/common/Button';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import Reveal from '../../components/common/Reveal';
import { getProgramme } from '../../data/services';
import { money } from '../../lib/format';
import { useStore } from '../../lib/store';
import ComingSoon from './ComingSoon';

const steps = [
  ['Book a time', 'Pick a slot shown in your own time zone.'],
  ['Meet on Zoom', 'A focused one-to-one session with Hetty.'],
  ['Follow your plan', 'Leave with written next steps and resources.'],
];

export default function ProgrammeDetail() {
  const { slug } = useParams();
  const p = getProgramme(slug);
  const [open, setOpen] = useState(-1);
  const consultations = useStore('consultations');
  if (!p) return <ComingSoon title="Programme not found" />;
  const sessions = p.consultations.map((id) => consultations.find((c) => c.id === id)).filter(Boolean);

  return (
    <>
      <div className="border-b border-hairline">
        <div className="container-page flex h-[52px] items-center justify-between gap-4">
          <span className="text-[16px] font-medium">{p.category}</span>
          <span className="flex items-center gap-4 text-[14px]">
            <span className="hidden text-ink-muted sm:inline">
              From {money(Math.min(...sessions.map((s) => s.price)))}
            </span>
            <Button to={`/consultations?service=${sessions[0].id}`} size="sm">
              Book
            </Button>
          </span>
        </div>
      </div>

      <section className="container-page flex flex-col items-center gap-6 pb-20 pt-24 text-center md:pb-24 md:pt-36">
        <Reveal as="span" className="eyebrow">
          {p.category}
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="h-display max-w-[900px]">{p.title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-prose text-[17px] leading-[1.55] text-ink-muted md:text-lead">{p.intro}</p>
        </Reveal>
      </section>

      <div className="container-page">
        <ImagePlaceholder slot={`programme.${p.slug}`} label={p.photo} className="h-[360px] w-full md:h-[560px]" />
      </div>

      <section className="container-page section grid gap-12 md:grid-cols-3 md:gap-16">
        {steps.map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.06} className="flex flex-col gap-3.5">
            <span className="font-display text-[32px] leading-none text-gold">0{i + 1}</span>
            <span className="text-[22px] font-medium">{t}</span>
            <span className="text-[16px] leading-[1.65] text-ink-muted">{d}</span>
          </Reveal>
        ))}
      </section>

      <section className="bg-ivory">
        <div className="container-page section grid gap-16 md:grid-cols-2 md:gap-24">
          {[
            ['Who it’s for.', p.who],
            ['What to expect.', p.expect],
          ].map(([title, items]) => (
            <Reveal key={title} className="flex flex-col gap-8">
              <h2 className="title-section">{title}</h2>
              <ul className="border-b border-[#E6E0D6]">
                {items.map((x) => (
                  <li key={x} className="border-t border-[#E6E0D6] py-5 text-[18px]">
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page section flex flex-col gap-14">
        <h2 className="title-section text-center">What we cover.</h2>
        <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
          {p.services.map((s, i) => (
            <Reveal key={s.name} delay={(i % 2) * 0.06} className="flex flex-col gap-2 border-t border-hairline pt-6">
              <span className="text-[20px] font-medium">{s.name}</span>
              <span className="text-[16px] leading-[1.65] text-ink-muted">{s.text}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="sessions" className="container-page flex flex-col gap-14 pb-section-sm md:pb-section">
        <h2 className="title-section text-center">Choose a session.</h2>
        <div className="mx-auto grid w-full max-w-[880px] gap-5 md:grid-cols-2">
          {sessions.map((s, i) => (
            <Reveal
              key={s.id}
              delay={i * 0.06}
              className={`flex flex-col gap-4 rounded-lg border p-8 md:p-11 ${i === 0 ? 'border-charcoal' : 'border-hairline'}`}
            >
              <span className="text-caption font-medium text-burgundy">{s.name}</span>
              <span className="font-display text-[52px] leading-none tracking-[-1px]">
                {money(s.price)}
              </span>
              <span className="text-small text-ink-muted">{s.duration} minutes · Zoom</span>
              <p className="pt-1 text-[16px] leading-[1.65]">{s.summary}</p>
              <Button to={`/consultations?service=${s.id}`} variant={i === 0 ? 'primary' : 'secondary'} className="mt-3">
                Book this session
              </Button>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-[760px] flex-col gap-10 px-6 pb-section-sm md:px-8 md:pb-section">
        <h2 className="title-section text-center">Questions.</h2>
        <div className="border-b border-hairline">
          {p.faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-t border-hairline">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left text-[18px] font-medium"
                >
                  {f.q}
                  <span aria-hidden="true" className="text-ink-muted">
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
                      <p className="pb-6 text-[16px] leading-[1.65] text-ink-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
