# Security upgrade
Official guide: https://nextjs.org/docs/app/guides/upgrading/version-16 (read before migration).
Manual migration: Next 14.2.35 → 16.3.8, React 18 → 19.3, React Three Fiber 8 → 9.8.1, Framer Motion 11 → 14, Tailwind 3 → 4.3.3 with @tailwindcss/postcss. Existing Tailwind config retained via @config; styles and geometry preserved. TypeScript JSX mode updated by Next. New backend will use async request APIs and proxy.ts.
Node 22 is required by the updated Supabase packages. .nvmrc and package engines record this.
The initial install encountered old lockfile peer constraints; a clean dependency resolution was used, not --force or --legacy-peer-deps. Original lockfile retained in archive.
`npm audit`: 0 vulnerabilities. Full machine-readable output: security-audit.json. Original advisory report remains at audit.json as historical evidence.
