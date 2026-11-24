import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Field from '../components/common/Field';
import { fieldClass } from '../lib/forms';
import { completeAccount, useSession } from './auth';
import { ROLE_INFO } from './permissions';

/** Landing page for invitation and password-reset links: set a password (and name). */
export default function Welcome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reset = params.get('reset') === '1';
  const { user, profile, loading } = useSession();
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="p-10 text-[14px] text-ink-muted">Checking your link…</div>;
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAF9F7] px-6 text-center">
        <h1 className="font-display text-[30px]">This link has expired.</h1>
        <p className="max-w-[420px] text-[15px] text-ink-muted">Ask the person who invited you to send a new invitation, or request a new password reset.</p>
        <Link to="/admin/login" className="font-medium text-burgundy">Go to sign in ›</Link>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!reset && name.trim().length < 2) errs.name = 'Enter your name.';
    if (pw.length < 10) errs.pw = 'Use at least 10 characters.';
    else if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) errs.pw = 'Include letters and at least one number.';
    if (pw2 !== pw) errs.pw2 = 'The passwords don’t match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const err = await completeAccount({ password: pw, fullName: reset ? undefined : name.trim() });
    setBusy(false);
    if (err) return setErrors({ pw: err });
    navigate('/admin', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F7] px-6 py-16">
      <form noValidate onSubmit={submit} className="flex w-full max-w-[420px] flex-col gap-5 rounded-lg bg-white p-8 shadow-overlay md:p-10">
        <span className="font-display text-[18px]">Hetty Global Academy</span>
        <h1 className="font-display text-[32px] leading-[1.1] tracking-[-0.5px]">{reset ? 'Choose a new password' : 'Welcome to the team'}</h1>
        {!reset && <p className="text-[14px] text-ink-muted">You’ve been invited with the role: {ROLE_INFO[profile?.role]?.label || 'Team member'}. Set up your account to continue.</p>}
        {!reset && (
          <Field label="Your name" error={errors.name}>
            <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass(errors.name)} />
          </Field>
        )}
        <Field label="Password" error={errors.pw} hint="At least 10 characters, with letters and a number.">
          <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className={fieldClass(errors.pw)} />
        </Field>
        <Field label="Confirm password" error={errors.pw2}>
          <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={fieldClass(errors.pw2)} />
        </Field>
        <button type="submit" disabled={busy} className="h-[52px] rounded-full bg-burgundy text-[16px] font-medium text-white hover:bg-maroon disabled:opacity-60">
          {busy ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
