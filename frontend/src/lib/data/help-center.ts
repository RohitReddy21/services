import { categoryContent } from "@/lib/data/services";

export interface HelpFaq {
  id: string;
  topic: string;
  question: string;
  answer: string;
}

const generalFaqs: HelpFaq[] = [
  {
    id: "gen-1",
    topic: "Bookings",
    question: "How do I book a service?",
    answer:
      "Click \"Book a Service\" from any page, choose your category and equipment, pick a date and time, and confirm your details. You'll get an email and account notification the moment we receive your request.",
  },
  {
    id: "gen-2",
    topic: "Bookings",
    question: "Can I change my appointment date or time?",
    answer:
      "Yes — open the booking from My Bookings and choose \"Reschedule Booking\" to pick a new date and time from live availability. The change is confirmed immediately, no need to wait for a callback.",
  },
  {
    id: "gen-3",
    topic: "Bookings",
    question: "How do I cancel a booking?",
    answer:
      "Open the booking from My Bookings and choose \"Cancel Booking\". You'll receive a cancellation confirmation by email.",
  },
  {
    id: "gen-4",
    topic: "Pricing & Payment",
    question: "Why don't I see prices for services online?",
    answer:
      "Most jobs depend on site conditions our engineers need to assess, so AGS confirms scope and any applicable charges directly with you before work begins — never a surprise bill.",
  },
  {
    id: "gen-5",
    topic: "Pricing & Payment",
    question: "Do Care Plans show pricing?",
    answer:
      "Fixed-package plans like Premium Care show their price up front since the scope is fixed. Other Care Plans follow the same confirm-before-work model as one-off bookings.",
  },
  {
    id: "gen-6",
    topic: "Care Plans",
    question: "What happens to unused Premium Care visits?",
    answer:
      "Any of the 3 services not used within a 3-month Premium Care cycle roll over automatically into your next cycle — you never lose a paid-for visit.",
  },
  {
    id: "gen-7",
    topic: "Care Plans",
    question: "Can I pause or cancel a Care Plan?",
    answer:
      "Yes, from Account → Care Plans you can pause, resume or cancel any time. Pausing keeps your plan on file without scheduling further visits until you resume.",
  },
  {
    id: "gen-8",
    topic: "Account",
    question: "How do rewards points work?",
    answer:
      "You earn points automatically for bookings and Care Plan subscriptions. Redeem them from Account → Rewards for service credit or a priority callout upgrade.",
  },
  {
    id: "gen-9",
    topic: "Account",
    question: "How does the referral program work?",
    answer:
      "Share your personal link from Account → Refer a Friend. When someone joins using it, you both automatically earn reward points.",
  },
  {
    id: "gen-10",
    topic: "Account",
    question: "Can I save my equipment details for faster bookings?",
    answer:
      "Yes — add your AC units or refrigeration equipment under Account → My Equipment, including brand, serial number, install date and warranty, for a complete service history.",
  },
  {
    id: "gen-11",
    topic: "Documents",
    question: "Can I get a record of completed work?",
    answer:
      "Once a booking is marked completed, open it from My Bookings and download a PDF Service Certificate confirming the work carried out.",
  },
  {
    id: "gen-12",
    topic: "Getting Help",
    question: "What if my question isn't answered here?",
    answer:
      "Use the chat icon in the bottom corner for instant answers, or visit Contact Us to reach our team directly.",
  },
];

const categoryFaqs: HelpFaq[] = [
  ...categoryContent["air-conditioning"].faqs.map((f, i) => ({
    id: `ac-${i}`,
    topic: "Air Conditioning",
    ...f,
  })),
  ...categoryContent.refrigeration.faqs.map((f, i) => ({
    id: `ref-${i}`,
    topic: "Refrigeration",
    ...f,
  })),
];

export const helpCenterFaqs: HelpFaq[] = [...generalFaqs, ...categoryFaqs];

export const helpCenterTopics = Array.from(new Set(helpCenterFaqs.map((f) => f.topic)));
