import {
  listSubscribersForAdmin,
  removeSubscriberAction,
} from "@/actions/newsletter.actions";

export default async function AdminNewsletterPage() {
  const subscribers = await listSubscribersForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl">Newsletter</h1>
        <p className="text-sm text-fg-muted">
          {subscribers.length} subscriber{subscribers.length === 1 ? "" : "s"}
        </p>
      </div>

      {subscribers.length === 0 ? (
        <p className="text-sm text-fg-muted">No subscribers yet.</p>
      ) : (
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-left text-fg-muted border-b border-border">
              <th className="py-3 font-normal">Email</th>
              <th className="py-3 font-normal">Status</th>
              <th className="py-3 font-normal">Subscribed</th>
              <th className="py-3 font-normal w-20"></th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={String(sub._id)} className="border-b border-border">
                <td className="py-3">{sub.email}</td>
                <td className="py-3 text-fg-muted">
                  {sub.isActive ? "Active" : "Unsubscribed"}
                </td>
                <td className="py-3 text-fg-muted">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <form action={removeSubscriberAction.bind(null, String(sub._id))}>
                    <button className="text-xs text-fg-muted hover:text-error">
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}