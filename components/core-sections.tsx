"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  KeyRound,
  MapPin,
  DraftingCompass,
} from "lucide-react";
import { site, whatsappHref } from "@/config/site";
import { content } from "@/config/content/en";
import { Reveal } from "./reveal";
function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1100, 1);
        el.textContent = String(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      observer.disconnect();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return <span ref={ref}>{value}</span>;
}
export function CoreSections() {
  const ceo = site.team.find((person) => person.role === "CEO") ?? site.team[0];
  const [area, setArea] = useState(site.areas[0]);
  const icons = [KeyRound, Building2, DraftingCompass];
  return (
    <>
      <section id="company" className="content-section company-section">
        <div className="section-kicker">
          <span>{content.company.eyebrow}</span>
          <span>02 — OUR FOUNDATION</span>
        </div>
        <Reveal className="split-section">
          <div>
            <h2>
              Local knowledge.
              <br />
              <em>Lasting relationships.</em>
            </h2>
            <div className="established-seal">
              <span>MAD</span>
              <small>LAHORE · EST. {site.established}</small>
            </div>
          </div>
          <div className="prose">
            <p className="lead">{content.company.story}</p>
            <p>{content.company.mission}</p>
            <p>{content.company.expertise}</p>
            <a className="text-link" href="#contact">
              Tell us about your plans <ArrowUpRight size={18} />
            </a>
          </div>
        </Reveal>
        <div className="stats-grid" aria-label="MAD facts">
          <div>
            <strong>
              <Counter value={site.established} />
            </strong>
            <span>{content.stats.established}</span>
          </div>
          {[
            { value: site.statistics.dealsClosed, label: content.stats.deals },
            {
              value: site.statistics.experienceYears,
              label: content.stats.experience,
            },
          ].map((stat) => (
            <div key={stat.label}>
              <strong>
                {stat.value === null ? "—" : <Counter value={stat.value} />}
              </strong>
              <span>{stat.label}</span>
              {stat.value === null && <small>{content.stats.pending}</small>}
            </div>
          ))}
          <div>
            <strong>
              <Counter value={site.areas.length} />
            </strong>
            <span>{content.stats.areas}</span>
          </div>
        </div>
      </section>
      <section id="expertise" className="content-section tinted-section">
        <div className="section-kicker">
          <span>{content.services.eyebrow}</span>
          <span>03 — OUR EXPERTISE</span>
        </div>
        <h2 className="section-heading">
          Expertise for <em>every next step.</em>
        </h2>
        <div className="expertise-grid">
          {site.services.map((service, i) => {
            const Icon = icons[i];
            return (
              <Reveal className="expertise-card" key={service.id}>
                <span className="card-index">0{i + 1}</span>
                <Icon size={34} strokeWidth={1} />
                <h3>{service.title}</h3>
                <p>{content.services.details[i]}</p>
                <a
                  className="text-link"
                  href={whatsappHref(
                    `Assalam o Alaikum, I'd like to discuss ${service.title.toLowerCase()} with MAD.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Let’s discuss <ArrowUpRight size={18} />
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>
      <section id="leadership" className="content-section">
        <Reveal className="ceo-layout">
          <div
            className="portrait-placeholder"
            role="img"
            aria-label={
              ceo.photo
                ? `Portrait of ${ceo.name}`
                : `Portrait of ${ceo.name} awaiting owner upload`
            }
          >
            {ceo.photo ? (
              <Image
                src={ceo.photo}
                alt={ceo.name}
                fill
                sizes="(max-width:767px) 86vw, 40vw"
              />
            ) : (
              <>
                <span className="portrait-initials">
                  {ceo.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span className="portrait-caption">
                  PORTRAIT TO BE PROVIDED
                </span>
              </>
            )}
            <div className="portrait-name">
              {ceo.name}
              <small>CEO · MAD</small>
            </div>
          </div>
          <div className="ceo-copy">
            <p className="eyebrow">{content.ceo.eyebrow}</p>
            <h2>
              A home begins
              <br />
              with <em>a conversation.</em>
            </h2>
            <p>{content.ceo.message}</p>
            <p className="muted small-copy">{content.ceo.note}</p>
            <a
              className="text-link"
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Connect with our team <ArrowUpRight size={18} />
            </a>
          </div>
        </Reveal>
      </section>
      <section id="team" className="content-section team-section">
        <div className="section-kicker">
          <span>{content.team.eyebrow}</span>
          <span>04 — OUR TEAM</span>
        </div>
        <h2 className="section-heading">
          Meet <em>the MAD team.</em>
        </h2>
        <div className="team-grid">
          {site.team
            .filter((person) => person.role !== "CEO")
            .map((person) => (
              <Reveal key={person.name} className="team-card">
                <div
                  className="team-avatar"
                  role="img"
                  aria-label={
                    person.photo
                      ? `Portrait of ${person.name}`
                      : `Photo of ${person.name} awaiting owner upload`
                  }
                >
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      sizes="(max-width:767px) 86vw, 28vw"
                    />
                  ) : (
                    <>
                      <span>
                        {person.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <small>PHOTO TO BE PROVIDED</small>
                    </>
                  )}
                </div>
                <h3>{person.name}</h3>
                {person.role && <p>{person.role}</p>}
              </Reveal>
            ))}
        </div>
      </section>
      <section id="areas" className="content-section tinted-section">
        <div className="section-kicker">
          <span>{content.areas.eyebrow}</span>
          <span>05 — LOCAL KNOWLEDGE</span>
        </div>
        <div className="split-section areas-layout">
          <div>
            <h2>
              Find your place
              <br />
              <em>in Lahore.</em>
            </h2>
            <p className="muted">{content.areas.description}</p>
            <div
              className="area-buttons"
              role="group"
              aria-label="Select an area"
            >
              {site.areas.map((name) => (
                <button
                  key={name}
                  aria-pressed={area === name}
                  onClick={() => setArea(name)}
                >
                  {name}
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
          </div>
          <div className="area-detail" aria-live="polite">
            <MapPin size={38} strokeWidth={1} />
            <small>LAHORE, PAKISTAN</small>
            <h3>{area}</h3>
            <p>
              {area === site.areas[0]
                ? content.areas.primary
                : content.areas.other}
            </p>
            <div className="area-actions">
              <a
                className="button primary"
                href={`/properties?area=${encodeURIComponent(area)}`}
              >
                View listings <ArrowUpRight size={16} />
              </a>
              <a
                className="text-link"
                href={whatsappHref(
                  `Assalam o Alaikum, I'm interested in property or construction in ${area}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask about {area}
              </a>
            </div>
            <span className="area-watermark" aria-hidden="true">
              LHR
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
