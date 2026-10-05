import Link from "next/link";
import { site, whatsappHref } from "@/config/site";
import { Monogram } from "./brand";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" aria-label="MAD home">
            <Monogram />
          </Link>
          <p>{site.legalName}</p>
          <p className="muted">{site.tagline}</p>
        </div>
        <div>
          <h2>Explore</h2>
          {[
            { href: "/#company", label: "The company" },
            { href: "/#team", label: "Our team" },
            { href: "/properties", label: "Properties" },
            { href: "/projects", label: "Construction" },
            { href: "/#contact", label: "Contact" },
            { href: "/privacy", label: "Privacy notice" },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div>
          <h2>Areas we serve</h2>
          {site.areas.map((area) => (
            <Link
              key={area}
              href={`/properties?area=${encodeURIComponent(area)}`}
            >
              {area}
            </Link>
          ))}
        </div>
        <div>
          <h2>Let’s talk</h2>
          <a href={site.contact.tel}>{site.contact.phone}</a>
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
            WhatsApp us ↗
          </a>
          {site.contact.address && <p>{site.contact.address}</p>}
          {site.contact.email && (
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          )}
          {site.contact.social.map((link) => (
            <a
              href={link.url}
              key={link.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.legalName}
        </span>
        <p>
          Property investment outcomes depend on market conditions. Consult our
          team for guidance.
        </p>
      </div>
    </footer>
  );
}
