// Demo records for the admin dashboard. Deterministic so every visitor sees the same data.
// The brief's headline figures (128 bookings, $8,450 revenue, 96 clients, 1,250 subscribers)
// are treated as a baseline; the sample records below are the most recent slice of it, and
// anything created on the public site is added on top.

export const BASELINE = { bookings: 128, revenue: 8450, clients: 96, subscribers: 1250 };

const people = [
  ['Adaeze Okafor', 'Nigeria'], ['Maria Santos', 'Philippines'], ['Kwame Asante', 'Ghana'], ['Priya Raman', 'India'],
  ['Grace Wanjiru', 'Kenya'], ['Jean-Claude Mugisha', 'Rwanda'], ['Fatima Bello', 'Nigeria'], ['Joy Mensah', 'Ghana'],
  ['Angela Cruz', 'Philippines'], ['Esther Nakato', 'Uganda'], ['Chipo Moyo', 'Zimbabwe'], ['Samuel Tanko', 'Cameroon'],
  ['Aisha Khan', 'Pakistan'], ['Ruth Adeyemi', 'Nigeria'], ['Linda Mthembu', 'South Africa'], ['Daniel Osei', 'Ghana'],
  ['Mercy Achieng', 'Kenya'], ['Rose Uwase', 'Rwanda'], ['Patience Eze', 'Nigeria'], ['Sarah Thompson', 'Jamaica'],
];
const services = [
  ['nclex', 75, 45],
  ['english', 65, 45],
  ['career', 85, 45],
  ['mentorship', 90, 60],
];
const names = { nclex: 'NCLEX consultation', english: 'English language consultation', career: 'Nursing career consultation', mentorship: 'General mentorship' };
const notes = {
  nclex: 'I need a study plan for NCLEX in the spring.',
  english: 'Preparing for CELPIP speaking, aiming for a higher band.',
  career: 'Looking for guidance on nursing roles in Canada.',
  mentorship: 'I want to talk through my next career step.',
};

const DAY = 86400000;
const ANCHOR = Date.UTC(2026, 10, 22, 0, 0); // 22 Nov 2026
const pad = (n, w = 4) => String(n).padStart(w, '0');
const email = (name) => `${name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/\.$/, '')}@example.com`;

export const demoBookings = [];
export const demoPayments = [];

for (let i = 0; i < 28; i++) {
  const [name, country] = people[(i * 7) % people.length];
  const [serviceId, price, duration] = services[(i * 3) % services.length];
  const offsetDays = i < 8 ? i * 2 + 1 : -((i - 7) * 3);
  const hour = [14, 15, 17, 19, 20][i % 5];
  const start = ANCHOR + offsetDays * DAY + hour * 3600000;
  const future = offsetDays > 0;
  const status = future ? (i % 4 === 1 ? 'Pending' : 'Confirmed') : i % 9 === 4 ? 'Cancelled' : 'Completed';
  const ref = `HGA-D${pad(1100 - i)}`;
  const createdAt = start - (6 + (i % 10)) * DAY;
  demoBookings.push({
    ref,
    serviceId,
    start,
    duration,
    amount: price,
    status,
    paymentStatus: status === 'Cancelled' ? 'Refunded' : status === 'Pending' ? 'Pending' : 'Paid',
    createdAt,
    zoom: `https://zoom.us/j/${pad(8200000000 + i * 7919, 10)}`,
    name,
    email: email(name),
    phone: `+${200 + (i % 60)} ${pad(700000 + i * 3571, 7)}`,
    country,
    notes: notes[serviceId],
  });
  demoPayments.push({
    ref: `TXN-D${pad(5200 - i)}`,
    bookingRef: ref,
    client: name,
    email: email(name),
    service: names[serviceId],
    amount: price,
    date: createdAt,
    status: status === 'Cancelled' ? 'Refunded' : status === 'Pending' ? 'Pending' : 'Paid',
    method: `Card •••• ${pad(4242 + i * 13, 4).slice(-4)}`,
  });
}

export const demoSubscribers = people.slice(0, 16).map(([name], i) => ({
  name,
  email: email(name),
  date: ANCHOR - i * 4 * DAY,
  source: i % 3 === 0 ? 'Event registration' : 'Homepage',
}));

// Revenue by month for the chart (demo history; the current month adds live payments).
export const revenueHistory = [
  { month: 'Jun', value: 980 },
  { month: 'Jul', value: 1240 },
  { month: 'Aug', value: 1410 },
  { month: 'Sep', value: 1300 },
  { month: 'Oct', value: 1600 },
];
