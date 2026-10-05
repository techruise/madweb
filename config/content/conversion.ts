import { site } from "../site";
export const conversion = {
  process: [
    {
      title: "Consultation",
      text: "Share your plans, preferred area and budget. We agree on what to explore next.",
    },
    {
      title: "Site visit",
      text: "See the property or site with the team. Bring your questions and requirements.",
    },
    {
      title: "Deal or design",
      text: "Discuss terms for a purchase, or define the scope and estimate for construction.",
    },
    {
      title: "Documentation",
      text: "Review the relevant documents and written agreements before proceeding.",
    },
    {
      title: "Handover",
      text: "Complete the agreed checks and formalities, then plan your next chapter.",
    },
  ],
  faqs: [
    {
      id: "areas",
      question: "Which areas of Lahore do you serve?",
      answer: `Our core market is ${site.areas[0]}. We also serve ${site.areas.slice(1).join(", ")}. Contact us about your preferred location.`,
    },
    {
      id: "construction",
      question: "Can you help with both grey structure and finishing?",
      answer:
        "Yes. Discuss grey structure, complete finishing or both with our team. Scope, materials, cost and timeline should be agreed in writing before work begins.",
    },
    {
      id: "documents",
      question: "What should I check before buying a property?",
      answer:
        "Confirm ownership, title documents, approvals, dues and the terms of sale. Ask a qualified legal adviser to review the documents before you commit.",
    },
    {
      id: "estimate",
      question: "How do I get a construction estimate?",
      answer:
        "Share your site area, location, drawings if available, and the level of finishing you have in mind. Our team can discuss the information needed for an estimate.",
    },
    {
      id: "investment",
      question: "Are investment returns guaranteed?",
      answer:
        "No. Property investment outcomes depend on market conditions. Consider the risks, verify all information and seek independent advice.",
    },
  ],
  contact: {
    title: "Your next chapter starts here.",
    description:
      "A property question. A construction idea. Let’s take the first step together.",
    privacy:
      "We use these details to respond to your enquiry. Do not send identity documents, bank details or other sensitive information.",
  },
};
