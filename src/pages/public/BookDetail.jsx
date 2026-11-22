import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BookCover from '../../components/common/BookCover';
import { Button } from '../../components/common/Button';
import CardFields from '../../components/common/CardFields';
import { emptyCard, last4, validateCard } from '../../lib/forms';
import Field from '../../components/common/Field';
import { fieldClass } from '../../lib/forms';
import { money } from '../../lib/format';
import { addOrder, makeRef, useStore } from '../../lib/store';
import ComingSoon from './ComingSoon';

function Purchase({ book, onClose }) {
  const [format, setFormat] = useState(book.formats[0]);
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [card, setCard] = useState(emptyCard);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const physical = format === 'Paperback';

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (physical && form.address.trim().length < 10) errs.address = 'Enter your full delivery address.';
    Object.assign(errs, validateCard(card));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setTimeout(() => {
      const ref = makeRef('ORD');
      const now = Date.now();
      addOrder(
        { ref, book: book.title, format, ...form, amount: book.price, date: now, status: physical ? 'Processing' : 'Delivered' },
        { ref: makeRef('TXN'), bookingRef: ref, client: form.name, email: form.email, service: `${book.title} (${format})`, amount: book.price, date: now, status: 'Paid', method: `Card •••• ${last4(card)}` },
      );
      setBusy(false);
      setDone(ref);
    }, 1200);
  }

  function downloadSample() {
    const text = `${book.title}\nby ${book.author}\n\nThis is a placeholder file for the prototype.\nThe real ${format} will be delivered here once the publication is uploaded.\n\nOrder: ${done}`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.slug}-${format.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4" role="status">
        <h2 className="font-display text-[30px] leading-[1.15]">Thank you for your order.</h2>
        <p className="text-small text-ink-muted">
          Order <span className="font-medium text-charcoal">{done}</span> · {format} · {money(book.price)} paid. A receipt is on its way to {form.email}.
        </p>
        {physical ? (
          <p className="text-small">Your paperback will be posted to the address you gave.</p>
        ) : book.fileUrl ? (
          <a href={book.fileUrl} target="_blank" rel="noreferrer" className="self-start rounded-full bg-burgundy px-7 py-[14px] text-[16px] font-medium text-white hover:bg-maroon">
            Download {format}
          </a>
        ) : (
          <Button onClick={downloadSample} className="self-start">
            Download {format}
          </Button>
        )}
        <p className="text-caption text-ink-muted">Demo: no payment was taken; the download is a placeholder file.</p>
        <button type="button" onClick={onClose} className="self-start text-small font-medium text-burgundy">
          Close
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <h2 className="font-display text-[30px] leading-[1.15]">Buy the book</h2>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-caption text-ink-muted">Format</legend>
        <div className="flex flex-wrap gap-2">
          {book.formats.map((f) => (
            <label key={f} className={`cursor-pointer rounded-full border px-4 py-2 text-[14px] ${format === f ? 'border-burgundy bg-burgundy text-white' : 'border-[#E2DED8] hover:border-charcoal'}`}>
              <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="sr-only" />
              {f}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Full name" error={errors.name}>
        <input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass(errors.name)} />
      </Field>
      <Field label="Email" error={errors.email} hint={physical ? undefined : 'Your download link is sent here.'}>
        <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass(errors.email)} />
      </Field>
      {physical && (
        <Field label="Delivery address" error={errors.address}>
          <textarea rows={3} autoComplete="street-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`${fieldClass(errors.address)} h-auto py-3`} />
        </Field>
      )}
      <CardFields card={card} setCard={setCard} errors={errors} />
      <Button type="submit" disabled={busy} className="mt-2">
        {busy ? 'Processing…' : `Pay ${money(book.price)}`}
      </Button>
    </form>
  );
}

export default function BookDetail() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const books = useStore('books');
  const book = books.find((b) => b.slug === slug);
  if (!book) return <ComingSoon title="Book not found" />;
  const buying = params.get('buy') === '1';

  return (
    <div className="container-page pb-section-sm pt-12 md:pb-section md:pt-20">
      <Link to="/books" className="text-small font-medium text-burgundy">
        ‹ Books
      </Link>
      <div className="mt-12 flex flex-wrap items-start gap-16 lg:gap-24">
        <div className="flex flex-[1_1_300px] justify-center rounded-lg bg-grey-100 py-16">
          <BookCover title={book.title} author={book.author} size="lg" src={book.cover} />
        </div>
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
          <AnimatePresence mode="wait">
            {buying ? (
              <motion.div key="buy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Purchase book={book} onClose={() => setParams({})} />
              </motion.div>
            ) : (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">
                <span className="eyebrow">Publication</span>
                <h1 className="font-display text-[40px] font-medium leading-[1.06] tracking-[-1px] md:text-display-l">{book.title}</h1>
                <span className="text-small text-ink-muted">
                  By {book.author} · {book.formats.join(', ')}
                </span>
                <p className="text-[18px] leading-[1.7]">{book.description}</p>
                <div>
                  <h2 className="mb-3 text-[17px] font-medium">Inside</h2>
                  <ul className="border-b border-hairline">
                    {book.contents.map((c) => (
                      <li key={c} className="border-t border-hairline py-3.5 text-small">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <span className="text-[28px] font-medium">{money(book.price)}</span>
                  <Button onClick={() => setParams({ buy: '1' })}>Buy now</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
