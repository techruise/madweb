"use client";
import { ui } from "@/config/content/ui";
import { useId, useState, type FormEvent } from "react";
import { site, whatsappHref } from "@/config/site";
import { conversion } from "@/config/content/conversion";
export function InquiryForm({ compact = false }: { compact?: boolean }) {
  const id = useId();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setState("loading");
    setMessage("");
    try {
      const { inquirySchema } = await import("@/lib/inquiry-schema");
      const parsed = inquirySchema.safeParse({
        ...data,
        consent: data.consent === "on",
        source_page: location.pathname,
      });
      if (!parsed.success) {
        setState("error");
        setMessage(ui.form.invalid);
        return;
      }
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        setState("error");
        setMessage(
          response.status === 429 ? ui.form.rateLimit : ui.form.failed,
        );
        return;
      }
      setState("success");
    } catch {
      setState("error");
      setMessage(ui.form.offline);
    }
  }
  if (state === "success")
    return (
      <div className="form-success" role="status">
        <h3>{ui.form.thanks}</h3>
        <p>{ui.form.received}</p>
        <a
          className="button primary"
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat on WhatsApp
        </a>
      </div>
    );
  return (
    <form
      className={`inquiry-form ${compact ? "compact-form" : ""}`}
      onSubmit={submit}
      aria-label={compact ? "Quick enquiry" : "Contact enquiry"}
    >
      <div className="form-grid">
        <label htmlFor={`${id}-name`}>
          {ui.form.name}
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            required
          />
        </label>
        <label htmlFor={`${id}-phone`}>
          {ui.form.phone}
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="03XX XXXXXXX"
            maxLength={25}
            required
          />
        </label>
        <label htmlFor={`${id}-email`}>
          {ui.form.email}
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
          />
        </label>
        <label htmlFor={`${id}-service`}>
          {ui.form.service}
          <select
            aria-label={ui.form.service}
            id={`${id}-service`}
            name="service"
            required
          >
            <option value="">Select a service</option>
            {site.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
        <label className="full-width" htmlFor={`${id}-area`}>
          {ui.form.area}
          <select
            aria-label={ui.form.area}
            id={`${id}-area`}
            name="area"
            required
          >
            <option value="">Select an area</option>
            {site.areas.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </label>
        <label className="full-width" htmlFor={`${id}-message`}>
          {ui.form.message}
          <textarea
            id={`${id}-message`}
            name="message"
            minLength={10}
            maxLength={2000}
            required
          />
        </label>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent">
        <input name="consent" type="checkbox" required />
        <span>
          {ui.form.consent} <a href="/privacy">{ui.form.privacy}</a>
        </span>
      </label>
      <p className="small-copy muted">{conversion.contact.privacy}</p>
      {state === "error" && (
        <p role="alert" className="form-error">
          {message}{" "}
          <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
        </p>
      )}
      <button
        className="button primary"
        type="submit"
        disabled={state === "loading"}
      >
        {state === "loading" ? ui.form.sending : ui.form.send}
      </button>
    </form>
  );
}
