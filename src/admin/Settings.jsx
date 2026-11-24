import { useState } from 'react';
import Field from '../components/common/Field';
import { fieldClass } from '../lib/forms';
import { saveSetting } from '../lib/live';
import { resetStore, useStore } from '../lib/store';
import { LIVE } from '../lib/supabase';
import { toast } from '../lib/toast';
import { useSession } from './auth';
import { ROLE_INFO } from './permissions';
import { AdminHeader, Btn, Details, Modal } from './ui';

const ZONES = ['America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg', 'America/Halifax', 'America/New_York', 'Europe/London', 'Africa/Lagos', 'Africa/Accra', 'Africa/Nairobi', 'Africa/Kigali', 'Asia/Dubai', 'Asia/Manila'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Section({ title, note, children, onSave }) {
  return (
    <section className="flex flex-col gap-5 border-t border-hairline pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-medium">{title}</h2>
          {note && <span className="text-[13px] text-ink-muted">{note}</span>}
        </div>
        {onSave && <Btn variant="primary" onClick={onSave}>Save</Btn>}
      </div>
      {children}
    </section>
  );
}

export default function Settings() {
  const settings = useStore('settings');
  const { profile } = useSession();
  const [biz, setBiz] = useState(settings.business);
  const [av, setAv] = useState(settings.availability);
  const [confirm, setConfirm] = useState(false);

  async function saveBusiness() {
    if (!/^\S+@\S+\.\S+$/.test(biz.email || '')) return toast('Enter a valid contact email', 'error');
    try {
      await saveSetting('business', { ...biz, confirmed: true });
      toast('Business details saved');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function saveHours() {
    if (!av.days.length) return toast('Choose at least one working day', 'error');
    if (av.end <= av.start) return toast('The end time must be after the start time', 'error');
    try {
      await saveSetting('availability', { ...av, slotMinutes: +av.slotMinutes, minNoticeHours: +av.minNoticeHours, maxAdvanceDays: +av.maxAdvanceDays });
      toast('Booking hours saved. The booking calendar is updated.');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <div className="flex max-w-[820px] flex-col gap-10">
      <AdminHeader title="Settings" />

      <Section title="Business details" note="Used on receipts, emails and the booking page." onSave={saveBusiness}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name">
            <input value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="Contact email">
            <input type="email" value={biz.email || ''} onChange={(e) => setBiz({ ...biz, email: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="Currency" hint="Prices on the website and receipts use this currency.">
            <select value={biz.currency} onChange={(e) => setBiz({ ...biz, currency: e.target.value })} className={fieldClass()}>
              <option value="CAD">Canadian dollar (CAD)</option>
              <option value="USD">US dollar (USD)</option>
            </select>
          </Field>
          <Field label="Your time zone" hint="Your working hours are in this time zone. Visitors see times in theirs.">
            <select value={biz.timezone} onChange={(e) => setBiz({ ...biz, timezone: e.target.value })} className={fieldClass()}>
              {ZONES.map((z) => (
                <option key={z} value={z}>{z.replace('_', ' ')}</option>
              ))}
            </select>
          </Field>
        </div>
        {!settings.business?.confirmed && <p className="text-[13px] text-[#7A4E0B]">Please check these and save to confirm them.</p>}
      </Section>

      <Section title="Booking hours" note="When people can book a consultation with you." onSave={saveHours}>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-caption text-ink-muted">Working days</legend>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d, i) => {
              const on = av.days.includes(i);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setAv({ ...av, days: on ? av.days.filter((x) => x !== i) : [...av.days, i].sort() })}
                  className={`h-10 w-14 rounded-full border text-[14px] ${on ? 'border-burgundy bg-burgundy text-white' : 'border-[#E2DED8] hover:border-charcoal'}`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="First session starts">
            <input type="time" value={av.start} onChange={(e) => setAv({ ...av, start: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="Last session ends by">
            <input type="time" value={av.end} onChange={(e) => setAv({ ...av, end: e.target.value })} className={fieldClass()} />
          </Field>
          <Field label="New session every" hint="Includes a break after each session.">
            <select value={av.slotMinutes} onChange={(e) => setAv({ ...av, slotMinutes: +e.target.value })} className={fieldClass()}>
              {[60, 75, 90, 120].map((m) => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
          </Field>
          <Field label="Minimum notice">
            <select value={av.minNoticeHours} onChange={(e) => setAv({ ...av, minNoticeHours: +e.target.value })} className={fieldClass()}>
              {[2, 12, 24, 48, 72].map((h) => (
                <option key={h} value={h}>{h} hours</option>
              ))}
            </select>
          </Field>
          <Field label="Book up to">
            <select value={av.maxAdvanceDays} onChange={(e) => setAv({ ...av, maxAdvanceDays: +e.target.value })} className={fieldClass()}>
              {[14, 30, 60, 90].map((d) => (
                <option key={d} value={d}>{d} days ahead</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Your account">
        <Details
          rows={[
            ['Name', profile.full_name || '—'],
            ['Email', profile.email],
            ['Role', ROLE_INFO[profile.role].label],
            ['Sign-in', LIVE ? 'Secure account' : 'Demo only (not secure)'],
          ]}
        />
      </Section>

      {!LIVE && (
        <Section title="Reset demo data" note="Removes test bookings, registrations, orders, photos and edits made in this browser.">
          <Btn variant="danger" className="self-start" onClick={() => setConfirm(true)}>
            Reset demo data
          </Btn>
        </Section>
      )}

      {confirm && (
        <Modal
          title="Reset all demo data?"
          onClose={() => setConfirm(false)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setConfirm(false)}>Cancel</Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  resetStore();
                  toast('Demo data reset');
                  setConfirm(false);
                }}
              >
                Reset everything
              </Btn>
            </>
          }
        >
          <p className="text-[15px]">This can’t be undone in this browser.</p>
        </Modal>
      )}
    </div>
  );
}
