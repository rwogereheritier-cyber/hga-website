// Demo content. Items marked TODO must be confirmed by the client before launch.

export const contact = {
  email: 'hello@hettyglobalacademy.com', // TODO: confirm
  location: 'Canada', // TODO: city
  socials: [
    { label: 'TikTok', href: '#' }, // TODO: profile URL
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ],
};

export const announcement = {
  text: 'NCLEX Success Masterclass · Sat 14 Dec · Online',
  cta: 'Reserve your seat',
  href: '/events',
};

// TODO: verify every figure with the client.
export const stats = [
  { value: '45K+', label: 'Learning community' },
  { value: '10+', label: 'Years of experience' },
  { value: '500+', label: 'Learners supported' },
  { value: '3', label: 'Learning paths' },
];

export const programmes = [
  {
    slug: 'nursing-education',
    category: 'Nursing education',
    title: 'Pass the NCLEX with a plan.',
    from: 75,
    photo: 'Nurse studying',
  },
  {
    slug: 'mentorship',
    category: 'Mentorship & careers',
    title: 'Build a nursing career abroad.',
    from: 85,
    photo: 'Mentoring session',
  },
  {
    slug: 'english-language',
    category: 'English language',
    title: 'Reach your CELPIP score.',
    from: 65,
    photo: 'Speaking practice',
  },
];

// TODO: real dates, prices and capacity.
export const events = [
  { id: 'nclex-masterclass', date: '14 Dec', title: 'NCLEX Success Masterclass', meta: 'Online · 2 hours · $35' },
  { id: 'celpip-workshop', date: '9 Jan', title: 'CELPIP Preparation Workshop', meta: 'Online · 90 min · $25' },
  { id: 'intl-career', date: '23 Jan', title: 'Building Your International Nursing Career', meta: 'Online · 60 min · Free' },
];

export const testimonial = {
  quote: 'Hetty broke the NCLEX down into a plan I could actually follow while working full time.',
  author: '[Learner name] · RN candidate', // TODO: real testimonial with consent
};

export const faqs = [
  {
    q: 'How do consultations work?',
    a: 'Choose a service, pick a time shown in your own time zone, pay securely and receive a Zoom link by email.',
  },
  {
    q: 'Can I reschedule or cancel?',
    a: 'Yes. You can reschedule for free up to 24 hours before your session.', // TODO: confirm policy
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'Major credit and debit cards. More options will be added later.',
  },
  {
    q: 'Which path is right for me?',
    a: 'If you are unsure, book a general mentorship consultation and Hetty will help you choose.',
  },
];

export const currency = '$'; // TODO: CAD or USD
