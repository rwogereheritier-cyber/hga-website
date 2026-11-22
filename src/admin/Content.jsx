import { useState } from 'react';
import Field from '../components/common/Field';
import { fieldClass } from '../lib/forms';
import { setContent, update, useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { AdminHeader, Btn } from './ui';

function Section({ title, note, onSave, children }) {
  return (
    <section className="flex flex-col gap-5 border-t border-hairline pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-medium">{title}</h2>
          {note && <span className="text-[13px] text-ink-muted">{note}</span>}
        </div>
        <Btn variant="primary" onClick={onSave}>
          Save
        </Btn>
      </div>
      {children}
    </section>
  );
}

export default function Content() {
  const content = useStore('content');
  const consultations = useStore('consultations');
  const [hero, setHero] = useState(content.hero);
  const [about, setAbout] = useState(content.about);
  const [founder, setFounder] = useState(content.founder);
  const [stats, setStats] = useState(content.stats);
  const [contact, setContact] = useState(content.contact);
  const [socials, setSocials] = useState(content.socials);
  const [prices, setPrices] = useState(consultations);

  const saved = (what) => toast(`${what} updated on the website`);

  return (
    <div className="flex max-w-[900px] flex-col gap-10">
      <AdminHeader title="Website content" sub="Changes appear on the public website straight away (in this browser)" />

      <Section title="Homepage hero" onSave={() => { setContent({ hero }); saved('Homepage hero'); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow">
            <input value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="Headline">
            <input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="Headline accent (italic, burgundy)">
            <input value={hero.accent} onChange={(e) => setHero({ ...hero, accent: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="Supporting text">
            <input value={hero.lead} onChange={(e) => setHero({ ...hero, lead: e.target.value })} className={fieldClass()} />
          </Field>
        </div>
      </Section>

      <Section title="Consultation prices" note="Used by the booking flow and programme pages. Currency still to confirm." onSave={() => { update((s) => ({ ...s, consultations: prices.map((p) => ({ ...p, price: +p.price, duration: +p.duration })) })); saved('Prices'); }}>
        <div className="flex flex-col gap-3">
          {prices.map((p, i) => (
            <div key={p.id} className="grid items-end gap-3 sm:grid-cols-[2fr_1fr_1fr]">
              <Field label="Service">
                <input value={p.name} onChange={(e) => setPrices(prices.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={fieldClass()} />
              </Field>
              <Field label="Price">
                <input type="number" min="0" value={p.price} onChange={(e) => setPrices(prices.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} className={fieldClass()} />
              </Field>
              <Field label="Minutes">
                <input type="number" min="15" step="15" value={p.duration} onChange={(e) => setPrices(prices.map((x, j) => (j === i ? { ...x, duration: e.target.value } : x)))} className={fieldClass()} />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Statistics" note="Shown on the homepage and About page." onSave={() => { setContent({ stats }); saved('Statistics'); }}>
        <div className="grid gap-3 sm:grid-cols-2">
          {stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr] gap-3">
              <Field label={`Figure ${i + 1}`}>
                <input value={s.value} onChange={(e) => setStats(stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className={fieldClass()} />
              </Field>
              <Field label="Label">
                <input value={s.label} onChange={(e) => setStats(stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={fieldClass()} />
              </Field>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Founder profile" onSave={() => { setContent({ founder }); saved('Founder profile'); }}>
        <Field label="Quote">
          <input value={founder.quote} onChange={(e) => setFounder({ ...founder, quote: e.target.value })} className={fieldClass()} />
        </Field>
        <Field label="Short biography">
          <textarea rows={3} value={founder.bio} onChange={(e) => setFounder({ ...founder, bio: e.target.value })} className={`${fieldClass()} h-auto py-3`} />
        </Field>
      </Section>

      <Section title="About: our story" onSave={() => { setContent({ about }); saved('Our story'); }}>
        <Field label="Story" hint="Separate paragraphs with a blank line.">
          <textarea rows={7} value={about.story} onChange={(e) => setAbout({ ...about, story: e.target.value })} className={`${fieldClass()} h-auto py-3`} />
        </Field>
      </Section>

      <Section title="Contact information" onSave={() => { setContent({ contact }); saved('Contact information'); }}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Email">
            <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="Phone">
            <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="Location">
            <input value={contact.location} onChange={(e) => setContact({ ...contact, location: e.target.value })} className={fieldClass()} />
          </Field>
        </div>
      </Section>

      <Section title="Social media links" onSave={() => { setContent({ socials }); saved('Social links'); }}>
        <div className="grid gap-4 sm:grid-cols-3">
          {socials.map((s, i) => (
            <Field key={s.label} label={s.label}>
              <input value={s.href} placeholder="https://" onChange={(e) => setSocials(socials.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} className={fieldClass()} />
            </Field>
          ))}
        </div>
      </Section>
    </div>
  );
}
