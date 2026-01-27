import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { StaticPageLayout } from '@/components/layout/static-page-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'FAQ | ElderLink — Your Happiness Club',
  description: 'Frequently asked questions about ElderLink for seniors and families.',
};

const faqs = [
  {
    q: 'What is ElderLink?',
    a: 'ElderLink is India\'s digital companion for seniors and their families. It helps you track health, medications, connect with community, manage emergencies, and stay in touch with family—all in one app.',
  },
  {
    q: 'How do I link with my parent or family member?',
    a: 'Go to Dashboard → Family. If you\'re a senior, share your unique invite code with your child or guardian. They enter the code on their Family page to link. Once linked, they can view your health summary (with your permission) and send reminders.',
  },
  {
    q: 'How do I log my vitals or medications?',
    a: 'From the dashboard, open Health & Vitals to log blood pressure, blood sugar, SpO2, or weight. Use Medications to add your medicines and mark them Taken or Skipped each day.',
  },
  {
    q: 'How does the Emergency SOS work?',
    a: 'Tap the red SOS button (in the header or Emergency page). Confirm within 5 seconds. We\'ll send your location to your emergency contacts so they can help quickly.',
  },
  {
    q: 'Can I use ElderLink in my language?',
    a: 'Yes. We support English, Hindi, Telugu, Tamil, Kannada, and Malayalam. Use the language switcher (globe icon) in the header to change.',
  },
  {
    q: 'What is the ElderLink Club membership?',
    a: 'ElderLink Club is our yearly membership (₹99/year) that unlocks rewards, exclusive events, tours, shop benefits, and more. Check Dashboard → Membership for details.',
  },
  {
    q: 'How do I enable push notifications?',
    a: 'When you see the "Enable notifications" banner, tap Enable. You can also allow notifications when your browser prompts you. We use them for reminders and important alerts.',
  },
  {
    q: 'Who can see my health data?',
    a: 'Only you see your full data. Linked family members (guardians) can see vitals, medications, and appointments only if you allow it in Profile → permissions (vitals, location).',
  },
];

export default function FAQPage() {
  return (
    <StaticPageLayout
      title="Frequently Asked Questions"
      description="Quick answers about ElderLink for seniors and families."
    >
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-2 px-4 rounded-lg mb-2">
            <AccordionTrigger className="text-left font-semibold hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/help">Visit Help Center</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact support</Link>
        </Button>
      </div>
    </StaticPageLayout>
  );
}
