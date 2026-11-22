import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Accordion from '../../components/common/Accordion';
import { Button } from '../../components/common/Button';
import Field from '../../components/common/Field';
import { fieldClass } from '../../lib/forms';
import PageHero from '../../components/common/PageHero';
import { contact } from '../../data/site';
import { addMessage, makeRef } from '../../lib/store';

const faqs = [
  { q: 'How do consultations work?', a: 'Choose a service, pick a time in your own time zone, pay online and receive a Zoom link by email.' },
  { q: 'Can I reschedule or cancel a consultation?', a: 'Yes. You can reschedule for free up to 24 hours before your session.' },
  { q: 'Which payment methods do you accept?', a: 'Major credit and debit cards. More options will be added later.' },
  { q: 'Are workshops recorded?', a: 'Most online workshops are recorded and shared with registered attendees.' },
  { q: 'Do you offer group or corporate training?', a: 'Yes. Send a message with your organisation’s needs and we will reply with options.' },
  { q: 'Which service should I start with?', a: 'If you are unsure, book a general mentorship consultation and Hetty will help you choose.' },
];

export default function Contact() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', subject: params.get('subject') || '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (form.subject.trim().length < 3) errs.subject = 'Add a short subject.';
    if (form.message.trim().length < 20) errs.message = 'Write a little more so we can help (20 characters or more).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    addMessage({ ref: makeRef('MSG'), ...form, date: Date.now(), status: 'New' });
    setSent(true);
  }

  return (
    <>
      <PageHero eyebrow="Contact" title="Let’s talk." lead="Questions about programmes, events or partnerships? We usually reply within two working days." />

      <section className="container-page flex flex-wrap gap-16 pb-section-sm md:gap-24 md:pb-section">
        <div className="flex flex-[1_1_280px] flex-col gap-8">
          {[
            ['Email', <a key="e" href={`mailto:${contact.email}`} className="text-burgundy hover:text-maroon">{contact.email}</a>],
            ['Phone', contact.phone],
            ['Location', contact.location],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 border-t border-hairline pt-5">
              <span className="text-caption text-ink-muted">{k}</span>
              <span className="text-[18px]">{v}</span>
            </div>
          ))}
          <div className="flex flex-col gap-2 border-t border-hairline pt-5">
            <span className="text-caption text-ink-muted">Follow</span>
            <div className="flex flex-wrap gap-5 text-[18px]">
              {contact.socials.map((s) => (
                <a key={s.label} href={s.href} className="text-burgundy hover:text-maroon">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-[2_1_480px]">
          {sent ? (
            <div className="flex flex-col gap-4 rounded-lg bg-grey-100 p-10" role="status">
              <h2 className="font-display text-[32px] leading-[1.15]">Thank you, {form.name.split(' ')[0]}.</h2>
              <p className="text-[17px] text-ink-muted">Your message has been sent. We’ll reply to {form.email} soon.</p>
              <p className="text-caption text-ink-muted">Demo: the message is saved for the admin dashboard; no email was sent.</p>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass(errors.name)} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass(errors.email)} />
              </Field>
              <Field label="Subject" error={errors.subject} className="sm:col-span-2">
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={fieldClass(errors.subject)} />
              </Field>
              <Field label="Message" error={errors.message} className="sm:col-span-2">
                <textarea rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${fieldClass(errors.message)} h-auto py-3`} />
              </Field>
              <Button type="submit" className="justify-self-start">
                Send message
              </Button>
            </form>
          )}
        </div>
      </section>

      <section className="mx-auto flex max-w-[760px] flex-col gap-10 px-6 pb-section-sm md:px-8 md:pb-section">
        <h2 className="title-section text-center">Frequently asked questions.</h2>
        <Accordion items={faqs} />
      </section>
    </>
  );
}
