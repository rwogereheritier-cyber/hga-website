// Consultations and programme content. Prices and durations are demo values from the brief.
// TODO: confirm prices, durations and currency with the client.

export const consultations = [
  {
    id: 'nclex',
    name: 'NCLEX consultation',
    short: 'NCLEX',
    programme: 'nursing-education',
    price: 75,
    duration: 45,
    summary: 'Readiness review, a personal study plan and exam strategy.',
  },
  {
    id: 'career',
    name: 'Nursing career consultation',
    short: 'Nursing career',
    programme: 'mentorship',
    price: 85,
    duration: 45,
    summary: 'Your next career step, registration routes and a clear plan.',
  },
  {
    id: 'english',
    name: 'English language consultation',
    short: 'English language',
    programme: 'english-language',
    price: 65,
    duration: 45,
    summary: 'CELPIP readiness, speaking and writing feedback.',
  },
  {
    id: 'mentorship',
    name: 'General mentorship',
    short: 'General mentorship',
    programme: 'mentorship',
    price: 90,
    duration: 60,
    summary: 'An open hour with Hetty on whatever matters most to you now.',
  },
];

export const getConsultation = (id) => consultations.find((c) => c.id === id);

export const programmeDetails = [
  {
    slug: 'nursing-education',
    category: 'Nursing education',
    filter: 'Nursing',
    title: 'NCLEX preparation, made personal.',
    intro: 'A study plan, exam strategy and honest feedback from a nurse who knows the Canadian path.',
    photo: 'Hetty teaching on Zoom',
    who: [
      'Internationally educated nurses preparing for NCLEX-RN',
      'First-time and repeat test takers',
      'Nurses studying while working full time',
    ],
    expect: [
      'A review of where you stand today',
      'A week-by-week study plan you can follow',
      'Strategy for clinical judgment questions',
    ],
    services: [
      { name: 'NCLEX preparation', text: 'Structured preparation built around your strengths and gaps.' },
      { name: 'Nursing tutorials', text: 'Focused sessions on the topics that cost you the most marks.' },
      { name: 'Exam guidance', text: 'Registration, timelines and what to expect on exam day.' },
      { name: 'Study support', text: 'Check-ins and resources to keep your plan on track.' },
    ],
    consultations: ['nclex', 'mentorship'],
    faqs: [
      { q: 'Is this a full NCLEX course?', a: 'No. Consultations give you a plan and strategy; you study with the resources we recommend.' },
      { q: 'Do I need to have booked my exam?', a: 'No. Many learners book a consultation before choosing an exam date.' },
      { q: 'What if I need to reschedule?', a: 'You can reschedule for free up to 24 hours before your session.' },
    ],
  },
  {
    slug: 'mentorship',
    category: 'Mentorship & careers',
    filter: 'Careers',
    title: 'Build a nursing career abroad.',
    intro: 'One-to-one mentoring and career guidance for nurses planning their next move, in Canada or beyond.',
    photo: 'Mentoring session',
    who: [
      'Nurses planning to work in Canada',
      'Newly registered nurses choosing a direction',
      'Professionals returning to nursing',
    ],
    expect: ['Clarity on your options', 'A realistic timeline', 'Next steps you can act on this week'],
    services: [
      { name: 'One-to-one mentoring', text: 'Regular conversations with someone who has walked the path.' },
      { name: 'Nursing career guidance', text: 'Specialties, roles and how to move between them.' },
      { name: 'International career development', text: 'Registration routes and building a profile employers trust.' },
      { name: 'Professional development', text: 'Interviews, CVs and growing into leadership.' },
    ],
    consultations: ['career', 'mentorship'],
    faqs: [
      { q: 'Can you help with immigration?', a: 'Hetty shares her experience of the nursing path, but does not give immigration or legal advice.' },
      { q: 'How many sessions will I need?', a: 'Most people start with one consultation and decide from there.' },
    ],
  },
  {
    slug: 'english-language',
    category: 'English language',
    filter: 'English',
    title: 'Reach your CELPIP score.',
    intro: 'CELPIP preparation and confident professional English for healthcare settings.',
    photo: 'Speaking practice',
    who: ['Candidates preparing for CELPIP', 'Nurses who want confident clinical English', 'Anyone retaking the test'],
    expect: ['A level check across all four skills', 'Targeted speaking and writing feedback', 'A practice plan'],
    services: [
      { name: 'CELPIP preparation', text: 'Test format, timing and strategy for every section.' },
      { name: 'English proficiency support', text: 'Build accuracy and range for everyday professional use.' },
      { name: 'Speaking and writing', text: 'Feedback on real responses, with clear ways to improve.' },
      { name: 'Communication skills', text: 'Handover, patient conversations and workplace English.' },
    ],
    consultations: ['english', 'mentorship'],
    faqs: [
      { q: 'Do you offer IELTS preparation?', a: 'The focus is CELPIP. Ask in your consultation if you are deciding between tests.' },
      { q: 'Can I book just one session?', a: 'Yes. One consultation is a good place to start.' },
    ],
  },
];

export const getProgramme = (slug) => programmeDetails.find((p) => p.slug === slug);

export const countries = [
  'Canada', 'United States', 'United Kingdom', 'Nigeria', 'Ghana', 'Kenya', 'Rwanda', 'Uganda', 'South Africa',
  'Cameroon', 'Zimbabwe', 'Philippines', 'India', 'Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'Jamaica',
  'Australia', 'Ireland', 'Other',
];
