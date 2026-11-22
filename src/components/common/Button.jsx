import { Link } from 'react-router-dom';

const base =
  'inline-flex items-center justify-center rounded-full font-medium transition-colors duration-200 ease-out';

const variants = {
  primary: 'bg-burgundy text-white hover:bg-maroon',
  secondary: 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-white',
  dark: 'bg-charcoal text-white hover:bg-black',
};

const sizes = {
  sm: 'px-[18px] py-[9px] text-[14px]',
  md: 'px-7 py-[14px] text-[16px]',
};

/** Pill button. Renders a router Link when `to` is set, otherwise a <button>. */
export function Button({ to, variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

/** Secondary action as a text link with a trailing chevron: "Learn more ›". */
export function LinkAction({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-1 text-[16px] font-medium text-burgundy hover:text-maroon ${className}`}
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">
        ›
      </span>
    </Link>
  );
}
