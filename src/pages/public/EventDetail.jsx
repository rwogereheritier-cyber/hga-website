import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import CardFields from '../../components/common/CardFields';
import { emptyCard, last4, validateCard } from '../../lib/forms';
import Field from '../../components/common/Field';
import { fieldClass } from '../../lib/forms';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import Reveal from '../../components/common/Reveal';
import { addRegistration, makeRef, useStore } from '../../lib/store';
import { fmtLongDate, fmtTime, visitorZoneLabel } from '../../lib/time';
import ComingSoon from './ComingSoon';
import { priceLabel, spacesLeft } from '../../lib/format';

function Registration({ event }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [card, setCard] = useState(emptyCard);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const paid = event.price > 0;

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (form.phone.replace(/\D/g, '').length < 7) errs.phone = 'Enter a phone number with country code.';
    Object.assign(errs, paid ? validateCard(card) : {});
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setTimeout(() => {
      const ref = makeRef('EVT');
      const now = Date.now();
      addRegistration(
        { ref, eventId: event.id, eventTitle: event.title, ...form, amount: event.price, date: now, status: 'Registered' },
        paid
          ? {
              ref: makeRef('TXN'),
              bookingRef: ref,
              client: form.name,
              email: form.email,
              service: event.title,
              amount: event.price,
              date: now,
              status: 'Paid',
              method: `Card •••• ${last4(card)}`,
            }
          : null,
      );
      setBusy(false);
      setDone(ref);
    }, paid ? 1200 : 500);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-burgundy text-white" aria-hidden="true">
          ✓
        </span>
        <h2 className="font-display text-[30px] leading-[1.15]">You’re registered.</h2>
        <p className="text-small text-ink-muted">
          Reference <span className="font-medium text-charcoal">{done}</span>. Joining details are on their way to {form.email}.
        </p>
        <p className="text-caption text-ink-muted">Demo: no payment was taken and no email was sent.</p>
        <Link to="/events" className="text-[16px] font-medium text-burgundy">
          More events ›
        </Link>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <h2 className="font-display text-[30px] leading-[1.15]">Register</h2>
      <Field label="Full name" error={errors.name}>
        <input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass(errors.name)} />
      </Field>
      <Field label="Email" error={errors.email}>
        <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass(errors.email)} />
      </Field>
      <Field label="Phone (with country code)" error={errors.phone}>
        <input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={fieldClass(errors.phone)} />
      </Field>
      <Field label="Event">
        <input readOnly value={event.title} className={`${fieldClass()} bg-grey-100 text-ink-muted`} />
      </Field>
      {paid && <CardFields card={card} setCard={setCard} errors={errors} />}
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? 'Processing…' : paid ? `Pay ${priceLabel(event.price)} and register` : 'Register for free'}
      </Button>
    </form>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const events = useStore('events');
  const event = events.find((e) => e.id === id);
  if (!event) return <ComingSoon title="Event not found" />;

  const startMs = new Date(event.start).getTime();
  const past = startMs < Date.now();
  const left = spacesLeft(event);

  return (
    <div className="container-page pb-section-sm pt-12 md:pb-section md:pt-20">
      <Link to="/events" className="text-small font-medium text-burgundy">
        ‹ All events
      </Link>
      <div className="mt-10 flex flex-wrap items-start gap-16 lg:gap-24">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-10">
          <Reveal className="flex flex-col gap-5">
            <span className="eyebrow">{event.category}</span>
            <h1 className="font-display text-[40px] font-medium leading-[1.05] tracking-[-1px] md:text-display-l">{event.title}</h1>
            <p className="max-w-prose text-[17px] leading-[1.6] text-ink-muted md:text-lead">{event.summary}</p>
          </Reveal>
          <ImagePlaceholder label={`${event.title} cover`} src={event.cover} className="h-[300px] w-full md:h-[440px]" />
          <dl className="grid gap-x-10 text-small sm:grid-cols-2">
            {[
              ['Date', fmtLongDate(startMs)],
              ['Time', `${fmtTime(startMs)} · ${visitorZoneLabel()}`],
              ['Duration', `${event.duration} minutes`],
              ['Format', event.format],
              ['Price', priceLabel(event.price)],
              ['Spaces', past ? 'Event ended' : left > 0 ? `${left} of ${event.capacity} left` : 'Fully booked'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-t border-hairline py-4">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="max-w-[680px] text-[17px] leading-[1.75]">{event.description}</p>
        </div>

        <aside className="w-full flex-[1_1_320px] lg:sticky lg:top-32 lg:max-w-[400px]">
          {past ? (
            <p className="text-ink-muted">This event has ended. See upcoming events for the next session.</p>
          ) : left === 0 ? (
            <p className="text-ink-muted">This event is fully booked. Check back for the next date.</p>
          ) : (
            <Registration event={event} />
          )}
        </aside>
      </div>
    </div>
  );
}
