import { useState } from 'react';
import Field from '../components/common/Field';
import { fieldClass } from '../lib/forms';
import { teamAction, useTeam } from '../lib/team';
import { toast } from '../lib/toast';
import { refreshProfile, useSession } from './auth';
import { fmtDay } from './metrics';
import { ROLE_INFO, assignableRoles } from './permissions';
import { AdminHeader, Btn, Modal, Status, Table } from './ui';
import { td } from './styles';

function RolePicker({ value, onChange, options }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-caption text-ink-muted">Role</legend>
      {options.map((r) => (
        <label key={r} className={`flex cursor-pointer gap-3 rounded-md border p-3.5 ${value === r ? 'border-burgundy bg-[#FBF6F7]' : 'border-[#E2DED8] hover:border-charcoal'}`}>
          <input type="radio" name="role" value={r} checked={value === r} onChange={() => onChange(r)} className="mt-1 accent-burgundy" />
          <span className="flex flex-col gap-0.5">
            <span className="text-[15px] font-medium">{ROLE_INFO[r].label}</span>
            <span className="text-[13px] text-ink-muted">{ROLE_INFO[r].text}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function InviteModal({ roles, onClose, onDone }) {
  const [f, setF] = useState({ fullName: '', email: '', role: roles[roles.length - 2] || roles[0] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.');
    setBusy(true);
    try {
      await teamAction('invite', { ...f, email: f.email.trim() });
      toast(`Invitation sent to ${f.email.trim()}`);
      onDone();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Invite someone to the team" onClose={onClose} footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn variant="primary" onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send invitation'}</Btn></>}>
      <p className="text-[14px] text-ink-muted">They’ll get an email with a link to set their password. You can change their role or remove them at any time.</p>
      <Field label="Name">
        <input value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} className={fieldClass()} />
      </Field>
      <Field label="Email" error={error}>
        <input type="email" value={f.email} onChange={(e) => { setF({ ...f, email: e.target.value }); setError(''); }} className={fieldClass(error)} />
      </Field>
      <RolePicker value={f.role} onChange={(role) => setF({ ...f, role })} options={roles} />
    </Modal>
  );
}

function MemberModal({ member, me, onClose, onDone }) {
  const roles = assignableRoles(me.role);
  const [role, setRole] = useState(member.role);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  async function run(action, payload, message) {
    setBusy(true);
    try {
      await teamAction(action, { id: member.id, ...payload });
      toast(message);
      onDone();
      if (action === 'transfer') refreshProfile();
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const name = member.full_name || member.email;
  const confirms = {
    remove: ['Remove from team', `${name} will lose access immediately. Their past work stays in the activity log.`, () => run('remove', {}, `${name} removed`)],
    disable: ['Pause access', `${name} won’t be able to sign in until you restore access.`, () => run('status', { status: 'disabled' }, `${name}’s access paused`)],
    transfer: ['Make owner', `${name} becomes the owner. You become an admin and can no longer manage the owner.`, () => run('transfer', {}, `${name} is now the owner`)],
  };

  return (
    <Modal
      title={name}
      onClose={onClose}
      footer={
        confirm ? (
          <>
            <span className="mr-auto self-center text-[14px] text-danger">{confirms[confirm][1]}</span>
            <Btn variant="ghost" onClick={() => setConfirm(null)}>Back</Btn>
            <Btn variant="danger" onClick={confirms[confirm][2]} disabled={busy}>{confirms[confirm][0]}</Btn>
          </>
        ) : (
          <>
            <Btn variant="danger" className="mr-auto" onClick={() => setConfirm('remove')}>Remove</Btn>
            <Btn variant="ghost" onClick={onClose}>Close</Btn>
            <Btn variant="primary" onClick={() => run('role', { role }, `${name} is now ${ROLE_INFO[role].label.toLowerCase()}`)} disabled={busy || role === member.role}>
              Save role
            </Btn>
          </>
        )
      }
    >
      <p className="text-[14px] text-ink-muted">{member.email}</p>
      <RolePicker value={role} onChange={setRole} options={roles} />
      <div className="flex flex-wrap gap-2 border-t border-hairline pt-4">
        {member.status === 'invited' && <Btn variant="ghost" onClick={() => run('resend', {}, 'Invitation sent again')}>Resend invitation</Btn>}
        {member.status === 'active' && <Btn variant="ghost" onClick={() => setConfirm('disable')}>Pause access</Btn>}
        {member.status === 'disabled' && <Btn variant="ghost" onClick={() => run('status', { status: 'active' }, 'Access restored')}>Restore access</Btn>}
        {me.role === 'owner' && member.status === 'active' && <Btn variant="ghost" onClick={() => setConfirm('transfer')}>Make owner</Btn>}
      </div>
    </Modal>
  );
}

export default function Team() {
  const { profile: me } = useSession();
  const { members, loading, refresh } = useTeam();
  const [inviting, setInviting] = useState(false);
  const [open, setOpen] = useState(null);
  const roles = assignableRoles(me.role);
  const current = open && members?.find((m) => m.id === open);
  const canManage = (m) => m.id !== me.id && m.role !== 'owner' && !(me.role === 'admin' && m.role === 'admin');

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Team" sub="Who can use this dashboard, and what they can do">
        <Btn variant="primary" onClick={() => setInviting(true)}>Invite someone</Btn>
      </AdminHeader>

      {loading ? (
        <p className="text-[14px] text-ink-muted">Loading team…</p>
      ) : (
        <Table columns={[{ key: 'n', label: 'Person' }, { key: 'r', label: 'Role' }, { key: 's', label: 'Status' }, { key: 'l', label: 'Last active' }, { key: 'x', label: '' }]} minWidth={640}>
          {members.map((m) => (
            <tr key={m.id}>
              <td className={td}>
                <div className="font-medium">
                  {m.full_name || '—'} {m.id === me.id && <span className="ml-1 text-[12px] font-normal text-ink-muted">(you)</span>}
                </div>
                <div className="text-[13px] text-ink-muted">{m.email}</div>
              </td>
              <td className={td}>{ROLE_INFO[m.role]?.label}</td>
              <td className={td}>
                <Status value={m.status === 'invited' ? 'Invited' : m.status === 'disabled' ? 'Paused' : 'Active'} />
              </td>
              <td className={td}>{m.last_seen_at ? fmtDay(new Date(m.last_seen_at).getTime()) : '—'}</td>
              <td className={`${td} text-right`}>
                {canManage(m) && (
                  <button type="button" onClick={() => setOpen(m.id)} className="font-medium text-burgundy">
                    Manage
                  </button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      <section className="flex flex-col gap-3 border-t border-hairline pt-8">
        <h2 className="text-[16px] font-medium">What each role can do</h2>
        <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {Object.entries(ROLE_INFO).map(([k, r]) => (
            <div key={k} className="flex flex-col gap-1">
              <span className="text-[15px] font-medium">{r.label}</span>
              <span className="text-[14px] text-ink-muted">{r.text}</span>
            </div>
          ))}
        </div>
      </section>

      {inviting && <InviteModal roles={roles} onClose={() => setInviting(false)} onDone={refresh} />}
      {current && <MemberModal member={current} me={me} onClose={() => setOpen(null)} onDone={refresh} />}
    </div>
  );
}
