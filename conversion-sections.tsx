import { Phone, MessageCircle, MapPin, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { site, whatsappHref } from "@/config/site";
import { conversion } from "@/config/content/conversion";
import { Reveal } from "./reveal";
import { InquiryForm } from "./inquiry-form";
import type { FAQ, Testimonial } from "@/lib/public-content";
export function ConversionSections({
  testimonials,
  faqs,
}: {
  testimonials: Testimonial[];
  faqs: FAQ[];
}) {
  return (
    <>
      <section className="collection-bridge content-section">
        <Reveal>
          <p className="eyebrow">SPACES WITH POSSIBILITY</p>
          <h2>
            Your vision.
            <br />
            <em>A place to begin.</em>
          </h2>
          <div className="bridge-links">
            <Link href="/properties">
              Explore properties <ArrowUpRight />
            </Link>
            <Link href="/projects">
              Construction portfolio <ArrowUpRight />
            </Link>
          </div>
        </Reveal>
      </section>
      <section id="process" className="content-section">
        <div className="section-kicker">
          <span>A CLEAR PATH FORWARD</span>
          <span>06 — THE PROCESS</span>
        </div>
        <h2 className="section-heading">
          From first conversation
          <br />
          <em>to the final key.</em>
        </h2>
        <ol className="process-grid">
          {conversion.process.map((step, i) => (
            <li key={step.title}>
              <Reveal>
                <span className="process-number">0{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>
      {testimonials.length > 0 && (
        <section id="testimonials" className="content-section tinted-section">
          <p className="eyebrow">IN OUR CLIENTS’ WORDS</p>
          <h2 className="section-heading">
            Trust, <em>in their words.</em>
          </h2>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.id}>
                <div
                  aria-label={`${testimonial.rating} out of 5 stars`}
                  className="stars"
                >
                  {"★".repeat(testimonial.rating)}
                </div>
                <blockquote>{testimonial.text}</blockquote>
                <figcaption>{testimonial.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <section id="faq" className="content-section">
        <div className="split-section">
          <div>
            <p className="eyebrow">A LITTLE CLARITY GOES A LONG WAY</p>
            <h2 className="section-heading">
              Good questions.
              <br />
              <em>Clear answers.</em>
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.id}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section id="contact" className="content-section contact-section">
        <div className="section-kicker">
          <span>LET’S BUILD SOMETHING LASTING</span>
          <span>07 — GET IN TOUCH</span>
        </div>
        <div className="split-section">
          <div>
            <h2>
              Your next chapter
              <br />
              <em>starts here.</em>
            </h2>
            <p className="muted">{conversion.contact.description}</p>
            <div className="contact-links">
              <a href={site.contact.tel}>
                <Phone size={20} />
                <span>
                  <small>CALL OUR TEAM</small>
                  {site.contact.phone}
                </span>
                <ArrowUpRight size={18} />
              </a>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={20} />
                <span>
                  <small>START A CONVERSATION</small>Chat on WhatsApp
                </span>
                <ArrowUpRight size={18} />
              </a>
              {site.contact.address && (
                <p>
                  <MapPin size={20} />
                  {site.contact.address}
                </p>
              )}
              {site.contact.email && (
                <a href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              )}
            </div>
            {site.contact.mapEmbedUrl && (
              <iframe
                title="MAD office location"
                src={site.contact.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="contact-map"
                allowFullScreen
              />
            )}
            {site.contact.mapUrl && (
              <a
                href={site.contact.mapUrl}
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open office location <ArrowUpRight size={16} />
              </a>
            )}
          </div>
          <div className="contact-form-card">
            <h3>Tell us what you have in mind.</h3>
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
