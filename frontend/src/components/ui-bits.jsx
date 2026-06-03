import { motion } from 'framer-motion';

export function Panel({ children, className = '', ...props }) {
  return (
    <div className={`glass-panel p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
      <div>
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.2em] text-primary mb-2">{eyebrow}</div>
        )}
        <h1 className="font-display text-3xl lg:text-4xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground/80">{hint}</p>}
    </label>
  );
}

const inputBase =
  'w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:bg-white/[0.06] focus:border-primary/60 focus:ring-2 focus:ring-primary/20';

export function Input({ className = '', ...props }) {
  return <input {...props} className={`${inputBase} ${className}`} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea {...props} className={`${inputBase} resize-none ${className}`} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select {...props} className={`${inputBase} appearance-none cursor-pointer ${className}`}>
      {children}
    </select>
  );
}

export function Button({
  variant = 'primary',
  full,
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3.5 text-base' }[
    size
  ];
  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:shadow-[0_10px_30px_-10px] hover:shadow-primary/60 shine-on-hover',
    ghost: 'text-muted-foreground hover:text-foreground hover:bg-white/5',
    outline: 'border border-white/10 hover:bg-white/5',
    soft: 'bg-white/[0.06] hover:bg-white/[0.1]',
    danger: 'bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/20',
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${sizes} ${variants} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ status }) {
  const map = {
    pending: 'bg-warning/15 text-warning border-warning/30',
    approved: 'bg-primary/15 text-primary border-primary/30',
    paid: 'bg-primary/15 text-primary border-primary/30',
    rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${map[status] ?? 'bg-white/5 border-white/10 text-muted-foreground'}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function StatCard({ label, value, hint, accent, icon: Icon, delay = 0 }) {
  const accentMap = {
    primary: 'from-primary/30 to-transparent',
    gold: 'from-accent/30 to-transparent',
    danger: 'from-destructive/30 to-transparent',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      className="relative overflow-hidden glass-panel p-5 group"
    >
      {accent && (
        <div
          className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${accentMap[accent]} blur-2xl`}
        />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-display text-3xl mt-2 tracking-tight">{value}</div>
          {hint && <div className="text-xs text-muted-foreground/80 mt-1.5">{hint}</div>}
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-white/[0.06] grid place-items-center group-hover:bg-white/10 transition">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TableWrap({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th
      className={`text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/[0.02] border-b border-white/5 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '', colSpan }) {
  return (
    <td colSpan={colSpan} className={`px-5 py-4 border-b border-white/5 ${className}`}>
      {children}
    </td>
  );
}

export function Alert({ tone = 'info', children }) {
  const map = {
    info: 'bg-white/5 border-white/10 text-foreground',
    success: 'bg-primary/10 border-primary/30 text-primary',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
  };
  return <div className={`text-sm rounded-xl px-4 py-3 border ${map[tone]}`}>{children}</div>;
}

export function StatusFilterPills({ options, value, onChange, counts }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/5 flex-wrap">
      {options.map((opt) => {
        const active = value === opt.value;
        const count = counts?.[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition capitalize ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
            {typeof count === 'number' && <span className="opacity-60 ml-1">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>
  );
}
