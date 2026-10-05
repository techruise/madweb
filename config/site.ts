/** Single source of truth. Null fields are intentionally unpublished placeholders. */
export const site = {
  name: "MAD",
  legalName: "Mian Associates & Developers (Pvt) Ltd",
  tagline: "Building Trust, Delivering Homes.",
  established: 2016,
  statistics: {
    dealsClosed: null as number | null,
    experienceYears: null as number | null,
  },
  contact: {
    phone: "03047009393",
    tel: "tel:+923047009393",
    whatsapp: "https://wa.me/923047009393",
    whatsappMessage:
      "Assalam o Alaikum, I'm interested in a property/construction service with MAD.",
    address: null as string | null,
    mapUrl: null as string | null,
    mapEmbedUrl: null as string | null,
    email: null as string | null,
    social: [] as { label: string; url: string }[],
  },
  areas: [
    "Johar Town",
    "Wapda Town",
    "Valencia",
    "DHA",
    "Ittehad Town",
    "Bahria Town",
  ],
  services: [
    {
      id: "sale",
      title: "Property Sale",
      description: "Sell with confidence.",
    },
    {
      id: "purchase",
      title: "Property Purchase",
      description: "Find your next address.",
    },
    {
      id: "construction",
      title: "Construction",
      description: "Grey structure to complete finishing.",
    },
  ],
  team: [
    {
      name: "Mian Javaid",
      role: "CEO",
      photo: "/images/mian-javaid.jpg" as string | null,
    },
    { name: "Mian Junaid", role: null, photo: null as string | null },
    { name: "Sohail Chohan", role: null, photo: null as string | null },
    { name: "Saad", role: null, photo: null as string | null },
  ],
};
export const whatsappHref = (message = site.contact.whatsappMessage) =>
  `${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
