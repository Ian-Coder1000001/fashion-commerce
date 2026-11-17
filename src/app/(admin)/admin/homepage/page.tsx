import Image from "next/image";
import Link from "next/link";
import {
  getHomeSectionsForAdmin,
  addHomeSectionAction,
  updateHomeSectionAction,
  toggleHomeSectionAction,
  moveHomeSectionAction,
  removeHomeSectionAction,
  uploadHomeSectionImageAction,
  removeHomeSectionImageAction,
} from "@/actions/home.actions";
import { listCollectionsForAdmin } from "@/actions/collection.actions";
import {
  SECTION_TYPES,
  SECTION_LABELS,
  type HomeSection,
} from "@/lib/home-sections";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const dynamic = "force-dynamic";

function SectionFields({
  section,
  collections,
}: {
  section: HomeSection;
  collections: { id: string; name: string }[];
}) {
  const type = section.type;
  const hasEyebrow = type === "hero" || type === "editorial";
  const hasSubheading = type === "hero" || type === "editorial";
  const hasButton = type === "hero" || type === "editorial" || type === "banner";
  const hasLimit =
    type === "new_arrivals" || type === "best_sellers" || type === "collection";

  return (
    <>
      {hasEyebrow && (
        <Input
          label="Small label above the heading"
          name="eyebrow"
          defaultValue={section.eyebrow}
        />
      )}

      <Input
        label={type === "banner" ? "Message" : "Heading"}
        name="heading"
        defaultValue={section.heading}
      />

      {hasSubheading && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`sub-${section._id}`}
            className="text-xs tracking-wide text-fg-muted"
          >
            {type === "hero" ? "Subheading" : "Text"}
          </label>
          <textarea
            id={`sub-${section._id}`}
            name="subheading"
            defaultValue={section.subheading}
            rows={3}
            className="border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
      )}

      {type === "collection" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`col-${section._id}`}
            className="text-xs tracking-wide text-fg-muted"
          >
            Collection
          </label>
          <select
            id={`col-${section._id}`}
            name="collectionId"
            defaultValue={section.collectionId ?? ""}
            className="h-11 border border-border bg-surface px-3 text-sm"
          >
            <option value="">Choose a collection…</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasLimit && (
        <Input
          label="Number of products (1 to 24)"
          name="limit"
          type="number"
          min={1}
          max={24}
          defaultValue={section.limit ?? 8}
        />
      )}

      {hasButton && (
        <>
          <Input
            label="Button label"
            name="buttonLabel"
            defaultValue={section.buttonLabel}
          />
          <Input
            label="Button link"
            name="buttonHref"
            defaultValue={section.buttonHref}
            placeholder="/collections or https://example.com"
          />
        </>
      )}
    </>
  );
}

export default async function AdminHomepagePage() {
  const [sections, collectionDocs] = await Promise.all([
    getHomeSectionsForAdmin(),
    listCollectionsForAdmin(),
  ]);

  const collections = collectionDocs.map((c) => ({
    id: String(c._id),
    name: String(c.name),
  }));

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="font-display text-2xl">Homepage</h1>
        <Link
          href="/"
          target="_blank"
          className="text-xs tracking-wide uppercase text-fg-muted hover:text-fg underline underline-offset-4"
        >
          View homepage
        </Link>
      </div>
      <p className="text-sm text-fg-muted mb-8">
        Sections appear on the homepage in this order. Changes go live as soon
        as you save. New sections start switched off, so nothing half-finished
        goes public.
      </p>

      <form
        action={addHomeSectionAction}
        className="flex flex-wrap items-end gap-3 mb-10 border border-border p-5"
      >
        <div className="flex flex-col gap-1.5 flex-1 min-w-48">
          <label
            htmlFor="new-section-type"
            className="text-xs tracking-wide text-fg-muted"
          >
            Add a section
          </label>
          <select
            id="new-section-type"
            name="type"
            className="h-11 border border-border bg-surface px-3 text-sm"
          >
            {SECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {SECTION_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="sm">
          Add section
        </Button>
      </form>

      {sections.length === 0 ? (
        <p className="text-sm text-fg-muted">
          No sections yet. Your homepage is empty until you add one above.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {sections.map((section, index) => (
            <article key={section._id} className="border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs tracking-wide uppercase text-fg-muted">
                    {index + 1}. {section.enabled ? "Live" : "Switched off"}
                  </p>
                  <h2 className="font-display text-lg">
                    {SECTION_LABELS[section.type]}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {index > 0 && (
                    <form
                      action={moveHomeSectionAction.bind(null, section._id, "up")}
                    >
                      <button className="text-fg-muted hover:text-fg">
                        Move up
                      </button>
                    </form>
                  )}
                  {index < sections.length - 1 && (
                    <form
                      action={moveHomeSectionAction.bind(null, section._id, "down")}
                    >
                      <button className="text-fg-muted hover:text-fg">
                        Move down
                      </button>
                    </form>
                  )}
                  <form action={toggleHomeSectionAction.bind(null, section._id)}>
                    <button className="text-fg-muted hover:text-fg">
                      {section.enabled ? "Switch off" : "Switch on"}
                    </button>
                  </form>
                  <form action={removeHomeSectionAction.bind(null, section._id)}>
                    <button className="text-fg-muted hover:text-error">
                      Remove
                    </button>
                  </form>
                </div>
              </div>

              <form
                action={updateHomeSectionAction.bind(null, section._id)}
                className="flex flex-col gap-4 max-w-xl"
              >
                <SectionFields section={section} collections={collections} />
                {(section.type === "hero" ||
                  section.type === "editorial" ||
                  section.type === "banner") && (
                  <p className="text-xs text-fg-muted">
                    Button links start with / for a page on your site, or
                    https:// for another site. Anything else is ignored.
                  </p>
                )}
                <Button type="submit" size="sm" className="self-start">
                  Save section
                </Button>
              </form>

              {(section.type === "hero" || section.type === "editorial") && (
                <div className="mt-6 pt-6 border-t border-border max-w-xl">
                  <p className="text-xs tracking-wide text-fg-muted mb-2">
                    Image
                  </p>
                  {section.image?.secureUrl && (
                    <div className="relative aspect-[16/9] w-full max-w-sm border border-border bg-surface mb-3">
                      <Image
                        src={section.image.secureUrl}
                        alt=""
                        fill
                        sizes="384px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <form
                    action={uploadHomeSectionImageAction.bind(null, section._id)}
                    className="flex flex-col gap-3"
                  >
                    <input
                      type="file"
                      name="file"
                      accept="image/*"
                      required
                      className="text-sm"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      className="self-start"
                    >
                      {section.image ? "Replace image" : "Upload image"}
                    </Button>
                  </form>
                  {section.image?.secureUrl && (
                    <form
                      action={removeHomeSectionImageAction.bind(null, section._id)}
                      className="mt-2"
                    >
                      <button className="text-xs text-fg-muted hover:text-error">
                        Remove image
                      </button>
                    </form>
                  )}
                  <p className="text-xs text-fg-muted mt-2">
                    {section.type === "hero"
                      ? "Use a wide photo at least 2000px across. A dark tint is added automatically so the text stays readable."
                      : "A portrait photo works best here."}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}