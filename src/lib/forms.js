// Shared form helpers: input styling and demo card validation.

export const fieldClass = (error) =>
  `mt-1.5 block h-[52px] w-full rounded-md border bg-white px-4 text-[16px] text-charcoal transition-colors focus:border-burgundy focus:outline-none ${
    error ? 'border-danger' : 'border-[#E2DED8]'
  }`;

export const emptyCard = { name: '', number: '', expiry: '', cvc: '' };

function luhn(num) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = +num[i];
    if (dbl) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

/** Returns an errors object; empty means the demo card is valid. */
export function validateCard(card) {
  const e = {};
  const num = card.number.replace(/\D/g, '');
  if (card.name.trim().length < 2) e.cardName = 'Enter the name on the card.';
  if (num.length < 13 || num.length > 19 || !luhn(num)) e.number = 'Enter a valid card number.';
  const m = card.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m || +m[1] < 1 || +m[1] > 12 || new Date(2000 + +m[2], +m[1], 1) <= new Date()) e.expiry = 'Enter a future date as MM/YY.';
  if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = 'Enter the 3 or 4 digit code.';
  return e;
}

export const last4 = (card) => card.number.replace(/\D/g, '').slice(-4);

