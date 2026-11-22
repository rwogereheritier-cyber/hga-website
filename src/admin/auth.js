// DEMO ONLY. This is not real authentication: credentials live in the frontend and the
// "session" is a sessionStorage flag. Replace with server-side auth before any real use.
export const DEMO_EMAIL = 'admin@hettyglobalacademy.com';
export const DEMO_PASSWORD = 'Admin123!';
const KEY = 'hga.admin.demo';

export const isSignedIn = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export function signIn(email, password) {
  const ok = email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
  if (ok) sessionStorage.setItem(KEY, '1');
  return ok;
}

export function signOut() {
  sessionStorage.removeItem(KEY);
}
