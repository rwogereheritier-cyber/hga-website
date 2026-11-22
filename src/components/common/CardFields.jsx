import Field from './Field';
import { fieldClass } from '../../lib/forms';

/** Demo card inputs. No real payment is processed anywhere in the prototype. */
export default function CardFields({ card, setCard, errors }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <p className="text-small text-ink-muted sm:col-span-2">
        Demo checkout: no real payment is taken. Try 4242 4242 4242 4242, any future date and any 3 digits.
      </p>
      <Field label="Name on card" error={errors.cardName} className="sm:col-span-2">
        <input autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className={fieldClass(errors.cardName)} />
      </Field>
      <Field label="Card number" error={errors.number} className="sm:col-span-2">
        <input
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 1234 1234 1234"
          value={card.number}
          onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, '').slice(0, 23) })}
          className={fieldClass(errors.number)}
        />
      </Field>
      <Field label="Expiry (MM/YY)" error={errors.expiry}>
        <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value.slice(0, 7) })} className={fieldClass(errors.expiry)} />
      </Field>
      <Field label="Security code" error={errors.cvc}>
        <input inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} className={fieldClass(errors.cvc)} />
      </Field>
    </div>
  );
}
