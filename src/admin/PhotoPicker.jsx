import { useState } from 'react';
import Field from '../components/common/Field';
import { fieldClass } from '../lib/forms';
import { uploadPhoto } from '../lib/live';
import { useStore } from '../lib/store';
import { toast } from '../lib/toast';
import { Btn, Modal, Tabs } from './ui';

/** Upload a new photo with its description. Calls onUploaded(item). */
export function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [alt, setAlt] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function pick(f) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  }

  async function upload() {
    if (!file) return setError('Choose a photo first.');
    if (alt.trim().length < 5) return setError('Describe the photo in a few words (for people using screen readers).');
    setBusy(true);
    try {
      const item = await uploadPhoto(file, alt.trim());
      toast('Photo uploaded');
      onUploaded(item);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
        className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed border-[#CFC8C0] bg-[#FAF9F7] text-center text-[14px] text-ink-muted hover:border-charcoal"
      >
        {preview ? (
          <img src={preview} alt="" className="max-h-[260px] w-full object-contain" />
        ) : (
          <>
            <span className="text-[15px] font-medium text-charcoal">Drop a photo here, or click to choose</span>
            <span>JPG, PNG or WebP. Large photos are resized and compressed automatically.</span>
          </>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pick(e.target.files?.[0])} className="sr-only" />
      </label>
      <Field label="Describe the photo" hint="E.g. “Hetty smiling in a white blazer at her desk”. Shown to screen-reader users and search engines." error={error}>
        <input value={alt} onChange={(e) => setAlt(e.target.value)} className={fieldClass(error)} />
      </Field>
      <Btn variant="primary" className="self-start" onClick={upload} disabled={busy}>
        {busy ? 'Optimising and uploading…' : 'Upload photo'}
      </Btn>
    </div>
  );
}

/** Choose an existing photo or upload a new one. Calls onPick(item). */
export default function PhotoPicker({ title = 'Choose a photo', onPick, onClose }) {
  const media = useStore('media');
  const [tab, setTab] = useState(media.length ? 'Your photos' : 'Upload new');

  return (
    <Modal title={title} onClose={onClose} wide>
      <Tabs options={['Your photos', 'Upload new']} value={tab} onChange={setTab} label="Photo source" />
      {tab === 'Upload new' ? (
        <UploadForm onUploaded={onPick} />
      ) : media.length === 0 ? (
        <p className="py-8 text-center text-[14px] text-ink-muted">No photos yet. Upload your first one.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((m) => (
            <button key={m.id} type="button" onClick={() => onPick(m)} className="group flex flex-col gap-1.5 text-left">
              <img src={m.url} alt={m.alt} className="aspect-[4/3] w-full rounded-md object-cover ring-burgundy transition group-hover:ring-2" style={{ objectPosition: `${m.focalX}% ${m.focalY}%` }} />
              <span className="line-clamp-1 text-[12px] text-ink-muted">{m.alt}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

/** Form field: pick a photo from the library (or upload). value = photo URL. */
export function PhotoField({ value, onChange, label = 'Cover photo' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2 text-caption text-ink-muted">
      <span>{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-md bg-grey-100 text-[12px]">
          {value ? <img src={value} alt="Selected photo" className="h-full w-full object-cover" /> : 'No photo'}
        </div>
        <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-[#E2DED8] px-4 py-2 text-[13px] font-medium text-charcoal hover:border-charcoal">
          {value ? 'Change photo' : 'Choose photo'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-[13px] text-danger">
            Remove
          </button>
        )}
      </div>
      {open && (
        <PhotoPicker
          title={label}
          onClose={() => setOpen(false)}
          onPick={(item) => {
            onChange(item.url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
