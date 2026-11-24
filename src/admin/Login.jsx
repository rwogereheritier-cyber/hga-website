import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Field from '../components/common/Field';
import { fieldClass } from '../lib/forms';
import { LIVE } from '../lib/supabase';
import { DEMO_EMAIL, DEMO_PASSWORD, sendReset, signIn, useSession } from './auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useSession();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={location.state?.from || '/admin'} replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter your email address.');
    setBusy(true);
    if (mode === 'reset') {
      const err = await sendReset(email);
      setBusy(false);
      if (err) return setError(err);
      setNotice(`If ${email.trim()} has an account, a reset link is on its way. Check your inbox.`);
      return setMode('signin');
    }
    if (!password) {
      setBusy(false);
      return setError('Enter your password.');
    }
    const err = await signIn(email, password);
    setBusy(false);
    if (err) return setError(err);
    navigate(location.state?.from || '/admin', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F7] px-6 py-16">
      <form noValidate onSubmit={submit} className="flex w-full max-w-[400px] flex-col gap-5 rounded-lg bg-white p-8 shadow-overlay md:p-10">
        <div className="flex flex-col gap-2">
          <span className="font-display text-[18px]">Hetty Global Academy</span>
          <h1 className="font-display text-[32px] leading-[1.1] tracking-[-0.5px]">{mode === 'reset' ? 'Reset your password' : 'Sign in'}</h1>
        </div>
        {notice && (
          <p role="status" className="rounded-md bg-[#EEF6F0] p-3 text-[14px] text-success">
            {notice}
          </p>
        )}
        <Field label="Email">
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass(error)} />
        </Field>
        {mode === 'signin' && (
          <Field label="Password">
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass(error)} />
          </Field>
        )}
        {error && (
          <p role="alert" className="text-[14px] text-danger">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="h-[52px] rounded-full bg-burgundy text-[16px] font-medium text-white hover:bg-maroon disabled:opacity-60">
          {busy ? 'Please wait…' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
        </button>
        <button type="button" onClick={() => { setMode(mode === 'reset' ? 'signin' : 'reset'); setError(''); }} className="text-[14px] font-medium text-burgundy">
          {mode === 'reset' ? '‹ Back to sign in' : 'Forgot your password?'}
        </button>
        {!LIVE && (
          <div className="rounded-md bg-grey-100 p-4 text-[13px] leading-[1.6] text-ink-muted">
            <strong className="font-medium text-charcoal">Demo mode.</strong> The real backend isn’t connected yet, so this sign-in protects nothing. Use{' '}
            <span className="text-charcoal">{DEMO_EMAIL}</span> / <span className="text-charcoal">{DEMO_PASSWORD}</span>.
          </div>
        )}
      </form>
      <Link to="/" className="mt-6 text-[14px] text-ink-muted hover:text-charcoal">
        ‹ Back to website
      </Link>
    </div>
  );
}
