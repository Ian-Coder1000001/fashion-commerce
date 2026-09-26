import Link from "next/link";

import { NewsletterForm } from "@/components/storefront/NewsletterForm";


export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-3">Shop</p>
          <ul className="flex flex-col gap-2 text-fg-muted">
                        <li>
              <Link href="/" className="hover:text-fg">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link href="/collections" className="hover:text-fg">
                Collections
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-3">Customer Service</p>
          <ul className="flex flex-col gap-2 text-fg-muted">
            <li>Shipping</li>
            <li>Returns</li>
            <li>
  <Link href="/contact" className="hover:text-fg">
    Contact
  </Link>
</li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-3">About</p>
          <ul className="flex flex-col gap-2 text-fg-muted">
            <li>Our Story</li>
<li>
  <Link href="/journal" className="hover:text-fg">
    Journal
  </Link>
</li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-3">Newsletter</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-border px-6 py-4 text-xs text-fg-muted">
        © {new Date().getFullYear()} Store. All rights reserved.
      </div>
    </footer>
  );
}