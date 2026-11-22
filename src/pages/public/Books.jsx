import { Link } from 'react-router-dom';
import BookCover from '../../components/common/BookCover';
import PageHero from '../../components/common/PageHero';
import Reveal from '../../components/common/Reveal';
import { money } from '../../lib/format';
import { useStore } from '../../lib/store';

export default function Books() {
  const books = useStore('books');
  const libraryResources = useStore('library');
  return (
    <>
      <PageHero eyebrow="Books & publications" title="Learn at your own pace." lead="Hetty’s publications and a growing library of practical resources." />

      <section className="container-page grid gap-5 pb-section-sm md:grid-cols-2 md:pb-section">
        {books
          .filter((b) => b.status !== 'Hidden')
          .map((b, i) => (
            <Reveal key={b.slug} delay={i * 0.06}>
              <div className="flex h-full flex-col items-center gap-8 rounded-lg bg-grey-100 p-10 text-center md:p-14">
                <BookCover title={b.title} author={b.author} src={b.cover} />
                <div className="flex flex-col items-center gap-3">
                  <h2 className="font-display text-[30px] leading-[1.15]">{b.title}</h2>
                  <span className="text-small text-ink-muted">
                    By {b.author} · {b.formats.join(', ')}
                  </span>
                  <p className="max-w-[440px] text-small text-ink-muted">{b.description}</p>
                  <span className="pt-2 text-[22px] font-medium">{money(b.price)}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to={`/books/${b.slug}`} className="rounded-full border border-charcoal px-6 py-3 text-[15px] font-medium transition-colors hover:bg-charcoal hover:text-white">
                    View details
                  </Link>
                  <Link to={`/books/${b.slug}?buy=1`} className="rounded-full bg-burgundy px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-maroon">
                    Buy now
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        <Reveal delay={0.06}>
          <div className="flex h-full min-h-[420px] flex-col justify-center gap-4 rounded-lg border border-dashed border-[#DCD6CE] p-10 text-center md:p-14">
            <span className="text-caption font-medium text-burgundy">Coming next</span>
            <h2 className="font-display text-[30px] leading-[1.15]">More guides are on the way.</h2>
            <p className="text-small text-ink-muted">Subscribe to the newsletter to hear when new publications are released.</p>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[960px] px-6 pb-section-sm md:px-8 md:pb-section">
        <h2 className="title-section mb-4">Resource library.</h2>
        <p className="mb-10 text-[17px] text-ink-muted">Free downloadable tools for learners. The first ones are being prepared.</p>
        <ul className="border-b border-hairline">
          {libraryResources.filter((r) => r.status !== 'Hidden').map((r) => (
            <li key={r.title} className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline py-6">
              <span className="flex flex-col gap-1">
                <span className="text-[18px] font-medium">{r.title}</span>
                <span className="text-caption text-ink-muted">{r.type}</span>
              </span>
              {r.status === 'Available' && r.link ? (
                <a href={r.link} target="_blank" rel="noreferrer" className="text-[15px] font-medium text-burgundy hover:text-maroon">
                  Download ›
                </a>
              ) : (
                <span className="rounded-full bg-grey-100 px-3 py-1 text-caption text-ink-muted">{r.status}</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
