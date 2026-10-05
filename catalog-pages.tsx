import { ui } from "@/config/content/ui";
import { JsonLd, siteUrl } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { site, whatsappHref } from "@/config/site";
import { getCatalog, PAGE_SIZE, type Search } from "@/lib/catalog";
import {
  isProperty,
  itemImages,
  money,
  type CatalogKind,
  type CatalogItem,
} from "@/lib/catalog-types";
import { imageUrl, imagePlaceholder } from "@/lib/images";
import { Gallery } from "./gallery";
import { PublicShell } from "./public-shell";
export async function CatalogPage({
  kind,
  search,
}: {
  kind: CatalogKind;
  search: Search;
}) {
  const { items, count, filters, unavailable } = await getCatalog(kind, search);
  const property = kind === "properties";
  const title = property ? ui.catalog.propertyTitle : ui.catalog.projectTitle;
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(search))
      if (typeof value === "string") params.set(key, value);
    params.set("page", String(page));
    return `/${kind}?${params}`;
  };
  return (
    <PublicShell>
      <section className="catalog-page">
        <p className="eyebrow">
          MAD · {property ? "PROPERTY COLLECTION" : "CONSTRUCTION PORTFOLIO"}
        </p>
        <h1>{title}</h1>
        <p className="muted">
          {property ? ui.catalog.propertyIntro : ui.catalog.projectIntro}
        </p>
        <form className="catalog-filters" action={`/${kind}`}>
          <label>
            Area
            <select aria-label="Area" name="area" defaultValue={filters.area}>
              <option value="">All areas</option>
              {site.areas.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
          </label>
          {property && (
            <>
              <label>
                Type
                <select
                  aria-label="Type"
                  name="type"
                  defaultValue={filters.type ?? ""}
                >
                  <option value="">All types</option>
                  {site.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Minimum price (PKR)
                <input
                  name="min"
                  type="number"
                  min="0"
                  max="1000000000000"
                  defaultValue={filters.min}
                />
              </label>
              <label>
                Maximum price (PKR)
                <input
                  name="max"
                  type="number"
                  min="0"
                  max="1000000000000"
                  defaultValue={filters.max}
                />
              </label>
            </>
          )}
          <label>
            Status
            <select
              aria-label="Status"
              name="status"
              defaultValue={filters.status ?? ""}
            >
              <option value="">All statuses</option>
              {(property ? ["for sale", "sold"] : ["ongoing", "completed"]).map(
                (status) => (
                  <option key={status}>{status}</option>
                ),
              )}
            </select>
          </label>
          <label>
            Sort
            <select name="sort" defaultValue={filters.sort}>
              <option value="newest">Newest first</option>
              {property && (
                <>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                </>
              )}
            </select>
          </label>
          <button className="button primary" type="submit">
            Apply filters
          </button>
          <Link className="text-link" href={`/${kind}`}>
            Reset
          </Link>
        </form>
        <div className="results-heading">
          <span>
            {count} {property ? "properties" : "projects"}
          </span>
          <span>Page {filters.page}</span>
        </div>
        {items.length ? (
          <div className="catalog-grid">
            {items.map((item) => (
              <CatalogCard key={item.id} item={item} kind={kind} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>{unavailable ? ui.catalog.unavailable : ui.catalog.empty}</h2>
            <p>
              {unavailable
                ? ui.catalog.retry
                : `No published ${kind} match these filters yet. Ask our team about your requirements.`}
            </p>
            <a
              className="button primary"
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to MAD <ArrowUpRight size={16} />
            </a>
          </div>
        )}
        <nav className="pagination" aria-label="Pagination">
          {filters.page > 1 && (
            <Link className="button outline" href={pageHref(filters.page - 1)}>
              Previous
            </Link>
          )}
          {filters.page * PAGE_SIZE < count && (
            <Link className="button outline" href={pageHref(filters.page + 1)}>
              Next
            </Link>
          )}
        </nav>
      </section>
    </PublicShell>
  );
}
function CatalogCard({ item, kind }: { item: CatalogItem; kind: CatalogKind }) {
  const image = itemImages(item)[0];
  return (
    <Link href={`/${kind}/${item.slug}`} className="catalog-card">
      <div className="catalog-image">
        <Image
          src={imageUrl(kind, image?.storage_path)}
          alt={image?.alt ?? `${item.title}: image awaiting owner upload`}
          fill
          sizes="(max-width: 767px) 86vw, (max-width: 1100px) 43vw, 29vw"
          placeholder="blur"
          blurDataURL={imagePlaceholder}
        />
        <span className="status-badge">{item.status}</span>
        {item.is_sample && (
          <span className="sample-badge">
            Sample {kind === "properties" ? "listing" : "project"}
          </span>
        )}
      </div>
      <div className="catalog-card-copy">
        <small>{item.area}</small>
        <h2>{item.title}</h2>
        <p>
          {isProperty(item)
            ? money(item.price)
            : `${item.scope}${item.year ? ` · ${item.year}` : ""}`}
        </p>
        <span className="text-link">
          View details <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}
export function CatalogDetail({
  item,
  kind,
}: {
  item: CatalogItem;
  kind: CatalogKind;
}) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${kind}/${item.slug}`;
  return (
    <PublicShell>
      {!item.is_sample && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type":
              kind === "properties" ? "RealEstateListing" : "CreativeWork",
            name: item.title,
            description: item.description,
            url: `${siteUrl}/${kind}/${item.slug}`,
            datePosted: item.created_at,
            ...(isProperty(item) && item.price !== null
              ? {
                  offers: {
                    "@type": "Offer",
                    price: item.price,
                    priceCurrency: "PKR",
                    availability:
                      item.status === "sold"
                        ? "https://schema.org/SoldOut"
                        : "https://schema.org/InStock",
                  },
                }
              : {}),
          }}
        />
      )}
      <article className="catalog-page">
        <Link href={`/${kind}`} className="text-link">
          ← Back to {kind}
        </Link>
        {item.is_sample && (
          <p className="sample-notice">
            SAMPLE {kind === "properties" ? "LISTING" : "PROJECT"} —
            demonstration content only. Not a real offer or completed MAD
            project.
          </p>
        )}
        <p className="eyebrow detail-eyebrow">
          {item.area} · {item.status}
        </p>
        <h1>{item.title}</h1>
        <div className="detail-grid">
          <Gallery images={itemImages(item)} kind={kind} title={item.title} />
          <aside className="detail-panel">
            <p className="eyebrow">THE DETAILS</p>
            <h2>{isProperty(item) ? money(item.price) : item.scope}</h2>
            <dl>
              <div>
                <dt>Area</dt>
                <dd>{item.area}</dd>
              </div>
              {isProperty(item) ? (
                <>
                  <div>
                    <dt>Size</dt>
                    <dd>
                      {item.size === null
                        ? "On request"
                        : `${item.size} ${item.size_unit}`}
                    </dd>
                  </div>
                  {item.bedrooms !== null && (
                    <div>
                      <dt>Bedrooms</dt>
                      <dd>{item.bedrooms}</dd>
                    </div>
                  )}
                  {item.bathrooms !== null && (
                    <div>
                      <dt>Bathrooms</dt>
                      <dd>{item.bathrooms}</dd>
                    </div>
                  )}
                </>
              ) : (
                item.year && (
                  <div>
                    <dt>Year</dt>
                    <dd>{item.year}</dd>
                  </div>
                )
              )}
              <div>
                <dt>Status</dt>
                <dd>{item.status}</dd>
              </div>
            </dl>
            <a
              className="button primary"
              href={whatsappHref(
                `Assalam o Alaikum, I'm interested in ${item.title} (ID: ${item.id}). ${url}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp about this{" "}
              {kind === "properties" ? "property" : "project"}{" "}
              <ArrowUpRight size={18} />
            </a>
            <a className="text-link" href={site.contact.tel}>
              Speak to our team
            </a>
          </aside>
        </div>
        <section className="detail-description">
          <h2>About this {kind === "properties" ? "property" : "project"}</h2>
          <p>{item.description}</p>
          <p className="muted small-copy">
            Details and availability are subject to confirmation. Verify
            documents, measurements and terms with our team.
          </p>
        </section>
      </article>
    </PublicShell>
  );
}
