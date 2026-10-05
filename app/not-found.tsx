import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
export default function NotFound() {
  return (
    <PublicShell>
      <section className="catalog-page empty-state">
        <p className="eyebrow">404 · A DIFFERENT ADDRESS</p>
        <h1>This address isn’t available.</h1>
        <p>
          The page may have moved or the listing may no longer be published.
        </p>
        <Link className="button primary" href="/properties">
          Explore properties
        </Link>
        <Link className="text-link" href="/">
          Back home
        </Link>
      </section>
    </PublicShell>
  );
}
