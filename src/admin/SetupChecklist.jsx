import { Link } from 'react-router-dom';
import { photoSlots } from '../data/slots';
import { saveSetting } from '../lib/live';
import { useStore } from '../lib/store';
import { useTeam } from '../lib/team';

/** Getting-started checklist on the Overview, for the owner and admins. */
export default function SetupChecklist() {
  const settings = useStore('settings');
  const siteImages = useStore('siteImages');
  const integrations = useStore('integrations');
  const { members } = useTeam();
  if (settings.checklistHidden) return null;

  const photos = photoSlots.filter((s) => siteImages[s.key]).length;
  const connected = (id) => integrations[id]?.status === 'connected';
  const items = [
    { done: settings.business?.confirmed, label: 'Confirm your business details', note: 'Currency, time zone and booking hours', to: '/admin/settings' },
    { done: photos === photoSlots.length, label: 'Add your website photos', note: `${photos} of ${photoSlots.length} added`, to: '/admin/media' },
    { done: Boolean(settings.contentReviewed), label: 'Review your website text and prices', note: 'Headline, founder story, statistics, prices', to: '/admin/content' },
    { done: (members?.length || 0) > 1, label: 'Invite your team', note: 'Optional: assistants, editors', to: '/admin/team' },
    { done: connected('stripe'), label: 'Connect Stripe', note: 'To take real payments', to: '/admin/connections' },
    { done: connected('google_calendar'), label: 'Connect Google Calendar', note: 'To avoid double-booking', to: '/admin/connections' },
    { done: connected('zoom'), label: 'Connect Zoom', note: 'Automatic meeting links', to: '/admin/connections' },
    { done: connected('email'), label: 'Send email from your domain', note: 'Confirmations from your address', to: '/admin/connections' },
  ];
  const done = items.filter((i) => i.done).length;

  return (
    <section aria-label="Setup checklist" className="flex flex-col gap-5 rounded-lg border border-hairline p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-medium">{done === items.length ? 'You’re all set.' : 'Finish setting up'}</h2>
          <span className="text-[14px] text-ink-muted">
            {done} of {items.length} done. Each step switches on more of the website.
          </span>
        </div>
        <button type="button" onClick={() => saveSetting('checklistHidden', true)} className="text-[13px] font-medium text-ink-muted hover:text-charcoal">
          Hide checklist
        </button>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-grey-100" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={items.length}>
        <div className="h-full rounded-full bg-burgundy transition-[width] duration-300" style={{ width: `${(done / items.length) * 100}%` }} />
      </div>
      <ul className="grid gap-x-8 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.label} className="border-t border-hairline">
            <Link to={i.to} className="group flex items-start gap-3 py-3.5">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${i.done ? 'bg-success text-white' : 'border border-[#CFC8C0]'}`}
              >
                {i.done ? '✓' : ''}
              </span>
              <span className="flex flex-col">
                <span className={`text-[14px] font-medium group-hover:text-burgundy ${i.done ? 'text-ink-muted line-through' : ''}`}>
                  {i.label}
                  <span className="sr-only">{i.done ? ' (done)' : ' (to do)'}</span>
                </span>
                <span className="text-[13px] text-ink-muted">{i.note}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
