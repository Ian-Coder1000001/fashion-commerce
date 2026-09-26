import {
  listCouponsForAdmin,
  toggleCouponActiveAction,
  deleteCouponAction,
} from "@/actions/coupon.actions";
import { CouponCreateForm } from "@/components/admin/CouponCreateForm";

export default async function AdminCouponsPage() {
  const coupons = await listCouponsForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Coupons</h1>

      <CouponCreateForm />

      {coupons.length === 0 ? (
        <p className="text-sm text-fg-muted">No coupons yet.</p>
      ) : (
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-left text-fg-muted border-b border-border">
              <th className="py-3 font-normal">Code</th>
              <th className="py-3 font-normal">Type</th>
              <th className="py-3 font-normal">Value</th>
              <th className="py-3 font-normal">Used</th>
              <th className="py-3 font-normal">Status</th>
              <th className="py-3 font-normal w-32"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon: {
  _id: unknown;
  code: string;
  type: string;
  value: number;
  usedCount: number;
  usageLimit?: number;
  isActive: boolean;
}) => (
              <tr key={String(coupon._id)} className="border-b border-border">
                <td className="py-3">{coupon.code}</td>
                <td className="py-3 text-fg-muted">{coupon.type}</td>
                <td className="py-3">
                  {coupon.type === "percentage" ? `${coupon.value}%` : coupon.value}
                </td>
                <td className="py-3 text-fg-muted">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </td>
                <td className="py-3 text-fg-muted">
                  {coupon.isActive ? "Active" : "Inactive"}
                </td>
                <td className="py-3">
                  <div className="flex gap-3">
                    <form action={toggleCouponActiveAction.bind(null, String(coupon._id))}>
                      <button className="text-xs text-fg-muted hover:text-fg">
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                    <form action={deleteCouponAction.bind(null, String(coupon._id))}>
                      <button className="text-xs text-fg-muted hover:text-error">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}