import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LinkAction } from '../../components/common/Button';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import PageHero from '../../components/common/PageHero';
import Reveal from '../../components/common/Reveal';
import { SearchBox, Segmented } from '../../components/common/Filters';
import { articleCategories } from '../../data/content';
import { useStore } from '../../lib/store';
import { fmtArticleDate } from '../../lib/format';

export function ArticleCard({ a }) {
  return (
    <Link to={`/resources/${a.slug}`} className="group flex flex-col gap-4">
      <ImagePlaceholder label={a.category} className="h-[220px] transition duration-200 ease-out group-hover:shadow-hover" />
      <span className="text-caption font-medium text-burgundy">{a.category}</span>
      <h3 className="font-display text-[24px] leading-[1.2] tracking-[-0.3px] transition-colors group-hover:text-burgundy">{a.title}</h3>
      <p className="text-small text-ink-muted">{a.excerpt}</p>
      <span className="text-caption text-ink-muted">
        {a.author} · {fmtArticleDate(a.date)} · {a.readTime} min read
      </span>
    </Link>
  );
}

export default function Resources() {
  const articles = useStore('articles');
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const published = useMemo(
    () => articles.filter((a) => a.status === 'Published').sort((a, b) => b.date.localeCompare(a.date)),
    [articles],
  );
  const [featured, ...rest] = published;
  const filtering = cat !== 'All' || q.trim();
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return (filtering ? published : rest).filter(
      (a) => (cat === 'All' || a.category === cat) && (!query || `${a.title} ${a.excerpt}`.toLowerCase().includes(query)),
    );
  }, [published, rest, cat, q, filtering]);

  return (
    <>
      <PageHero eyebrow="Resources" title="Guidance worth reading." lead="Practical articles on exams, English and building your nursing career." />

      {featured && !filtering && (
        <section className="container-page pb-section-sm md:pb-section">
          <Reveal>
            <Link to={`/resources/${featured.slug}`} className="group grid items-center gap-10 md:grid-cols-2 md:gap-16">
              <ImagePlaceholder label={featured.category} className="h-[300px] md:h-[440px]" />
              <span className="flex flex-col gap-5">
                <span className="text-caption font-medium text-burgundy">Featured · {featured.category}</span>
                <span className="font-display text-[36px] leading-[1.1] tracking-[-0.5px] transition-colors group-hover:text-burgundy md:text-heading-1">
                  {featured.title}
                </span>
                <span className="text-[17px] leading-[1.6] text-ink-muted">{featured.excerpt}</span>
                <span className="text-caption text-ink-muted">
                  {featured.author} · {fmtArticleDate(featured.date)} · {featured.readTime} min read
                </span>
              </span>
            </Link>
          </Reveal>
        </section>
      )}

      <section className="container-page pb-section-sm md:pb-section">
        <div className="mb-12 flex flex-wrap items-center gap-4">
          <SearchBox value={q} onChange={setQ} placeholder="Search articles" label="Search articles" />
          <Segmented options={['All', ...articleCategories]} value={cat} onChange={setCat} label="Filter by category" />
        </div>
        {list.length === 0 ? (
          <p className="text-ink-muted" role="status">
            No articles match your search.
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) * 0.05}>
                <ArticleCard a={a} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section className="bg-ivory">
        <div className="container-page section flex flex-col items-center gap-6 text-center">
          <span className="eyebrow">Publications</span>
          <h2 className="title-section max-w-[700px]">Your Nursing Career Success Guide</h2>
          <p className="max-w-prose text-[17px] text-ink-muted">Hetty’s practical guide for aspiring and internationally educated nurses.</p>
          <LinkAction to="/books">Explore books and resources</LinkAction>
        </div>
      </section>
    </>
  );
}
