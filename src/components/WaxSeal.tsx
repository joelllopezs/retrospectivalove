export function WaxSeal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="sealGradient" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--rose-soft)" />
          <stop offset="55%" stopColor="var(--rose)" />
          <stop offset="100%" stopColor="var(--wine-soft)" />
        </radialGradient>
      </defs>
      <path
        d="M32 4 C40 4 46 8 50 14 C54 20 58 26 56 34 C54 42 48 48 40 52
           C32 56 24 56 18 50 C10 44 6 36 8 28 C10 20 16 12 24 8 C27 6 30 4 32 4 Z"
        fill="url(#sealGradient)"
      />
      <path
        d="M32 38 C25 32 20 27.5 20 22 C20 18 23 15 27 15 C29.3 15 31 16.3 32 18.3
           C33 16.3 34.7 15 37 15 C41 15 44 18 44 22 C44 27.5 39 32 32 38 Z"
        fill="var(--paper)"
        opacity="0.92"
      />
    </svg>
  );
}
