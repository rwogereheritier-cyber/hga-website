// Built-in help guides. `areas` decides which screens show the guide in their "?" panel.

export const guides = [
  {
    id: 'getting-started',
    title: 'Getting started with your dashboard',
    areas: ['overview'],
    summary: 'What each part of the dashboard is for, and the few things to set up first.',
    steps: [
      'Open Overview. The setup checklist at the top shows what is left to do. Each item links to the right screen.',
      'Work (Bookings, Clients, Events, Messages, Payments) is your day-to-day business.',
      'Website (Pages & text, Photos, Blog, Books, Resources, Newsletter) is everything visitors see.',
      'Manage (Team, Connections, Settings) is where you control access and connect your own accounts.',
      'Press Ctrl + K (or ⌘ + K on Mac) anywhere to search for a screen or a guide.',
    ],
  },
  {
    id: 'photos',
    title: 'Add photos to your website',
    areas: ['media', 'content'],
    summary: 'Fill every photo spot on the site from one screen.',
    steps: [
      'Go to Photos → Website photos. Each row is one place on the website, with the best size to use.',
      'Click “Add photo”, then upload a new photo or choose one you already uploaded.',
      'Describe the photo in a few words (for example “Hetty teaching on Zoom”). This helps people using screen readers and search engines.',
      'Large photos are resized and compressed automatically, so you can upload straight from your phone or camera.',
      'To keep a face in view on every screen size, open the photo in Library and click the face to set the focus point.',
      'The change appears on the website straight away. Use “Change” or “Remove” at any time.',
    ],
  },
  {
    id: 'photo-tips',
    title: 'Choosing good photos',
    areas: ['media'],
    summary: 'Simple tips for photos that look professional.',
    steps: [
      'Use natural light, facing a window. Avoid strong light behind the person.',
      'Landscape photos suit banners; portrait photos suit the founder spots.',
      'Leave some space around the subject, because each spot crops slightly differently on phones and computers.',
      'Only use photos of learners who have agreed to appear on the website.',
    ],
  },
  {
    id: 'team',
    title: 'Invite your team and choose their roles',
    areas: ['team'],
    summary: 'Give people the access they need, and nothing more.',
    steps: [
      'Go to Team → Invite someone. Enter their name and email and choose a role.',
      'They receive an email with a link to set their password. Until then they show as “Invited”.',
      'Roles: Admin (almost everything), Assistant (bookings, clients, events, messages), Editor (website content), Viewer (read only).',
      'Click Manage next to someone to change their role, pause their access, resend the invitation or remove them.',
      'Only you, as owner, can make someone else the owner. You then become an admin.',
    ],
  },
  {
    id: 'google',
    title: 'Connect Google Calendar',
    areas: ['connections'],
    summary: 'Keep bookings and your personal calendar in sync.',
    steps: [
      'Go to Connections → Google Calendar → Connect.',
      'Sign in with the Google account that holds your work calendar and allow access.',
      'From then on, busy times in your calendar are blocked on the booking page, and new bookings are added to your calendar.',
      'You can disconnect at any time from the same screen. Nothing is deleted from your calendar.',
    ],
  },
  {
    id: 'zoom',
    title: 'Connect Zoom',
    areas: ['connections'],
    summary: 'Create a Zoom meeting for every booking automatically.',
    steps: [
      'Go to Connections → Zoom → Connect, sign in to Zoom and allow access.',
      'Each confirmed booking gets its own Zoom link, included in the confirmation email.',
      'Not ready yet? Bookings still work: you can add a meeting link to a booking by hand.',
    ],
  },
  {
    id: 'stripe',
    title: 'Connect Stripe to get paid',
    areas: ['connections', 'payments'],
    summary: 'Take card payments for consultations, events and books, straight into your Stripe account.',
    steps: [
      'Create or sign in to your Stripe account at stripe.com, in the business’s name, and complete Stripe’s verification.',
      'In Stripe, go to Developers → API keys → Create restricted key. Name it “HGA website”.',
      'Give it the permissions listed on the Connections screen (only what the website needs), then create the key.',
      'Copy the key and paste it into Connections → Stripe. It is stored encrypted and is never shown again, even to you.',
      'Money goes directly to your Stripe account. You can delete the key in Stripe at any time to disconnect.',
    ],
  },
  {
    id: 'email',
    title: 'Send emails from your own address',
    areas: ['connections'],
    summary: 'Booking confirmations sent from @hettyglobalacademy.com instead of a generic address.',
    steps: [
      'Go to Connections → Email and enter the address emails should come from, e.g. hello@yourdomain.com.',
      'The screen shows three records (TXT and CNAME). Add them where your domain is registered (for example GoDaddy, Namecheap or Google Domains).',
      'Come back and click “Check”. It can take up to a few hours for the records to be found.',
      'Once verified, all confirmations and receipts come from your address.',
    ],
  },
  {
    id: 'content',
    title: 'Edit website text and prices',
    areas: ['content'],
    summary: 'Change the homepage headline, statistics, founder text, contact details and prices.',
    steps: [
      'Go to Pages & text. Each box is one part of the website, with its own Save button.',
      'Changes appear on the website as soon as you save.',
      'Consultation prices are used everywhere: programme pages, the booking flow and receipts.',
    ],
  },
  {
    id: 'events',
    title: 'Create an event or workshop',
    areas: ['events'],
    summary: 'Publish a masterclass, workshop or webinar with registration.',
    steps: [
      'Go to Events → New event. Add the title, date and time (in your time zone), duration, price and number of places.',
      'Use a price of 0 for a free event.',
      'Add a cover photo from your Photos library.',
      'The event appears on the website straight away. Open Registrations to see who has signed up.',
    ],
  },
  {
    id: 'blog',
    title: 'Write and publish an article',
    areas: ['blog'],
    summary: 'Share guidance on the Resources page.',
    steps: [
      'Go to Blog → New article. Add a title, category and a one-line excerpt.',
      'Write the article. Leave a blank line between paragraphs; start a line with ## for a heading.',
      'Save as draft to finish later, or Publish to make it live.',
    ],
  },
  {
    id: 'bookings',
    title: 'Manage bookings, cancellations and refunds',
    areas: ['bookings', 'clients'],
    summary: 'Confirm, complete or cancel sessions.',
    steps: [
      'Go to Bookings and use the filters to find a booking. Click View.',
      'Change the status, mark the session completed, or cancel it.',
      'Cancelling a paid booking refunds the client. Once Stripe is connected, the refund goes back to their card automatically.',
    ],
  },
  {
    id: 'business',
    title: 'Set your business details',
    areas: ['settings'],
    summary: 'Currency, time zone and the hours people can book.',
    steps: [
      'Go to Settings → Business details.',
      'Choose your currency and your time zone. Visitors always see times in their own time zone.',
      'Set your working days and hours, the gap between sessions, how much notice you need and how far ahead people can book.',
      'Save. The booking calendar updates straight away.',
    ],
  },
];

export const guidesFor = (area) => guides.filter((g) => g.areas.includes(area));
