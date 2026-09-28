import Link from "next/link";
import { NewsletterForm } from "@/components/storefront/NewsletterForm";
import { getStoreSettings } from "@/services/settings.service";

export async function Footer() {
  const settings = await getStoreSettings();
  const social = settings.socialLinks ?? {};
  const hasSocial = social.facebook || social.instagram || social.twitter || social.tiktok;

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
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-3">
            Customer Service
          </p>
          <ul className="flex flex-col gap-2 text-fg-muted">
            <li>
              <Link href="/shipping" className="hover:text-fg">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-fg">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-fg">
                Contact
              </Link>
            </li>
          </ul>
          {(settings.contactEmail || settings.contactPhone) && (
            <div className="mt-3 text-fg-muted">
              {settings.contactEmail && <p>{settings.contactEmail}</p>}
              {settings.contactPhone && <p>{settings.contactPhone}</p>}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-3">About</p>
          <ul className="flex flex-col gap-2 text-fg-muted">
            <li>
  <Link href="/about" className="hover:text-fg">
    Our Story
  </Link>
</li>
            <li>
              <Link href="/journal" className="hover:text-fg">
                Journal
              </Link>
            </li>
          </ul>
          {hasSocial && (
            <div className="flex gap-3 mt-3 text-fg-muted">
              {social.instagram && (
                <a href={social.instagram} className="hover:text-fg" target="_blank" rel="noreferrer">
                  Instagram
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} className="hover:text-fg" target="_blank" rel="noreferrer">
                  Facebook
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} className="hover:text-fg" target="_blank" rel="noreferrer">
                  X
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok} className="hover:text-fg" target="_blank" rel="noreferrer">
                  TikTok
                </a>
              )}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs tracking-wide uppercase text-fg-muted mb-3">
            Newsletter
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-border px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-fg-muted">
        <span>
          © {new Date().getFullYear()} {settings.storeName ?? "Store"}. All rights reserved.
        </span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-fg">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-fg">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}