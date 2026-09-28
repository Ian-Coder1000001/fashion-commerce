import Image from "next/image";
import { getAboutPage } from "@/services/about.service";

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{6,})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default async function AboutPage() {
  const about = await getAboutPage();
  const embedUrl = getYouTubeEmbedUrl(about.videoUrl);

  return (
    <div>
      {about.heroImage?.secureUrl && (
        <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[480px] border-b border-border overflow-hidden">
          <Image
            src={about.heroImage.secureUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-h1 mb-10">{about.title ?? "Our Story"}</h1>

        {about.story ? (
          <p className="text-sm leading-relaxed whitespace-pre-line text-fg-muted mb-12">
            {about.story}
          </p>
        ) : (
          <p className="text-sm text-fg-muted mb-12">Our story is coming soon.</p>
        )}

        {embedUrl && (
          <div className="relative aspect-video mb-12 border border-border bg-surface">
            <iframe
              src={embedUrl}
              title="About video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        )}

        {(about.mission || about.vision) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            {about.mission && (
              <div>
                <h2 className="font-display text-xl mb-2">Mission</h2>
                <p className="text-sm text-fg-muted">{about.mission}</p>
              </div>
            )}
            {about.vision && (
              <div>
                <h2 className="font-display text-xl mb-2">Vision</h2>
                <p className="text-sm text-fg-muted">{about.vision}</p>
              </div>
            )}
          </div>
        )}

        {(about.values ?? []).length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-xl mb-4">Values</h2>
            <ul className="flex flex-col gap-2">
              {about.values.map((value: string, index: number) => (
                <li key={`${value}-${index}`} className="text-sm text-fg-muted">
                  {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(about.timeline ?? []).length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-xl mb-6">Our Journey</h2>
            <div className="flex flex-col gap-6 border-l border-border pl-6">
              {about.timeline.map((entry: {
                _id: string;
                year: string;
                title: string;
                description?: string;
              }) => (
                <div key={String(entry._id)}>
                  <p className="text-xs tracking-wide uppercase text-fg-muted mb-1">
                    {entry.year}
                  </p>
                  <p className="text-sm font-medium">{entry.title}</p>
                  {entry.description && (
                    <p className="text-sm text-fg-muted mt-1">{entry.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(about.team ?? []).length > 0 && (
          <div>
            <h2 className="font-display text-xl mb-6">Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {about.team.map((member: {
                _id: string;
                name: string;
                role?: string;
                bio?: string;
                photo?: { secureUrl?: string };
              }) => (
                <div key={String(member._id)}>
                  <div className="relative aspect-square bg-surface border border-border mb-2">
                    {member.photo?.secureUrl && (
                      <Image
                        src={member.photo.secureUrl}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="text-sm">{member.name}</p>
                  {member.role && <p className="text-xs text-fg-muted">{member.role}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}