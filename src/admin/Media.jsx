import { useState } from 'react';
import Field from '../components/common/Field';
import { photoSlots } from '../data/slots';
import { fieldClass } from '../lib/forms';
import { deletePhoto, setSlotPhoto, updatePhoto } from '../lib/live';
import { kb } from '../lib/photos';
import { useStore } from '../lib/store';
import { toast } from '../lib/toast';
import PhotoPicker, { UploadForm } from './PhotoPicker';
import { AdminHeader, Btn, Modal, Tabs } from './ui';

function Slots() {
  const media = useStore('media');
  const siteImages = useStore('siteImages');
  const [picking, setPicking] = useState(null);
  const filled = photoSlots.filter((s) => siteImages[s.key]).length;
  const byId = (id) => media.find((m) => m.id === id);

  async function place(slot, item) {
    try {
      await setSlotPhoto(slot.key, item?.id || null);
      toast(item ? `${slot.label} updated on the website` : `${slot.label} removed`);
    } catch (e) {
      toast(e.message, 'error');
    }
    setPicking(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[14px]">
          <span>
            <strong className="font-medium">{filled} of {photoSlots.length}</strong> website photos added
          </span>
          <span className="text-ink-muted">Empty spots show a grey placeholder on the site</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-grey-100" role="progressbar" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={photoSlots.length}>
          <div className="h-full rounded-full bg-burgundy transition-[width] duration-300" style={{ width: `${(filled / photoSlots.length) * 100}%` }} />
        </div>
      </div>
      <ul className="border-b border-hairline">
        {photoSlots.map((slot) => {
          const item = byId(siteImages[slot.key]);
          return (
            <li key={slot.key} className="flex flex-wrap items-center gap-5 border-t border-hairline py-5">
              {item ? (
                <img src={item.url} alt={item.alt} className="h-[72px] w-[108px] rounded-md object-cover" style={{ objectPosition: `${item.focalX}% ${item.focalY}%` }} />
              ) : (
                <span className="flex h-[72px] w-[108px] items-center justify-center rounded-md border border-dashed border-[#CFC8C0] text-[12px] text-ink-muted">Empty</span>
              )}
              <span className="flex min-w-[220px] flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-medium">
                  {slot.label} {item && <span className="ml-1 text-[13px] font-normal text-success">✓ Added</span>}
                </span>
                <span className="text-[13px] text-ink-muted">{slot.where}</span>
                <span className="text-[13px] text-ink-muted">Best size: {slot.size}</span>
              </span>
              <span className="flex gap-2">
                <Btn variant={item ? 'ghost' : 'primary'} onClick={() => setPicking(slot)}>
                  {item ? 'Change' : 'Add photo'}
                </Btn>
                {item && (
                  <Btn variant="ghost" onClick={() => place(slot, null)}>
                    Remove
                  </Btn>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {picking && <PhotoPicker title={`Photo for: ${picking.label}`} onPick={(item) => place(picking, item)} onClose={() => setPicking(null)} />}
    </div>
  );
}

function PhotoDetails({ item, usedIn, onClose }) {
  const [alt, setAlt] = useState(item.alt);
  const [focal, setFocal] = useState({ x: item.focalX, y: item.focalY });
  const [confirm, setConfirm] = useState(false);

  async function save() {
    if (alt.trim().length < 5) return toast('Add a short description first', 'error');
    try {
      await updatePhoto(item.id, { alt: alt.trim(), focalX: Math.round(focal.x), focalY: Math.round(focal.y) });
      toast('Photo details saved');
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function remove() {
    try {
      await deletePhoto(item);
      toast('Photo deleted');
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <Modal
      title="Photo details"
      onClose={onClose}
      wide
      footer={
        confirm ? (
          <>
            <span className="mr-auto self-center text-[14px] text-danger">{usedIn.length ? `Used in ${usedIn.length} place(s); they’ll show a placeholder.` : 'Delete this photo?'}</span>
            <Btn variant="ghost" onClick={() => setConfirm(false)}>Keep it</Btn>
            <Btn variant="danger" onClick={remove}>Delete photo</Btn>
          </>
        ) : (
          <>
            <Btn variant="danger" className="mr-auto" onClick={() => setConfirm(true)}>Delete</Btn>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={save}>Save</Btn>
          </>
        )
      }
    >
      <div className="flex flex-col gap-2">
        <span className="text-caption text-ink-muted">Focus point: click the part that must always stay visible (usually a face). Crops on the website keep it in view.</span>
        <button
          type="button"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setFocal({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          className="relative block w-full cursor-crosshair overflow-hidden rounded-md"
          aria-label="Set focus point"
        >
          <img src={item.url} alt={item.alt} className="block max-h-[360px] w-full object-contain" />
          <span aria-hidden="true" className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />
        </button>
        <div className="flex items-end gap-3">
          {['aspect-[16/9]', 'aspect-[4/3]', 'aspect-[4/5]'].map((a) => (
            <img key={a} src={item.url} alt="" className={`${a} h-24 rounded object-cover`} style={{ objectPosition: `${focal.x}% ${focal.y}%` }} />
          ))}
        </div>
        <span className="text-[12px] text-ink-muted">Preview of wide, standard and portrait crops.</span>
      </div>
      <Field label="Description">
        <input value={alt} onChange={(e) => setAlt(e.target.value)} className={fieldClass()} />
      </Field>
      <p className="text-[13px] text-ink-muted">
        {item.width} × {item.height} px · {kb(item.size)}
        {usedIn.length > 0 && ` · On the website: ${usedIn.join(', ')}`}
      </p>
    </Modal>
  );
}

function Library() {
  const media = useStore('media');
  const siteImages = useStore('siteImages');
  const [open, setOpen] = useState(null);
  const [uploading, setUploading] = useState(false);
  const current = open && media.find((m) => m.id === open);
  const usedIn = (id) => photoSlots.filter((s) => siteImages[s.key] === id).map((s) => s.label);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-ink-muted">{media.length} photo{media.length === 1 ? '' : 's'}</span>
        <Btn variant="primary" onClick={() => setUploading(true)}>Upload photo</Btn>
      </div>
      {media.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#CFC8C0] py-16 text-center">
          <span className="text-[16px] font-medium">No photos yet</span>
          <span className="max-w-[360px] text-[14px] text-ink-muted">Upload photos of Hetty, sessions and learners. You can then place them anywhere on the website.</span>
          <Btn variant="primary" onClick={() => setUploading(true)}>Upload your first photo</Btn>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <button key={m.id} type="button" onClick={() => setOpen(m.id)} className="group flex flex-col gap-2 text-left">
              <img src={m.url} alt={m.alt} className="aspect-[4/3] w-full rounded-md object-cover transition group-hover:shadow-hover" style={{ objectPosition: `${m.focalX}% ${m.focalY}%` }} />
              <span className="line-clamp-1 text-[13px]">{m.alt}</span>
              <span className="text-[12px] text-ink-muted">{usedIn(m.id).length ? `On website · ${usedIn(m.id).length}` : 'Not used yet'}</span>
            </button>
          ))}
        </div>
      )}
      {uploading && (
        <Modal title="Upload a photo" onClose={() => setUploading(false)} wide>
          <UploadForm onUploaded={() => setUploading(false)} />
        </Modal>
      )}
      {current && <PhotoDetails item={current} usedIn={usedIn(current.id)} onClose={() => setOpen(null)} />}
    </div>
  );
}

export default function Media() {
  const [tab, setTab] = useState('Website photos');
  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="Photos" sub="Upload once, use anywhere on the website" />
      <Tabs options={['Website photos', 'Library']} value={tab} onChange={setTab} label="Photos view" />
      {tab === 'Website photos' ? <Slots /> : <Library />}
    </div>
  );
}
