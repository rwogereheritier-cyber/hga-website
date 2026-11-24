import { Link } from 'react-router-dom';
import { update, useStore } from '../lib/store';
import { LIVE } from '../lib/supabase';
import { toast } from '../lib/toast';
import { AdminHeader, Btn, Status } from './ui';

const providers = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    does: 'Blocks busy times on the booking page and adds every booking to your calendar.',
    without: 'Bookings use only the working hours set in Settings.',
    guide: 'google',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    does: 'Creates a Zoom meeting for each booking and puts the link in the confirmation.',
    without: 'You can add a meeting link to each booking by hand.',
    guide: 'zoom',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    does: 'Takes card payments for consultations, events and books, paid straight into your Stripe account.',
    without: 'The website can’t take real payments.',
    guide: 'stripe',
  },
  {
    id: 'email',
    name: 'Email from your domain',
    does: 'Sends confirmations and receipts from your own address, e.g. hello@hettyglobalacademy.com.',
    without: 'Emails come from a standard sending address with yours as the reply-to.',
    guide: 'email',
  },
];

export default function Connections() {
  const integrations = useStore('integrations');

  function demoToggle(p) {
    const on = integrations[p.id]?.status === 'connected';
    update((s) => ({
      ...s,
      integrations: { ...s.integrations, [p.id]: on ? { status: 'not_connected' } : { status: 'connected', connected_at: new Date().toISOString(), account_label: 'Demo account' } },
    }));
    toast(on ? `${p.name} disconnected` : `${p.name} connected (demo)`);
  }

  return (
    <div className="flex max-w-[900px] flex-col gap-8">
      <AdminHeader title="Connections" sub="Connect your own accounts. You stay in control and can disconnect at any time." />
      <div className="rounded-md bg-grey-100 p-4 text-[14px] leading-[1.6] text-ink-muted">
        You never share passwords with anyone. Each connection uses the service’s own sign-in or a limited key you create. Access details are stored encrypted on the
        server and are never shown in the dashboard.
      </div>
      <ul className="border-b border-hairline">
        {providers.map((p) => {
          const st = integrations[p.id] || { status: 'not_connected' };
          const connected = st.status === 'connected';
          return (
            <li key={p.id} className="flex flex-wrap items-start gap-6 border-t border-hairline py-7">
              <div className="flex min-w-[260px] flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[17px] font-medium">{p.name}</span>
                  <Status value={connected ? 'Connected' : 'Not connected'} />
                </div>
                <p className="text-[14px] leading-[1.6]">{p.does}</p>
                <p className="text-[13px] text-ink-muted">{connected ? `Connected${st.account_label ? ` · ${st.account_label}` : ''}` : `Until connected: ${p.without}`}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/admin/help?guide=${p.guide}`} className="inline-flex h-10 items-center rounded-full border border-[#E2DED8] px-4 text-[14px] font-medium hover:border-charcoal">
                  How it works
                </Link>
                {LIVE ? (
                  <Btn variant="primary" disabled title="Arrives with the payments and calendar update">
                    {connected ? 'Disconnect' : 'Connect'} · coming next
                  </Btn>
                ) : (
                  <Btn variant={connected ? 'ghost' : 'primary'} onClick={() => demoToggle(p)}>
                    {connected ? 'Disconnect' : 'Connect (demo)'}
                  </Btn>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
