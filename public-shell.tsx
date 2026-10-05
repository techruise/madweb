"use client";
import Link from "next/link";
import { useState, useEffect, type ReactNode } from "react";
import { Phone, MessageCircle, Menu, X, ArrowUpRight } from "lucide-react";
import { Monogram } from "./brand";
import { site, whatsappHref } from "@/config/site";
import { Footer } from "./footer";
import { InquiryForm } from "./inquiry-form";
export function PublicShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [enquire, setEnquire] = useState(false);
  useEffect(() => {
    if (!enquire) return;
    const dialog = document.getElementById("enquiry") as HTMLDialogElement;
    dialog.showModal();
    return () => dialog.close();
  }, [enquire]);
  const links = [
    { href: "/#company", label: "Company" },
    { href: "/properties", label: "Properties" },
    { href: "/projects", label: "Projects" },
    { href: "/#contact", label: "Contact" },
  ];
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="header scrolled">
        <Link href="/" className="brand" aria-label="MAD home">
          <Monogram />
          <span>
            MIAN ASSOCIATES
            <br />& DEVELOPERS <small>(PVT) LTD</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-call" href={site.contact.tel}>
            <Phone size={15} />
            <span>Call us</span>
          </a>
          <a
            className="button header-whatsapp"
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={16} />
            <span>Let’s talk</span>
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-nav"
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <nav id="mobile-nav" className="mobile-nav">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenu(false)}
              >
                {link.label}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main id="main">{children}</main>
      <Footer />
      <a
        className="floating-whatsapp"
        href={whatsappHref()}
        aria-label="Chat with MAD on WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={24} />
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
        aria-labelledby="enquiry-title"
        onCancel={() => setEnquire(false)}
      >
        <button
          className="dialog-close"
          aria-label="Close enquiry"
          onClick={() => setEnquire(false)}
        >
          <X />
        </button>
        <h2 id="enquiry-title">Let’s talk property.</h2>
        <p>Tell our team what you have in mind.</p>
        <InquiryForm compact />
      </dialog>
    </>
  );
}
