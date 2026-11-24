import { update } from './store';
import { LIVE, supabase } from './supabase';

// Bridge between the browser store and Supabase. In demo mode every function just updates the
// local store; in live mode it writes to the database first and then updates the store.

const CONTENT_KEYS = ['hero', 'about', 'founder', 'stats', 'contact', 'socials'];

/** Load public website data (text, prices, photos) from the database at start-up. */
export async function hydratePublic() {
  if (!LIVE) return;
  const [content, services, media, slots] = await Promise.all([
    supabase.from('site_content').select('key,value'),
    supabase.from('services').select('*').order('sort'),
    supabase.from('media').select('*').order('created_at', { ascending: false }),
    supabase.from('site_images').select('slot,media_id'),
  ]);
  update((s) => ({
    ...s,
    content: { ...s.content, ...Object.fromEntries((content.data || []).map((r) => [r.key, r.value])) },
    consultations: services.data?.length
      ? services.data.map((x) => ({ id: x.id, name: x.name, programme: x.programme, price: Number(x.price), duration: x.duration_min, summary: x.summary }))
      : s.consultations,
    media: (media.data || []).map(fromRow),
    siteImages: Object.fromEntries((slots.data || []).filter((r) => r.media_id).map((r) => [r.slot, r.media_id])),
  }));
}

/** Load dashboard-only data once someone is signed in. */
export async function hydrateAdmin() {
  if (!LIVE) return;
  const [settings, integrations] = await Promise.all([
    supabase.from('settings').select('key,value'),
    supabase.from('integrations').select('*'),
  ]);
  update((s) => ({
    ...s,
    settings: { ...s.settings, ...Object.fromEntries((settings.data || []).map((r) => [r.key, r.value])) },
    integrations: { ...s.integrations, ...Object.fromEntries((integrations.data || []).map((r) => [r.provider, r])) },
  }));
}

const fromRow = (r) => ({ id: r.id, url: r.url, path: r.path, alt: r.alt, width: r.width, height: r.height, size: r.size_bytes, focalX: Number(r.focal_x), focalY: Number(r.focal_y), createdAt: r.created_at });

export async function saveContent(patch) {
  if (LIVE) {
    const rows = Object.entries(patch).filter(([k]) => CONTENT_KEYS.includes(k)).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('site_content').upsert(rows);
    if (error) throw new Error('Couldn’t save. Check your connection and try again.');
  }
  update((s) => ({ ...s, content: { ...s.content, ...patch } }));
}

export async function savePrices(list) {
  if (LIVE) {
    const { error } = await supabase.from('services').upsert(list.map((p, i) => ({ id: p.id, name: p.name, programme: p.programme, price: p.price, duration_min: p.duration, summary: p.summary, sort: i + 1 })));
    if (error) throw new Error('Couldn’t save prices. Try again.');
  }
  update((s) => ({ ...s, consultations: list }));
}

export async function saveSetting(key, value) {
  if (LIVE) {
    const { error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw new Error('Couldn’t save settings. Try again.');
  }
  update((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
}

// ── Photos ────────────────────────────────────────────────────

/** Resize and compress in the browser before upload: smaller files, faster site. */
export async function optimiseImage(file) {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) throw new Error('Use a JPG, PNG or WebP photo.');
  if (file.size > 20 * 1024 * 1024) throw new Error('That photo is over 20 MB. Choose a smaller one.');
  const bitmap = await createImageBitmap(file);
  const max = LIVE ? 2400 : 1400;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', LIVE ? 0.85 : 0.75));
  if (!blob) throw new Error('This browser couldn’t process the photo. Try another browser.');
  return { blob, width, height };
}

const blobToDataUrl = (blob) =>
  new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });

export async function uploadPhoto(file, alt) {
  const { blob, width, height } = await optimiseImage(file);
  const id = crypto.randomUUID();
  let item;
  if (LIVE) {
    const path = `${new Date().getFullYear()}/${id}.webp`;
    const up = await supabase.storage.from('media').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' });
    if (up.error) throw new Error('Upload failed. Check your connection and try again.');
    const url = supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
    const { data, error } = await supabase.from('media').insert({ id, path, url, alt, width, height, size_bytes: blob.size }).select().single();
    if (error) throw new Error('The photo uploaded but couldn’t be saved. Try again.');
    item = fromRow(data);
  } else {
    item = { id, url: await blobToDataUrl(blob), path: '', alt, width, height, size: blob.size, focalX: 50, focalY: 50, createdAt: new Date().toISOString() };
  }
  update((s) => ({ ...s, media: [item, ...s.media] }));
  return item;
}

export async function updatePhoto(id, patch) {
  if (LIVE) {
    const row = {};
    if ('alt' in patch) row.alt = patch.alt;
    if ('focalX' in patch) row.focal_x = patch.focalX;
    if ('focalY' in patch) row.focal_y = patch.focalY;
    const { error } = await supabase.from('media').update(row).eq('id', id);
    if (error) throw new Error('Couldn’t save the photo details.');
  }
  update((s) => ({ ...s, media: s.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
}

export async function deletePhoto(item) {
  if (LIVE) {
    await supabase.storage.from('media').remove([item.path]);
    const { error } = await supabase.from('media').delete().eq('id', item.id);
    if (error) throw new Error('Couldn’t delete the photo.');
  }
  update((s) => ({
    ...s,
    media: s.media.filter((m) => m.id !== item.id),
    siteImages: Object.fromEntries(Object.entries(s.siteImages).filter(([, v]) => v !== item.id)),
  }));
}

export async function setSlotPhoto(slot, mediaId) {
  if (LIVE) {
    const { error } = await supabase.from('site_images').upsert({ slot, media_id: mediaId, updated_at: new Date().toISOString() });
    if (error) throw new Error('Couldn’t update the website photo.');
  }
  update((s) => {
    const siteImages = { ...s.siteImages };
    if (mediaId) siteImages[slot] = mediaId;
    else delete siteImages[slot];
    return { ...s, siteImages };
  });
}
