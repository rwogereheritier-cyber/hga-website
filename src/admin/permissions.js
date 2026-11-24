// Who can open which part of the dashboard. The database enforces the same rules
// (see supabase/migrations), so hiding a screen is a convenience, not the protection.

export const ROLES = ['owner', 'admin', 'assistant', 'editor', 'viewer'];

export const ROLE_INFO = {
  owner: { label: 'Owner', text: 'Everything, including payments, team, connections and settings. There is always exactly one.' },
  admin: { label: 'Admin', text: 'Everything except managing the owner. Can invite assistants, editors and viewers.' },
  assistant: { label: 'Assistant', text: 'Bookings, clients, events and messages. No payments, website content or settings.' },
  editor: { label: 'Editor', text: 'Website content: pages, photos, blog, books, resources and newsletter.' },
  viewer: { label: 'Viewer', text: 'Read-only access to the overview, bookings, clients and events.' },
};

const ALL = ROLES;
const STAFF = ['owner', 'admin', 'assistant'];
const CONTENT = ['owner', 'admin', 'editor'];
const ADMINS = ['owner', 'admin'];

const VIEW = {
  overview: ALL,
  bookings: [...STAFF, 'viewer'],
  clients: [...STAFF, 'viewer'],
  events: [...STAFF, 'viewer'],
  messages: STAFF,
  payments: ADMINS,
  content: CONTENT,
  media: CONTENT,
  blog: CONTENT,
  books: CONTENT,
  resources: CONTENT,
  subscribers: CONTENT,
  team: ADMINS,
  connections: ADMINS,
  settings: ADMINS,
  help: ALL,
};

const EDIT = { ...VIEW, overview: [], bookings: STAFF, clients: STAFF, events: STAFF };

export const canView = (role, area) => Boolean(role && VIEW[area]?.includes(role));
export const canEdit = (role, area) => Boolean(role && EDIT[area]?.includes(role));

/** Roles a person may hand out when inviting or changing someone. */
export const assignableRoles = (role) => (role === 'owner' ? ['admin', 'assistant', 'editor', 'viewer'] : role === 'admin' ? ['assistant', 'editor', 'viewer'] : []);

/** Map a dashboard path to its area, e.g. /admin/blog → blog. */
export const areaOf = (path) => path.replace(/^\/admin\/?/, '').split('/')[0] || 'overview';
