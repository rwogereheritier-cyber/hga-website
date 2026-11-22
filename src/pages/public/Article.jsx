import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import { fmtArticleDate } from '../../lib/format';
import { useStore } from '../../lib/store';
import ComingSoon from './ComingSoon';
import { ArticleCard } from './Resources';

function Share({ title }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const enc = encodeURIComponent;
  const links = [
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`],
    ['X', `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`],
    ['WhatsApp', `https://wa.me/?text=${enc(`${title} ${url}`)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
  ];
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-small">
      <span className="text-ink-muted">Share</span>
      {links.map(([name, href]) => (
        <a key={name} href={href} target="_blank" rel="noreferrer" className="font-medium text-burgundy hover:text-maroon">
          {name}
        </a>
      ))}
      <button type="button" onClick={copy} className="font-medium text-burgundy hover:text-maroon" aria-live="polite">
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}

export default function Article() {
  const { slug } = useParams();
  const articles = useStore('articles');
  const a = articles.find((x) => x.slug === slug && x.status === 'Published');
  if (!a) return <ComingSoon title="Article not found" />;
  const related = articles
    .filter((x) => x.slug !== a.slug && x.status === 'Published')
    .sort((x, y) => (y.category === a.category) - (x.category === a.category))
    .slice(0, 3);

  return (
    <article>
      <header className="mx-auto flex max-w-[860px] flex-col items-center gap-6 px-6 pb-14 pt-16 text-center md:px-8 md:pt-28">
        <Link to="/resources" className="text-small font-medium text-burgundy">
          ‹ Resources
        </Link>
        <span className="eyebrow">{a.category}</span>
        <h1 className="font-display text-[40px] font-medium leading-[1.06] tracking-[-1px] md:text-display-l">{a.title}</h1>
        <p className="max-w-prose text-[17px] leading-[1.6] text-ink-muted md:text-lead">{a.excerpt}</p>
        <span className="text-small text-ink-muted">
          By {a.author} · {fmtArticleDate(a.date)} · {a.readTime} min read
        </span>
      </header>

      <div className="container-page">
        <ImagePlaceholder label={`${a.category} article image`} className="h-[300px] md:h-[520px]" />
      </div>

      <div className="mx-auto flex max-w-[680px] flex-col gap-6 px-6 py-section-sm md:px-8 md:py-24">
        {a.body.map((block, i) =>
          block.startsWith('## ') ? (
            <h2 key={i} className="pt-6 font-display text-[28px] leading-[1.2] tracking-[-0.3px]">
              {block.slice(3)}
            </h2>
          ) : (
            <p key={i} className="text-[18px] leading-[1.75]">
              {block}
            </p>
          ),
        )}
        <div className="mt-8 flex flex-col gap-6 border-t border-hairline pt-8">
          <Share title={a.title} />
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-grey-100 p-8">
            <span className="flex flex-col gap-1">
              <span className="text-[18px] font-medium">Want a plan for your situation?</span>
              <span className="text-small text-ink-muted">Book a one-to-one consultation with Hetty.</span>
            </span>
            <Button to="/consultations">Book a consultation</Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page flex flex-col gap-12 border-t border-hairline py-section-sm md:py-section">
          <h2 className="title-section">Keep reading.</h2>
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <ArticleCard key={r.slug} a={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
