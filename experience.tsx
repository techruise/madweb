"use client";
import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Phone,
  MessageCircle,
  Menu,
  X,
  MapPin,
  Plus,
} from "lucide-react";
import { site, whatsappHref } from "@/config/site";
import { Monogram } from "./brand";
import { Effects } from "./effects";
import { InquiryForm } from "./inquiry-form";
import { Footer } from "./footer";
import { CoreSections } from "./core-sections";
const Building = dynamic(() => import("./building"), {
  ssr: false,
  loading: () => <StaticBuilding />,
});
function StaticBuilding() {
  return (
    <svg
      viewBox="0 0 700 600"
      className="static-building"
      role="img"
      aria-label="Conceptual modern residence"
    >
      <defs>
        <linearGradient id="wall" x2="1" y2="1">
          <stop stopColor="#9a9b98" />
          <stop offset="1" stopColor="#3b4249" />
        </linearGradient>
      </defs>
      <path d="M60 460L340 550 660 380 395 315Z" fill="#363b41" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(0 ${-i * 95})`}>
          <path d="M110 365L345 440 605 310 375 240Z" fill="#aaa89e" />
          <path d="M110 365V450L345 525V440Z" fill="url(#wall)" />
          <path d="M345 440L605 310V395L345 525Z" fill="#2c363e" />
          <path d="M345 444L605 314" stroke="#7A1626" strokeWidth="5" />
          {[0, 1, 2, 3, 4].map((j) => (
            <path
              key={j}
              d={`M${368 + j * 46} ${434 - j * 23}v70`}
              stroke="#70777a"
              strokeWidth="3"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticBuilding /> : this.props.children;
  }
}
export function Experience({ children }: { children?: ReactNode }) {
  const [scrolled, setScrolled] = useState(false),
    [menu, setMenu] = useState(false),
    [scene, setScene] = useState(false),
    [enquire, setEnquire] = useState(false);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 20);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const device = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean; effectiveType?: string };
      };
      const weak =
        (device.hardwareConcurrency && device.hardwareConcurrency <= 4) ||
        (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
        device.connection?.saveData ||
        ["slow-2g", "2g"].includes(device.connection?.effectiveType ?? "") ||
        matchMedia("(pointer:coarse)").matches;
      if (media.matches || weak) {
        setScene(false);
        return;
      }
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setScene(!!gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
    update();
    media.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", scroll);
      media.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    if (!enquire) return;
    const dialog = document.getElementById("enquiry") as HTMLDialogElement;
    dialog.showModal();
    return () => dialog.close();
  }, [enquire]);
  const links = [
    ["The company", "company"],
    ["Our expertise", "expertise"],
    ["Properties", "/properties"],
    ["Projects", "/projects"],
    ["Contact", "contact"],
  ];
  return (
    <>
      <Effects />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={scrolled ? "header scrolled" : "header"}>
        <a className="brand" href="#" aria-label="MAD home">
          <Monogram />
          <span>
            MIAN ASSOCIATES
            <br />& DEVELOPERS <small>(PVT) LTD</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="active" href="#main">
            Home
          </a>
          {links.map(([name, id]) => (
            <a href={id.startsWith("/") ? id : `#${id}`} key={id}>
              {name}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-call" href={site.contact.tel}>
            <Phone size={14} />
            <span>Call us</span>
          </a>
          <a
            className="button header-whatsapp"
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic
          >
            <MessageCircle size={15} />
            <span>Let’s talk</span>
            <ArrowUpRight size={14} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {[["Home", "main"], ...links].map(([name, id]) => (
              <a
                key={id}
                href={id.startsWith("/") ? id : `#${id}`}
                onClick={() => setMenu(false)}
              >
                {name}
                <ArrowUpRight size={18} />
              </a>
            ))}
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" />
          <div className="hero-ambient" />
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> LAHORE, PAKISTAN <i /> EST. {site.established}
            </div>
            <h1 id="hero-title">
              Lahore’s Most
              <br />
              Trusted Address
              <br />
              for <em>Property</em>
              <br />& Construction<span className="gold-period">.</span>
            </h1>
            <p className="tagline">{site.tagline}</p>
            <p className="hero-description">
              From your first investment to your forever home.
              <br className="desktop-break" /> Property and construction, with
              people you can trust.
            </p>
            <div className="hero-ctas">
              <a
                className="button primary"
                href={site.contact.tel}
                data-magnetic
              >
                <Phone size={16} />
                Call Now
                <ArrowUpRight size={17} />
              </a>
              <a
                className="button outline"
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
              >
                <MessageCircle size={17} />
                WhatsApp Us
                <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="hero-note">
              <span className="note-line" /> YOUR VISION. OUR COMMITMENT.
            </div>
          </div>
          <div
            className="hero-scene"
            data-view
            aria-label="Interactive conceptual modern residence"
          >
            <div className="scene-orbit orbit-one" />
            <div className="scene-orbit orbit-two" />
            <div className="scene-cross top-cross">
              <Plus size={15} />
            </div>
            <SceneBoundary>
              {scene ? <Building /> : <StaticBuilding />}
            </SceneBoundary>
            <div className="architect-label">
              <span>01 / THE MODERN RESIDENCE</span>
              <small>ARCHITECTURAL CONCEPT · NOT A LISTING</small>
            </div>
            <div className="scene-caption">
              <span className="live-dot" /> DESIGNED AROUND YOUR TOMORROW
            </div>
          </div>
          <div className="hero-bottom">
            <a href="#company" className="scroll-link">
              <span className="scroll-circle">
                <ArrowDown size={15} />
              </span>
              EXPLORE MAD
            </a>
            <span className="location">
              <MapPin size={13} /> ROOTED IN JOHAR TOWN. BUILDING ACROSS LAHORE.
            </span>
            <span className="page-index">
              01 <span>/ 06</span>
            </span>
          </div>
        </section>
        <CoreSections />
        {children}
      </main>
      <Footer />
      <a
        className="floating-whatsapp"
        href={whatsappHref()}
        aria-label="Chat with MAD on WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={25} />
        <span>Let’s talk</span>
      </a>
      <div className="mobile-actions">
        <a href={site.contact.tel}>
          <Phone size={18} />
          Call
        </a>
        <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} />
          WhatsApp
        </a>
        <button onClick={() => setEnquire(true)}>
          <ArrowUpRight size={18} />
          Enquire
        </button>
      </div>
      <dialog
        id="enquiry"
        aria-label="Quick enquiry dialog"
        onCancel={() => setEnquire(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setEnquire(false);
        }}
      >
        <button
          className="dialog-close"
          aria-label="Close enquiry"
          onClick={() => setEnquire(false)}
        >
          <X />
        </button>
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <h2>Let’s talk property.</h2>
        <p>Speak with our team about buying, selling, or building in Lahore.</p>
        <InquiryForm compact />
        <a className="dialog-call" href={site.contact.tel}>
          Or call {site.contact.phone}
        </a>
      </dialog>
    </>
  );
}
