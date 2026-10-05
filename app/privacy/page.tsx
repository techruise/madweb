import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { site } from "@/config/site";
import { conversion } from "@/config/content/conversion";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata(
  "Privacy notice | MAD",
  "How MAD uses the details you share through the website enquiry form.",
  "/privacy",
);
export default function Privacy() {
  return (
    <PublicShell>
      <section className="catalog-page">
        <p className="eyebrow">MAD · PRIVACY NOTICE</p>
        <h1>What we do with your details.</h1>
        <p className="muted">
          This notice explains, in plain terms, what happens to the information
          you send us through this website.
        </p>
        <div className="detail-description">
          <h2>What we collect</h2>
          <p>
            When you submit the enquiry form we store your name, mobile number,
            an optional email address, the service and area you selected, your
            message, the page you contacted us from, and the date and time of
            your consent.
          </p>
          <h2>Why we collect it</h2>
          <p>{conversion.contact.privacy}</p>
          <h2>How long we keep it</h2>
          <p>
            Enquiries are kept only as long as they are needed to respond to you
            and to keep a record of our work together. MAD staff can mark an
            enquiry as closed. Only an administrator can permanently delete an
            enquiry, and doing so removes it from the dashboard.
          </p>
          <h2>Who can see it</h2>
          <p>
            Only signed-in MAD staff can read enquiries. Access is limited to
            named accounts, is never shared publicly, and your enquiry is never
            sold or given to third parties for marketing.
          </p>
          <h2>What we do not collect</h2>
          <p>
            This website does not store raw IP addresses and does not use
            advertising or cross-site tracking cookies. Abuse protection uses a
            one-way hash of your connection address that cannot be reversed, and
            it is discarded automatically after one day. Please do not send
            identity documents, bank details, CNIC numbers or other sensitive
            information through the form.
          </p>
          <h2>Your choices</h2>
          <p>
            You can ask us to correct or delete your enquiry at any time by
            calling{" "}
            <a href={site.contact.tel}>{site.contact.phone}</a> or messaging us
            on WhatsApp. If you would like a fuller explanation of how your data
            is handled, ask for the owner.
          </p>
          <p className="muted small-copy">
            This notice describes this website only. Property transactions
            involve separate legal documentation and verification steps that are
            agreed with you directly.
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
