import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCartSummary } from "@/services/cart.service";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function CheckoutPage() {
  const cart = await getCartSummary();
  if (cart.lines.length === 0) redirect("/cart");

  const session = await auth();
  let savedAddresses: Array<{
    _id: string;
    label?: string;
    line1: string;
    line2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
  }> = [];
  let accountName: string | null = null;

  if (session) {
    await connectToDatabase();
    const user = await User.findById(session.user.id).lean();
    if (user) {
      savedAddresses = JSON.parse(JSON.stringify(user.addresses ?? []));
      accountName = user.name;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-h1 mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <CheckoutForm
            isLoggedIn={!!session}
            accountName={accountName}
            savedAddresses={savedAddresses}
            subtotal={cart.subtotal}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="border border-border p-6">
            <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
              Order Summary
            </h2>
            <div className="flex flex-col gap-3 mb-4 max-h-72 overflow-y-auto">
              {cart.lines.map((line) => (
                <div key={line.itemId} className="flex justify-between text-sm">
                  <span className="text-fg-muted">
                    {line.name} × {line.quantity}
                  </span>
                  <span>{formatPrice(line.lineTotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 flex justify-between text-sm font-medium">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




// import { redirect } from "next/navigation";
// import { auth } from "@/lib/auth";
// import { getCartSummary } from "@/services/cart.service";
// import { connectToDatabase } from "@/lib/db";
// import User from "@/models/User";
// import { CheckoutForm } from "@/components/storefront/CheckoutForm";

// function formatPrice(amount: number, currency = "KES") {
//   return new Intl.NumberFormat("en-KE", {
//     style: "currency",
//     currency,
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

// export default async function CheckoutPage() {
//   const cart = await getCartSummary();
//   if (cart.lines.length === 0) redirect("/cart");

//   const session = await auth();
//   let savedAddresses: Array<{
//     _id: string;
//     label?: string;
//     line1: string;
//     line2?: string;
//     city: string;
//     region?: string;
//     postalCode?: string;
//     country: string;
//     phone?: string;
//     isDefault?: boolean;
//   }> = [];
//   let accountName: string | null = null;

//   if (session) {
//     await connectToDatabase();
//     const user = await User.findById(session.user.id).lean();
//     if (user) {
//       savedAddresses = JSON.parse(JSON.stringify(user.addresses ?? []));
//       accountName = user.name;
//     }
//   }

//   return (
//     <div className="mx-auto max-w-5xl px-6 py-16">
//       <h1 className="font-display text-h1 mb-10">Checkout</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//         <div className="lg:col-span-2">
//           <CheckoutForm
//             isLoggedIn={!!session}
//             accountName={accountName}
//             savedAddresses={savedAddresses}
//             subtotal={cart.subtotal}
//           />
//         </div>

//         <div className="lg:col-span-1">
//           <div className="border border-border p-6">
//             <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
//               Order Summary
//             </h2>
//             <div className="flex flex-col gap-3 mb-4 max-h-72 overflow-y-auto">
//               {cart.lines.map((line) => (
//                 <div key={line.itemId} className="flex justify-between text-sm">
//                   <span className="text-fg-muted">
//                     {line.name} × {line.quantity}
//                   </span>
//                   <span>{formatPrice(line.lineTotal)}</span>
//                 </div>
//               ))}
//             </div>
//             <div className="border-t border-border pt-4 flex justify-between text-sm font-medium">
//               <span>Total</span>
//               <span>{formatPrice(cart.subtotal)}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }