import { Link } from 'react-router-dom';
import { INK, MUTED } from '../theme/landing';

export const LOGO_SRC = '/tradenix-logo.png';

export function BrandLogo({ small = false, onNavigate, className = '', variant = 'app' }) {
  const isLanding = variant === 'landing';

  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 shrink-0 group ${className}`}
      onClick={onNavigate}
      aria-label="Tradenix Venture home"
    >
      <img
        src={LOGO_SRC}
        alt=""
        role="presentation"
        className={`object-contain bg-transparent ${small ? 'h-9 w-9' : 'h-9 w-9 sm:h-10 sm:w-10'}`}
        width={40}
        height={40}
        decoding="async"
      />
      {!small && (
        <div className="leading-tight">
          <div
            className="font-display font-semibold tracking-tight"
            style={isLanding ? { color: INK } : undefined}
          >
            Tradenix
          </div>
          <div
            className={`text-[10px] uppercase tracking-[0.18em] ${
              isLanding ? '' : 'text-muted-foreground'
            }`}
            style={isLanding ? { color: MUTED } : undefined}
          >
            Venture
          </div>
        </div>
      )}
    </Link>
  );
}
