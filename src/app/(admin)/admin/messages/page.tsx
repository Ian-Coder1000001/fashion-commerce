import {
  listMessagesForAdmin,
  markMessageStatusAction,
  deleteMessageAction,
} from "@/actions/contact.actions";

export default async function AdminMessagesPage() {
  const messages = await listMessagesForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Messages</h1>

      {messages.length === 0 ? (
        <p className="text-sm text-fg-muted">No messages yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border border-y border-border">
          {messages.map((msg) => (
            <div key={String(msg._id)} className="py-5 flex justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-medium">{msg.subject}</p>
                  {msg.status === "unread" && (
                    <span className="text-[10px] tracking-wide uppercase bg-fg text-bg px-1.5 py-0.5">
                      New
                    </span>
                  )}
                  {msg.status === "archived" && (
                    <span className="text-[10px] tracking-wide uppercase text-fg-muted">
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-xs text-fg-muted mb-2">
                  {msg.name} · {msg.email}
                  {msg.phone ? ` · ${msg.phone}` : ""}
                </p>
                <p className="text-sm text-fg-muted whitespace-pre-line">
                  {msg.message}
                </p>
                <p className="text-xs text-fg-muted mt-2">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-xs shrink-0">
                {msg.status !== "read" && (
                  <form action={markMessageStatusAction.bind(null, String(msg._id), "read")}>
                    <button className="text-fg-muted hover:text-fg">Mark read</button>
                  </form>
                )}
                {msg.status !== "unread" && (
                  <form action={markMessageStatusAction.bind(null, String(msg._id), "unread")}>
                    <button className="text-fg-muted hover:text-fg">Mark unread</button>
                  </form>
                )}
                {msg.status !== "archived" && (
                  <form action={markMessageStatusAction.bind(null, String(msg._id), "archived")}>
                    <button className="text-fg-muted hover:text-fg">Archive</button>
                  </form>
                )}
                <form action={deleteMessageAction.bind(null, String(msg._id))}>
                  <button className="text-fg-muted hover:text-error">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}