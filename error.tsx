"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="catalog-page empty-state">
      <p className="eyebrow">PLEASE TRY AGAIN</p>
      <h1>We couldn’t load this page.</h1>
      <p>
        Your request could not be completed. Please retry or return to the
        homepage.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link className="text-link" href="/">
        Back home
      </Link>
    </main>
  );
}
