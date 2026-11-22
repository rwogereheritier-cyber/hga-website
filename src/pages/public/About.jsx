import { Button, LinkAction } from '../../components/common/Button';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import PageHero from '../../components/common/PageHero';
import Reveal from '../../components/common/Reveal';
import { useStore } from '../../lib/store';

const values = [
  ['Excellence', 'High standards in every session, resource and conversation.'],
  ['Integrity', 'Honest guidance, even when the answer is “not yet”.'],
  ['Empowerment', 'Helping learners build the confidence to lead their own progress.'],
  ['Accessibility', 'Clear, affordable support for learners wherever they are.'],
  ['Innovation', 'Practical, modern ways of learning that fit busy lives.'],
  ['Community', 'A supportive network of nurses who lift each other up.'],
];

export default function About() {
  const { stats, about, founder } = useStore('content');
  return (
    <>
      <PageHero eyebrow="About us" title="Education that opens doors." lead="Hetty Global Academy supports nurses and healthcare professionals through education, mentorship and English language development." />

      <div className="container-page">
        <ImagePlaceholder label="Hetty with learners" className="h-[360px] md:h-[600px]" />
      </div>

      <section className="container-page section grid gap-12 md:grid-cols-[1fr_1.3fr] md:gap-24">
        <Reveal>
          <h2 className="title-section">Our story.</h2>
        </Reveal>
        <Reveal delay={0.06} className="flex flex-col gap-6 text-[18px] leading-[1.75]">
          {about.story.split(/\n\s*\n/).map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
          <p className="text-caption text-ink-muted">Placeholder story, to be replaced with Hetty’s own words.</p>
        </Reveal>
      </section>

      <section className="bg-ivory">
        <div className="container-page section grid gap-16 md:grid-cols-2 md:gap-24">
          <Reveal className="flex flex-col gap-5">
            <span className="eyebrow">Mission</span>
            <p className="font-display text-[28px] leading-[1.3] tracking-[-0.3px] md:text-[34px]">
              To empower individuals through accessible, practical, and high-quality education, mentorship, and professional development.
            </p>
          </Reveal>
          <Reveal delay={0.06} className="flex flex-col gap-5">
            <span className="eyebrow">Vision</span>
            <p className="font-display text-[28px] leading-[1.3] tracking-[-0.3px] md:text-[34px]">
              To become a globally recognised academy transforming careers and creating opportunities through education and professional empowerment.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page section flex flex-col gap-14">
        <h2 className="title-section text-center">What we value.</h2>
        <div className="grid gap-x-16 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {values.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 0.05} className="flex flex-col gap-2 border-t border-hairline pt-6">
              <span className="text-[20px] font-medium">{t}</span>
              <span className="text-[16px] leading-[1.65] text-ink-muted">{d}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page flex flex-wrap items-center gap-12 pb-section-sm md:gap-24 md:pb-section">
        <Reveal className="w-full flex-1 basis-[380px]">
          <ImagePlaceholder label="Hetty, founder" className="h-[440px] md:h-[560px]" />
        </Reveal>
        <Reveal delay={0.06} className="flex flex-1 basis-[420px] flex-col gap-6">
          <span className="eyebrow">Meet the founder</span>
          <h2 className="title-section">Hetty, Registered Nurse and educator.</h2>
          <p className="text-[18px] leading-[1.7] text-ink-muted">
            {founder.bio}
          </p>
          <p className="text-caption text-ink-muted">Credentials and biography to be confirmed with Hetty.</p>
        </Reveal>
      </section>

      <section className="bg-ivory">
        <div className="container-page section flex flex-col gap-14">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="title-section">Our commitment and impact.</h2>
            <p className="max-w-prose text-[17px] text-ink-muted">
              Every learner leaves with a clear next step. We measure our work by the progress our community makes.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 text-center md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-2.5">
                <span className="font-display text-[38px] tracking-[-1px] md:text-[56px]">{s.value}</span>
                <span className="text-small text-ink-muted">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-7">
            <Button to="/consultations">Book a consultation</Button>
            <LinkAction to="/programmes">Explore programmes</LinkAction>
          </div>
        </div>
      </section>
    </>
  );
}
