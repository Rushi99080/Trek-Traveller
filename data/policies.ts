/**
 * POLICY PAGES — placeholder text.
 * Have these reviewed by your CA / lawyer before going live.
 * Each section is a heading followed by its paragraphs or bullet points.
 */
import { cancellationPolicy } from "./content";

export type Policy = { title: string; intro: string; sections: { heading: string; points: string[] }[] };

export const policies: Record<string, Policy> = {
  terms: {
    title: "Terms & conditions",
    intro: "[Placeholder terms — review and edit before going live.] By booking a trip with us you agree to the following.",
    sections: [
      { heading: "Bookings", points: ["A booking is confirmed only after payment (full or advance) is received.", "Balance payments must be made before the departure date mentioned in your confirmation.", "Travellers must carry a valid original photo ID on the trip."] },
      { heading: "During the trip", points: ["Trek leaders may change the route or schedule for safety, weather or local reasons.", "Alcohol, smoking and drugs are not allowed during treks.", "Travellers who don't follow safety instructions may be asked to leave the trip without a refund."] },
      { heading: "Health & fitness", points: ["You confirm that you are medically fit for the trip you book and have shared any medical conditions.", "Trekking involves physical risk. You take part at your own risk."] },
      { heading: "Liability", points: ["We are not responsible for loss of personal belongings, or for delays caused by weather, road conditions, strikes or other events outside our control."] },
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro: "[Placeholder policy — review and edit before going live.] This explains what information we collect and how we use it.",
    sections: [
      { heading: "What we collect", points: ["Names, ages, gender, phone numbers, email, emergency contacts, ID type and medical notes you share when booking.", "Payment details are handled by Razorpay. We do not store card or bank details."] },
      { heading: "How we use it", points: ["To manage your booking, share trip updates and keep you safe on the trip.", "Your details are shared only with your trek leaders and service partners (transport, stays) as needed for the trip.", "We use Google Analytics and Meta Pixel to understand website visits and measure ads."] },
      { heading: "Your choices", points: ["You can ask us to update or delete your information by emailing us."] },
    ],
  },
  "cancellation-refund": {
    title: "Cancellation & refund policy",
    intro: "[Placeholder policy — review and edit before going live.]",
    sections: [
      { heading: "If you cancel", points: cancellationPolicy },
      { heading: "How to cancel", points: ["WhatsApp or email us with your booking ID. The cancellation date is the date we receive your message."] },
    ],
  },
  safety: {
    title: "Safety guidelines",
    intro: "Your safety comes first on every trip. Here's how we run our treks and what we ask of you.",
    sections: [
      { heading: "What we do", points: ["Every group has trained trek leaders, with one leader at the front and one at the back.", "First aid kit on every trip; oxygen and oximeter on Himalayan treks.", "Safety briefing before every climb.", "We cancel or change plans if weather or trail conditions are unsafe."] },
      { heading: "What we ask of you", points: ["Stay with the group and follow the leader's instructions.", "Wear proper trekking shoes and carry enough water.", "Tell us about any medical condition when booking.", "Don't go near cliff edges or into water without the leader's permission."] },
      { heading: "Women travellers", points: ["Separate sharing for women on request.", "Women coordinators on many trips.", "Report any discomfort to the trip leader or to us directly — we act on it immediately."] },
    ],
  },
};
