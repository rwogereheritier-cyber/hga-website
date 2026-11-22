import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, LinkAction } from '../../components/common/Button';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import Reveal from '../../components/common/Reveal';
import { currency, events, faqs, programmes, stats, testimonial } from '../../data/site';
import { addSubscriber } from '../../lib/store';

function Hero() {
  return (
    <section className="container-page flex flex-col items-center gap-7 pb-24 pt-24 text-center md:pt-40">
      <Reveal as="span" className="eyebrow">
        Nursing · Careers · English
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="h-display max-w-[980px]">
          Empowering minds. Elevating careers. <em className="text-burgundy">Transforming futures.</em>
        </h1>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="max-w-prose text-[17px] leading-[1.55] text-ink-muted md:text-lead">
          Nursing education, mentorship and English language support from a Registered Nurse in Canada.
        </p>
      </Reveal>
      <Reveal delay={0.15} className="flex flex-wrap items-center justify-center gap-7 pt-2">
        <Button to="/consultations">Book a consultation</Button>
        <LinkAction to="/programmes">Explore programmes</LinkAction>
      </Reveal>
    </section>
  );
}

function Stats() {
  return (
    <section className="container-page section grid grid-cols-2 gap-12 text-center md:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.05} className="flex flex-col gap-2.5">
          <span className="font-display text-[38px] tracking-[-1px] md:text-[56px]">{s.value}</span>
          <span className="text-small text-ink-muted">{s.label}</span>
        </Reveal>
      ))}
    </section>
  );
}

function Paths() {
  return (
    <section className="container-page flex flex-col gap-16 pb-section-sm md:pb-section">
      <Reveal className="flex flex-col items-center gap-4 text-center">
        <h2 className="title-section">Choose your path.</h2>
        <p className="max-w-[520px] text-[19px] leading-[1.55] text-ink-muted">
          Every path starts with a one-to-one conversation with Hetty.
        </p>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {programmes.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.06}>
            <Link
              to={`/programmes/${p.slug}`}
              className="group flex h-full min-h-[520px] flex-col gap-3.5 rounded-lg bg-grey-100 p-8 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-hover md:p-10"
            >
              <span className="text-caption font-medium text-burgundy">{p.category}</span>
              <h3 className="h-card">{p.title}</h3>
              <span className="text-small text-ink-muted">
                From {currency}
                {p.from}
              </span>
              <span className="text-small font-medium text-burgundy">
                Learn more <span aria-hidden="true">›</span>
              </span>
              <ImagePlaceholder label={p.photo} className="mt-auto h-60 !bg-[#ECE8E2]" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section className="bg-ivory">
      <div className="container-page section flex flex-wrap items-center gap-12 md:gap-24">
        <Reveal className="w-full flex-1 basis-[420px]">
          <ImagePlaceholder label="Hetty, candid" tone="ivory" className="h-[440px] md:h-[600px]" />
        </Reveal>
        <Reveal delay={0.08} className="flex flex-1 basis-[420px] flex-col gap-7">
          <span className="eyebrow">Meet the founder</span>
          <h2 className="title-section">“I built HGA for the nurse I once was.”</h2>
          <p className="max-w-[460px] text-[18px] leading-[1.7] text-ink-muted">
            Hetty is a Registered Nurse in Canada. She helps aspiring and internationally educated nurses prepare for exams,
            strengthen their English and build careers they are proud of.
          </p>
          <LinkAction to="/about">Discover our story</LinkAction>
        </Reveal>
      </div>
    </section>
  );
}

function Events() {
  return (
    <section className="mx-auto w-full max-w-[960px] px-6 py-section-sm md:px-8 md:py-section">
      <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <h2 className="title-section">Upcoming events.</h2>
        <LinkAction to="/events">View all</LinkAction>
      </Reveal>
      <ul className="border-b border-hairline">
        {events.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center gap-x-10 gap-y-2 border-t border-hairline py-8">
            <span className="w-[90px] text-small text-ink-muted">{e.date}</span>
            <span className="flex min-w-[260px] flex-1 flex-col gap-1.5">
              <span className="text-[21px] font-medium">{e.title}</span>
              <span className="text-small text-ink-muted">{e.meta}</span>
            </span>
            <LinkAction to={`/events/${e.id}`}>Register</LinkAction>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="mx-auto flex max-w-[1000px] flex-col items-center gap-8 px-6 pb-section-sm text-center md:px-8 md:pb-section">
      <Reveal>
        <p className="font-display text-[28px] leading-[1.3] tracking-[-0.5px] md:text-quote">“{testimonial.quote}”</p>
      </Reveal>
      <span className="text-small text-ink-muted">{testimonial.author}</span>
    </section>
  );
}

function BookAndNewsletter() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    if (!form.get('consent')) return setError('Please tick the box to agree to emails.');
    setError('');
    addSubscriber({ email, date: Date.now(), source: 'Homepage' });
    setSent(true);
  }

  return (
    <section className="container-page grid gap-5 pb-section-sm md:grid-cols-2 md:pb-section">
      <Reveal className="flex min-h-[460px] flex-col gap-4 rounded-lg bg-grey-100 p-8 md:p-14">
        <span className="text-caption font-medium text-burgundy">Publication</span>
        <h3 className="h-card">Your Nursing Career Success Guide</h3>
        <span className="text-small text-ink-muted">By Hetty · {currency}24.99</span>
        <LinkAction to="/books">Explore</LinkAction>
        <div className="mt-auto flex h-[200px] w-[150px] items-end self-center rounded-[4px_8px_8px_4px] bg-burgundy p-[18px]">
          <span className="font-display text-[16px] leading-[1.2] text-white">Your Nursing Career Success Guide</span>
        </div>
      </Reveal>

      <Reveal delay={0.06} className="flex min-h-[460px] flex-col gap-4 rounded-lg bg-grey-100 p-8 md:p-14">
        <span className="text-caption font-medium text-burgundy">Newsletter</span>
        <h3 className="h-card">Stay inspired. Keep learning.</h3>
        <p className="text-small text-ink-muted">One email a month with study tips, events and career advice.</p>
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.p
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-auto text-body font-medium text-success"
              role="status"
            >
              You’re subscribed. Welcome to the community.
            </motion.p>
          ) : (
            <motion.form key="form" exit={{ opacity: 0 }} onSubmit={onSubmit} noValidate className="mt-auto flex flex-col gap-3">
              <label className="text-caption text-ink-muted">
                Email
                <input
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  className="mt-1.5 block h-[52px] w-full rounded-md border border-[#E2DED8] bg-white px-4 text-[16px] text-charcoal transition-colors focus:border-burgundy focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-2 text-caption text-ink-muted">
                <input name="consent" type="checkbox" className="h-4 w-4 accent-burgundy" />I agree to receive emails from HGA.
              </label>
              {error && (
                <p className="text-caption text-danger" role="alert">
                  {error}
                </p>
              )}
              <Button variant="dark" className="self-start" type="submit">
                Subscribe
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto flex max-w-[760px] flex-col gap-10 px-6 pb-section-sm md:px-8 md:pb-section">
      <h2 className="title-section text-center">Questions.</h2>
      <div className="border-b border-hairline">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="border-t border-hairline">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 py-7 text-left text-[19px] font-medium"
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
      <p className="text-center text-[16px] text-ink-muted">
        Still have questions? <LinkAction to="/contact">Contact us</LinkAction>
      </p>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-ivory">
      <Reveal className="container-page section flex flex-col items-center gap-7 text-center">
        <h2 className="title-section max-w-[760px] md:text-display-l">Ready for your next step?</h2>
        <p className="text-[19px] text-ink-muted">45 minutes, one to one, on Zoom.</p>
        <Button to="/consultations">Book a consultation</Button>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container-page">
        <ImagePlaceholder label="Hetty, professional portrait" className="h-[420px] md:h-[640px]" />
      </div>
      <Stats />
      <Paths />
      <Founder />
      <Events />
      <Testimonial />
      <BookAndNewsletter />
      <Faq />
      <FinalCta />
    </>
  );
}
