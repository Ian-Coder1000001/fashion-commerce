import {
  listShippingZonesForAdmin,
  deleteShippingZoneAction,
} from "@/actions/shipping.actions";
import { ShippingZoneCreateForm } from "@/components/admin/ShippingZoneCreateForm";

export default async function AdminShippingPage() {
  const zones = await listShippingZonesForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Shipping</h1>
      <p className="text-sm text-fg-muted mb-8 max-w-2xl">
        More specific zones win automatically: a Nairobi + Kenya zone is used
        over a plain Kenya zone, which is used over the default zone.
      </p>

      <ShippingZoneCreateForm />

      {zones.length === 0 ? (
        <p className="text-sm text-fg-muted">
          No shipping zones yet — until you add one, every order ships free.
        </p>
      ) : (
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-left text-fg-muted border-b border-border">
              <th className="py-3 font-normal">Zone</th>
              <th className="py-3 font-normal">Countries</th>
              <th className="py-3 font-normal">Region</th>
              <th className="py-3 font-normal">Fee</th>
              <th className="py-3 font-normal">Free over</th>
              <th className="py-3 font-normal w-20"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={String(zone._id)} className="border-b border-border">
                <td className="py-3">
                  {zone.name}
                  {zone.isDefault && (
                    <span className="ml-2 text-[10px] tracking-wide uppercase text-fg-muted">
                      Default
                    </span>
                  )}
                </td>
                <td className="py-3 text-fg-muted">
                  {zone.countries.length > 0 ? zone.countries.join(", ") : "—"}
                </td>
                <td className="py-3 text-fg-muted">{zone.region ?? "—"}</td>
                <td className="py-3">{zone.fee}</td>
                <td className="py-3 text-fg-muted">
                  {zone.freeShippingThreshold ?? "—"}
                </td>
                <td className="py-3">
                  <form action={deleteShippingZoneAction.bind(null, String(zone._id))}>
                    <button className="text-xs text-fg-muted hover:text-error">
                      Delete
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