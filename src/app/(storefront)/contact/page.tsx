import { ContactForm } from "@/components/storefront/ContactForm";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">Get in Touch</h1>
      <p className="text-fg-muted mb-10">
        Questions about an order, sizing, or anything else — send us a
        message and we&apos;ll reply as soon as we can.
      </p>
      <ContactForm />
    </div>
  );
}