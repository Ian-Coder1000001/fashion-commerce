import Image from "next/image";
import {
  getAboutPage,
} from "@/services/about.service";
import {
  updateAboutContentAction,
  uploadAboutHeroImageAction,
  addTeamMemberAction,
  removeTeamMemberAction,
  addTimelineEntryAction,
  removeTimelineEntryAction,
} from "@/actions/about.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function AdminAboutPage() {
  const about = await getAboutPage();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">About Page</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Hero Image
          </h2>
          {about.heroImage?.secureUrl && (
            <div className="relative aspect-[16/9] border border-border bg-surface mb-4">
              <Image
                src={about.heroImage.secureUrl}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          )}
          <form
            action={uploadAboutHeroImageAction}
            className="flex flex-col gap-3 border border-border p-4"
          >
            <input type="file" name="file" accept="image/*" required className="text-sm" />
            <Button type="submit" size="sm" className="self-start">
              {about.heroImage?.secureUrl ? "Replace image" : "Upload image"}
            </Button>
          </form>
        </section>

        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Content
          </h2>
          <form action={updateAboutContentAction} className="flex flex-col gap-4">
            <Input label="Page title" name="title" defaultValue={about.title} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">Story</label>
              <textarea
                name="story"
                defaultValue={about.story}
                rows={5}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">Mission</label>
              <textarea
                name="mission"
                defaultValue={about.mission}
                rows={3}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">Vision</label>
              <textarea
                name="vision"
                defaultValue={about.vision}
                rows={3}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">
                Values (one per line)
              </label>
              <textarea
                name="values"
                defaultValue={(about.values ?? []).join("\n")}
                rows={4}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <Input
              label="Video URL (optional)"
              name="videoUrl"
              defaultValue={about.videoUrl}
              placeholder="https://youtube.com/..."
            />
            <Button type="submit" size="sm" className="self-start">
              Save content
            </Button>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mt-12">
        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Team
          </h2>
          {(about.team ?? []).length > 0 && (
            <div className="flex flex-col gap-3 mb-6">
              {about.team.map((member: {
                _id: string;
                name: string;
                role?: string;
                photo?: { secureUrl?: string };
              }) => (
                <div
                  key={String(member._id)}
                  className="flex items-center gap-3 border border-border p-3"
                >
                  <div className="relative w-12 h-12 shrink-0 bg-surface border border-border">
                    {member.photo?.secureUrl && (
                      <Image
                        src={member.photo.secureUrl}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p>{member.name}</p>
                    {member.role && <p className="text-fg-muted text-xs">{member.role}</p>}
                  </div>
                  <form action={removeTeamMemberAction.bind(null, String(member._id))}>
                    <button className="text-xs text-fg-muted hover:text-error">
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <form
            action={addTeamMemberAction}
            className="grid grid-cols-2 gap-3 border border-border p-4"
          >
            <Input label="Name" name="name" required className="col-span-2" />
            <Input label="Role" name="role" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">Photo</label>
              <input type="file" name="photo" accept="image/*" className="text-sm" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">Bio</label>
              <textarea
                name="bio"
                rows={2}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <Button type="submit" size="sm">
                Add team member
              </Button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Timeline
          </h2>
          {(about.timeline ?? []).length > 0 && (
            <div className="flex flex-col gap-2 mb-6">
              {about.timeline.map((entry: {
                _id: string;
                year: string;
                title: string;
              }) => (
                <div
                  key={String(entry._id)}
                  className="flex items-center justify-between border border-border p-3 text-sm"
                >
                  <span>
                    <strong>{entry.year}</strong> — {entry.title}
                  </span>
                  <form action={removeTimelineEntryAction.bind(null, String(entry._id))}>
                    <button className="text-xs text-fg-muted hover:text-error">
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <form
            action={addTimelineEntryAction}
            className="grid grid-cols-2 gap-3 border border-border p-4"
          >
            <Input label="Year" name="year" required />
            <Input label="Title" name="title" required />
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">
                Description (optional)
              </label>
              <textarea
                name="description"
                rows={2}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <Button type="submit" size="sm">
                Add entry
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}