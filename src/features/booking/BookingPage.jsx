import { cloneElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Button } from '../../components/common/Button';
import { consultations, countries, getConsultation } from '../../data/services';
import { currency } from '../../data/site';
import { addBooking, getState, makeRef, useStore } from '../../lib/store';
import { buildSlots, fmtDate, fmtLongDate, fmtTime, icsStamp, visitorZoneLabel } from '../../lib/time';
import Calendar from './Calendar';

const STEPS = ['Service', 'Date & time', 'Your details', 'Review & pay'];
const field =
  'mt-1.5 block h-[52px] w-full rounded-md border bg-white px-4 text-[16px] text-charcoal transition-colors focus:border-burgundy focus:outline-none';

function Field({ label, error, children, hint }) {
  const id = useId();
  const msgId = `${id}-msg`;
  const control = cloneElement(children, {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || hint ? msgId : undefined,
  });
  return (
    <div className="flex flex-col text-caption text-ink-muted">
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

function Summary({ service, slot, step, onNext, nextLabel, disabled, busy }) {
  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
      <span className="text-small text-ink-muted">Summary</span>
      <span className="font-display text-[30px] leading-[1.15] tracking-[-0.5px]">{service ? service.name : 'Choose a service'}</span>
      <dl className="flex flex-col text-small">
        {[
          ['Date', slot ? fmtDate(slot, { year: 'numeric' }) : '—'],
          ['Time', slot ? fmtTime(slot) : '—'],
          ['Duration', service ? `${service.duration} min · Zoom` : '—'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-t border-hairline py-4">
            <dt className="text-ink-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-y border-hairline py-5 text-[19px] font-medium">
          <dt>Total</dt>
          <dd>{service ? `${currency}${service.price}` : '—'}</dd>
        </div>
      </dl>
      {onNext && (
        <Button onClick={onNext} disabled={disabled || busy} className="hidden disabled:cursor-not-allowed disabled:bg-[#F0EDE9] disabled:text-ink-muted lg:inline-flex">
          {busy ? 'Processing…' : nextLabel}
        </Button>
      )}
      <p className="text-caption leading-[1.6] text-ink-muted">
        {step < 3 ? 'You won’t be charged until the last step. ' : ''}Free rescheduling up to 24 hours before. Prices in{' '}
        {currency === '$' ? '[CURRENCY]' : currency}.
      </p>
    </aside>
  );
}

function luhn(num) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = +num[i];
    if (dbl) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function Confirmation({ booking }) {
  const service = getConsultation(booking.serviceId);
  const end = booking.start + service.duration * 60000;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hetty Global Academy//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${booking.ref}@hettyglobalacademy.com`,
    `DTSTAMP:${icsStamp(booking.createdAt)}`,
    `DTSTART:${icsStamp(booking.start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${service.name} with Hetty Global Academy`,
    `DESCRIPTION:Join on Zoom: ${booking.zoom}\\nBooking reference: ${booking.ref}`,
    `LOCATION:${booking.zoom}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const summary = [
    'Hetty Global Academy — booking confirmation',
    '',
    `Reference: ${booking.ref}`,
    `Name: ${booking.name}`,
    `Service: ${service.name}`,
    `When: ${fmtLongDate(booking.start)}, ${fmtTime(booking.start)} (${visitorZoneLabel()})`,
    `Duration: ${service.duration} minutes`,
    `Amount: ${currency}${booking.amount} — Paid (demo)`,
    `Zoom: ${booking.zoom}`,
  ].join('\n');

  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-burgundy text-white" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <div className="flex w-full flex-col gap-4">
        <h1 className="title-section">You’re booked, {booking.name.split(' ')[0]}.</h1>
        <p className="text-lead text-ink-muted">A confirmation is on its way to {booking.email}.</p>
      </div>
      <dl className="w-full text-left text-small">
        {[
          ['Reference', booking.ref],
          ['Service', service.name],
          ['When', `${fmtLongDate(booking.start)}, ${fmtTime(booking.start)}`],
          ['Payment', `${currency}${booking.amount} · Paid`],
          ['Zoom link', booking.zoom],
        ].map(([k, v]) => (
          <div key={k} className="flex flex-wrap justify-between gap-3 border-t border-hairline py-4 last:border-b">
            <dt className="text-ink-muted">{k}</dt>
            <dd className="break-all font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => download(`HGA-${booking.ref}.ics`, ics, 'text/calendar')}>Add to calendar</Button>
        <Button variant="secondary" onClick={() => download(`HGA-${booking.ref}.txt`, summary, 'text/plain')}>
          Download summary
        </Button>
      </div>
      <Link to="/" className="text-[16px] font-medium text-burgundy hover:text-maroon">
        Return to homepage ›
      </Link>
      <p className="text-caption text-ink-muted">
        Demo: no payment was taken and no email was sent. The Zoom link is a placeholder.
      </p>
    </div>
  );
}

export default function BookingPage() {
  const [params] = useSearchParams();
  const initial = getConsultation(params.get('service'));
  const bookings = useStore('bookings');
  const reduce = useReducedMotion();
  const headingRef = useRef(null);

  const [step, setStep] = useState(initial ? 1 : 0);
  const [serviceId, setServiceId] = useState(initial?.id || null);
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [details, setDetails] = useState({ name: '', email: '', phone: '', country: '', notes: '' });
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const service = getConsultation(serviceId);
  const slots = useMemo(() => buildSlots(bookings.map((b) => b.start)), [bookings]);
  const available = useMemo(
    () => new Set(Object.entries(slots).filter(([, list]) => list.some((s) => !s.taken)).map(([k]) => k)),
    [slots],
  );
  const zone = useMemo(visitorZoneLabel, []);

  useEffect(() => {
    if (!day && available.size) setDay([...available].sort()[0]);
  }, [available, day]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, done]);

  const go = (n) => {
    setErrors({});
    setStep(n);
    window.scrollTo(0, 0);
  };

  function validateDetails() {
    const e = {};
    if (details.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) e.email = 'Enter a valid email address.';
    if (details.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a phone number with country code.';
    if (!details.country) e.country = 'Choose your country.';
    if (details.notes.trim().length < 10) e.notes = 'Tell Hetty a little about what you need (10 characters or more).';
    setErrors(e);
    return !Object.keys(e).length;
  }

  function validateCard() {
    const e = {};
    const num = card.number.replace(/\D/g, '');
    if (card.name.trim().length < 2) e.name = 'Enter the name on the card.';
    if (num.length < 13 || num.length > 19 || !luhn(num)) e.number = 'Enter a valid card number.';
    const m = card.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    const now = new Date();
    if (!m || +m[1] < 1 || +m[1] > 12 || new Date(2000 + +m[2], +m[1], 1) <= now) e.expiry = 'Enter a future date as MM/YY.';
    if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = 'Enter the 3 or 4 digit code.';
    setErrors(e);
    return !Object.keys(e).length;
  }

  function pay() {
    if (!validateCard()) return;
    if (getState().bookings.some((b) => b.start === slot)) {
      go(1);
      setSlot(null);
      setErrors({ form: 'Sorry, that time was just taken. Please choose another.' });
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const ref = makeRef('HGA');
      const now = Date.now();
      const booking = {
        ref,
        serviceId,
        start: slot,
        duration: service.duration,
        amount: service.price,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        createdAt: now,
        zoom: `https://zoom.us/j/${String(now).slice(-10)}`,
        ...details,
      };
      addBooking(booking, {
        ref: makeRef('TXN'),
        bookingRef: ref,
        client: details.name,
        email: details.email,
        service: service.name,
        amount: service.price,
        date: now,
        status: 'Paid',
        method: `Card •••• ${card.number.replace(/\D/g, '').slice(-4)}`,
      });
      setBusy(false);
      setDone(booking);
      window.scrollTo(0, 0);
    }, 1200);
  }

  const daySlots = (day && slots[day]) || [];
  const fade = reduce
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.25 } };

  const titles = ['Which consultation?', 'When works for you?', 'A little about you.', 'Review and pay.'];
  const next = [
    { label: 'Continue', onNext: () => go(1), disabled: !service },
    { label: 'Continue', onNext: () => go(2), disabled: !slot },
    { label: 'Continue to payment', onNext: () => validateDetails() && go(3) },
    { label: `Pay ${service ? currency + service.price : ''}`, onNext: pay },
  ][step];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-hairline">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="font-display text-[18px] text-charcoal">
            Hetty Global Academy
          </Link>
          {!done && (
            <Link to="/" className="text-[14px] text-ink-muted hover:text-charcoal">
              Cancel
            </Link>
          )}
        </div>
        <div className="h-0.5 bg-[#F0EDE9]">
          <motion.div
            className="h-0.5 bg-burgundy"
            initial={false}
            animate={{ width: done ? '100%' : `${((step + 1) / (STEPS.length + 1)) * 100}%` }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </header>

      <main className={`container-page pt-16 md:pt-24 ${done ? 'pb-24' : 'pb-36 lg:pb-24'}`}>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" {...fade}>
              <h2 ref={headingRef} tabIndex={-1} className="sr-only">
                Booking confirmed
              </h2>
              <Confirmation booking={done} />
            </motion.div>
          ) : (
            <motion.div key={step} {...fade} className="flex flex-wrap items-start gap-16 lg:gap-24">
              <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-14">
                <div className="flex flex-col gap-3.5">
                  <span className="text-small text-ink-muted">
                    Step {step + 1} of 4 · {STEPS[step]}
                  </span>
                  <h1 ref={headingRef} tabIndex={-1} className="font-display text-[40px] font-medium leading-[1.05] tracking-[-1px] outline-none md:text-[56px]">
                    {titles[step]}
                  </h1>
                  {step > 0 && (
                    <button type="button" onClick={() => go(step - 1)} className="self-start text-small font-medium text-burgundy hover:text-maroon">
                      ‹ Back
                    </button>
                  )}
                </div>

                {errors.form && (
                  <p className="rounded-md bg-[#F6E3E3] px-4 py-3 text-small text-danger" role="alert">
                    {errors.form}
                  </p>
                )}

                {step === 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {consultations.map((c) => {
                      const sel = c.id === serviceId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          aria-pressed={sel}
                          onClick={() => setServiceId(c.id)}
                          className={`flex flex-col gap-1.5 rounded-lg bg-white p-5 text-left transition-colors duration-200 ${
                            sel ? 'border-2 border-burgundy' : 'm-px border border-[#E2DED8] hover:border-charcoal'
                          }`}
                        >
                          <span className="text-[17px] font-medium">{c.name}</span>
                          <span className="text-small text-ink-muted">
                            {currency}
                            {c.price} · {c.duration} min
                          </span>
                          <span className="pt-1 text-small text-ink-muted">{c.summary}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-wrap gap-14">
                    <div className="min-w-[300px] flex-[1_1_340px]">
                      <Calendar
                        available={available}
                        selected={day}
                        onSelect={(k) => {
                          setDay(k);
                          setSlot(null);
                        }}
                      />
                    </div>
                    <div className="flex min-w-[220px] flex-[1_1_240px] flex-col gap-4">
                      <h3 className="text-[19px] font-medium">
                        {day ? new Date(`${day}T00:00`).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }) : 'Pick a day'}
                      </h3>
                      <p className="text-caption text-ink-muted">Times shown in your time zone: {zone}</p>
                      <div className="flex flex-col gap-2.5">
                        {daySlots.map((s) => {
                          const sel = s.ms === slot;
                          return (
                            <button
                              key={s.ms}
                              type="button"
                              disabled={s.taken}
                              aria-pressed={sel}
                              onClick={() => setSlot(s.ms)}
                              className={`h-[52px] rounded-full border text-[15px] font-medium transition-colors duration-200 ${
                                sel
                                  ? 'border-burgundy bg-burgundy text-white'
                                  : s.taken
                                    ? 'border-[#F0EDE9] text-[#B9B3B6] line-through'
                                    : 'border-[#E2DED8] hover:border-charcoal'
                              }`}
                            >
                              {fmtTime(s.ms)}
                              {s.taken && <span className="sr-only"> (booked)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <form noValidate onSubmit={(e) => { e.preventDefault(); if (validateDetails()) go(3); }} className="grid max-w-[640px] gap-5 sm:grid-cols-2">
                    <Field label="Full name" error={errors.name}>
                      <input autoComplete="name" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} className={`${field} ${errors.name ? 'border-danger' : 'border-[#E2DED8]'}`} />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input type="email" autoComplete="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} className={`${field} ${errors.email ? 'border-danger' : 'border-[#E2DED8]'}`} />
                    </Field>
                    <Field label="Phone (with country code)" error={errors.phone}>
                      <input type="tel" autoComplete="tel" placeholder="+1 416 555 0100" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} className={`${field} ${errors.phone ? 'border-danger' : 'border-[#E2DED8]'}`} />
                    </Field>
                    <Field label="Country" error={errors.country}>
                      <select value={details.country} onChange={(e) => setDetails({ ...details, country: e.target.value })} className={`${field} ${errors.country ? 'border-danger' : 'border-[#E2DED8]'}`}>
                        <option value="">Select…</option>
                        {countries.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label={`Consultation: ${service?.name}`} error={errors.notes} hint="What would you like help with?">
                        <textarea rows={5} value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} className={`${field} h-auto py-3 ${errors.notes ? 'border-danger' : 'border-[#E2DED8]'}`} />
                      </Field>
                    </div>
                    <button type="submit" className="sr-only">Continue to payment</button>
                  </form>
                )}

                {step === 3 && (
                  <div className="flex max-w-[640px] flex-col gap-10">
                    <dl className="text-small">
                      {[
                        ['Name', details.name],
                        ['Email', details.email],
                        ['Phone', details.phone],
                        ['Country', details.country],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3 border-t border-hairline py-3.5 last:border-b">
                          <dt className="text-ink-muted">{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <form noValidate onSubmit={(e) => { e.preventDefault(); pay(); }} className="grid gap-5 sm:grid-cols-2">
                      <p className="text-small text-ink-muted sm:col-span-2">
                        Demo checkout: no real payment is taken. Try 4242 4242 4242 4242, any future date and any 3 digits.
                      </p>
                      <div className="sm:col-span-2">
                        <Field label="Name on card" error={errors.name}>
                          <input autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className={`${field} ${errors.name ? 'border-danger' : 'border-[#E2DED8]'}`} />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Card number" error={errors.number}>
                          <input inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, '').slice(0, 23) })} className={`${field} ${errors.number ? 'border-danger' : 'border-[#E2DED8]'}`} />
                        </Field>
                      </div>
                      <Field label="Expiry (MM/YY)" error={errors.expiry}>
                        <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value.slice(0, 7) })} className={`${field} ${errors.expiry ? 'border-danger' : 'border-[#E2DED8]'}`} />
                      </Field>
                      <Field label="Security code" error={errors.cvc}>
                        <input inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} className={`${field} ${errors.cvc ? 'border-danger' : 'border-[#E2DED8]'}`} />
                      </Field>
                      <button type="submit" className="sr-only">Pay</button>
                    </form>
                  </div>
                )}
              </div>

              <div className="w-full flex-[1_1_300px] lg:max-w-[360px]">
                <Summary service={service} slot={slot} step={step} busy={busy} nextLabel={next.label} onNext={next.onNext} disabled={next.disabled} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!done && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white/95 backdrop-blur lg:hidden">
          <div className="container-page flex items-center justify-between gap-4 py-3">
            <span className="flex flex-col">
              <span className="text-caption text-ink-muted">{service ? service.name : 'Choose a service'}</span>
              <span className="text-[17px] font-medium">{service ? `${currency}${service.price}` : '—'}</span>
            </span>
            <Button onClick={next.onNext} disabled={next.disabled || busy} className="disabled:cursor-not-allowed disabled:bg-[#F0EDE9] disabled:text-ink-muted">
              {busy ? 'Processing…' : next.label}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
