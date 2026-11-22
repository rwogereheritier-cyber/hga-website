import { useState } from 'react';
import { resetStore } from '../lib/store';
import { HOST_TZ } from '../lib/time';
import { toast } from '../lib/toast';
import { DEMO_EMAIL } from './auth';
import { AdminHeader, Btn, Details, Modal } from './ui';

export default function Settings() {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="flex max-w-[760px] flex-col gap-10">
      <AdminHeader title="Settings" />

      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-medium">Account</h2>
        <Details rows={[['Signed in as', DEMO_EMAIL], ['Role', 'Administrator (demo)'], ['Sign-in security', 'None: demo only, replace before launch']]} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-medium">Business settings</h2>
        <Details
          rows={[
            ['Booking time zone', `${HOST_TZ} (to confirm with Hetty)`],
            ['Currency', 'To confirm: CAD or USD'],
            ['Booking hours', 'Weekdays, 9:00 to 17:00 (to confirm)'],
            ['Payments', 'Simulated; ready to connect Stripe'],
            ['Video calls', 'Placeholder Zoom links; ready to connect Zoom'],
            ['Emails', 'Not sent; ready to connect an email service'],
          ]}
        />
      </section>

      <section className="flex flex-col gap-4 border-t border-hairline pt-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-[17px] font-medium">Reset demo data</h2>
          <p className="text-[14px] text-ink-muted">
            Removes test bookings, registrations, orders and edits made in this browser and restores the original demo content.
          </p>
        </div>
        <Btn variant="danger" className="self-start" onClick={() => setConfirm(true)}>
          Reset demo data
        </Btn>
      </section>

      {confirm && (
        <Modal
          title="Reset all demo data?"
          onClose={() => setConfirm(false)}
          footer={
            <>
              <Btn variant="ghost" onClick={() => setConfirm(false)}>
                Cancel
              </Btn>
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
