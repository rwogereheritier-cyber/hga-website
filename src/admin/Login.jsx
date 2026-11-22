import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Field from '../components/common/Field';
import { fieldClass } from '../lib/forms';
import { DEMO_EMAIL, DEMO_PASSWORD, isSignedIn, signIn } from './auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isSignedIn()) return <Navigate to="/admin" replace />;

  function submit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Enter your email and password.');
    if (!signIn(email, password)) return setError('Those details don’t match the demo account.');
    navigate(location.state?.from && location.state.from !== '/admin/login' ? location.state.from : '/admin', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F7] px-6 py-16">
      <form noValidate onSubmit={submit} className="flex w-full max-w-[400px] flex-col gap-5 rounded-lg bg-white p-8 shadow-overlay md:p-10">
        <div className="flex flex-col gap-2">
          <span className="font-display text-[18px]">Hetty Global Academy</span>
          <h1 className="font-display text-[32px] leading-[1.1] tracking-[-0.5px]">Admin sign in</h1>
        </div>
        <Field label="Email">
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass(error)} />
        </Field>
        <Field label="Password">
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={fieldClass(error)} />
        </Field>
        {error && (
          <p role="alert" className="text-[14px] text-danger">
            {error}
          </p>
        )}
        <button type="submit" className="h-[52px] rounded-full bg-burgundy text-[16px] font-medium text-white hover:bg-maroon">
          Sign in
        </button>
        <div className="rounded-md bg-grey-100 p-4 text-[13px] leading-[1.6] text-ink-muted">
          <strong className="font-medium text-charcoal">Demo only.</strong> This sign-in is not secure and protects nothing. Use{' '}
          <span className="text-charcoal">{DEMO_EMAIL}</span> / <span className="text-charcoal">{DEMO_PASSWORD}</span>.
        </div>
      </form>
      <Link to="/" className="mt-6 text-[14px] text-ink-muted hover:text-charcoal">
        ‹ Back to website
      </Link>
    </div>
  );
}
