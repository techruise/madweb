import { Experience } from "@/components/experience";
import { ConversionSections } from "@/components/conversion-sections";
import { publicContent } from "@/lib/public-content";
import { JsonLd, siteUrl } from "@/lib/seo";
import { site } from "@/config/site";
export const dynamic = "force-dynamic";
export default async function Home() {
  const data = await publicContent();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["RealEstateAgent", "LocalBusiness"],
          name: site.legalName,
          url: siteUrl,
          telephone: site.contact.tel.replace("tel:", ""),
          foundingDate: String(site.established),
          areaServed: site.areas.map((name) => ({
            "@type": "Place",
            name: `${name}, Lahore, Pakistan`,
          })),
          ...(site.contact.address
            ? {
                address: {
                  "@type": "PostalAddress",
                  streetAddress: site.contact.address,
                  addressLocality: "Lahore",
                  addressCountry: "PK",
                },
              }
            : {}),
          ...(site.contact.email ? { email: site.contact.email } : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: data.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }}
      />
      <Experience>
        <ConversionSections {...data} />
      </Experience>
    </>
  );
}
