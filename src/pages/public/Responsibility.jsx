import { Button } from '../../components/common/Button';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import PageHero from '../../components/common/PageHero';
import Reveal from '../../components/common/Reveal';

const areas = [
  ['Education accessibility', 'Free webinars and resources so cost is never the only barrier to learning.'],
  ['Youth empowerment', 'Talks and mentoring for students considering careers in healthcare.'],
  ['Community development', 'Partnering with local organisations to support learners where they live.'],
  ['Healthcare education awareness', 'Sharing accurate, practical information about nursing careers and exams.'],
  ['Professional mentorship', 'Volunteer mentoring for nurses at the start of their journey.'],
  ['Scholarships and future initiatives', 'A planned scholarship fund for learners who need it most.'],
];

// TODO: replace with real figures before launch.
const impact = [
  ['[#]', 'Free webinar seats offered'],
  ['[#]', 'Learners mentored at no cost'],
  ['[#]', 'Community partners'],
];

export default function Responsibility() {
  return (
    <>
      <PageHero eyebrow="Corporate responsibility" title="Creating opportunities through education." lead="Our commitment to making learning accessible and to strengthening the communities we serve." />

      <div className="container-page">
        <ImagePlaceholder label="Community workshop" className="h-[360px] md:h-[560px]" />
      </div>

      <section className="container-page section flex flex-col gap-14">
        <h2 className="title-section text-center">Where we focus.</h2>
        <div className="grid gap-x-16 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 0.05} className="flex flex-col gap-2 border-t border-hairline pt-6">
              <span className="text-[20px] font-medium">{t}</span>
              <span className="text-[16px] leading-[1.65] text-ink-muted">{d}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ivory">
        <div className="container-page section flex flex-col gap-14">
          <h2 className="title-section text-center">Our impact so far.</h2>
          <div className="grid gap-12 text-center sm:grid-cols-3">
            {impact.map(([v, l]) => (
              <div key={l} className="flex flex-col gap-2.5">
                <span className="font-display text-[48px] tracking-[-1px] md:text-[56px]">{v}</span>
                <span className="text-small text-ink-muted">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-caption text-ink-muted">Figures to be added once confirmed by HGA.</p>
        </div>
      </section>

      <section className="container-page section flex flex-col items-center gap-7 text-center">
        <h2 className="title-section max-w-[760px]">Partner with us.</h2>
        <p className="max-w-prose text-[17px] text-ink-muted md:text-[19px]">
          Schools, employers and community organisations: let’s create more opportunities together.
        </p>
        <Button to="/contact?subject=Partnership%20enquiry">Start a partnership enquiry</Button>
      </section>
    </>
  );
}
