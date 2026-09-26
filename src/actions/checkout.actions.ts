"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  placeOrder,
  InsufficientStockError,
  CouponError,
  type ShippingAddressInput,
} from "@/services/order.service";
import { initiatePesapalPayment } from "@/services/payment/PaymentService";
import { auth } from "@/lib/auth";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  line1: z.string().min(1, "Address is required."),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Country is required."),
  phone: z.string().min(1, "Phone number is required."),
});

export interface CheckoutState {
  error?: string;
}

export async function placeOrderAction(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth();

  const addressInput: ShippingAddressInput = {
    fullName: String(formData.get("fullName") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? "") || undefined,
    city: String(formData.get("city") ?? ""),
    region: String(formData.get("region") ?? "") || undefined,
    postalCode: String(formData.get("postalCode") ?? "") || undefined,
    country: String(formData.get("country") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };

  const parsedAddress = addressSchema.safeParse(addressInput);
  if (!parsedAddress.success) {
    return { error: parsedAddress.error.issues[0]?.message ?? "Invalid address." };
  }

  const guestEmail = String(formData.get("guestEmail") ?? "").trim();
  if (!session) {
    const emailCheck = z.email().safeParse(guestEmail);
    if (!emailCheck.success) {
      return { error: "Enter a valid email so we can send order updates." };
    }
  }

  const paymentMethod =
    String(formData.get("paymentMethod") ?? "cash_on_delivery") === "pesapal"
      ? "pesapal"
      : "cash_on_delivery";

  let order;
  try {
    order = await placeOrder({
      shippingAddress: parsedAddress.data,
      guestEmail: session ? undefined : guestEmail,
      paymentMethod,
      couponCode: String(formData.get("couponCode") ?? "").trim() || undefined,
    });
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      return { error: err.message };
    }
    if (err instanceof CouponError) {
      return { error: err.message };
    }
    return { error: "Something went wrong placing your order. Please try again." };
  }

  if (paymentMethod === "pesapal") {
    let redirectUrl: string;
    try {
      redirectUrl = await initiatePesapalPayment(String(order._id));
    } catch (err) {
      console.error("[checkout] Pesapal initiation failed:", err);
      return {
        error:
          "We couldn't start the payment process. Your order was saved as pending — please try again or choose Cash on Delivery.",
      };
    }
    redirect(redirectUrl);
  }

  redirect(`/order/${order.orderNumber}`);
}





// "use server";

// import { initiatePesapalPayment } from "@/services/payment/PaymentService";

// import { redirect } from "next/navigation";
// import { z } from "zod";
// import {
//   placeOrder,
//   InsufficientStockError,
//   CouponError,
//   type ShippingAddressInput,
// } from "@/services/order.service";


// import { auth } from "@/lib/auth";

// const addressSchema = z.object({
//   fullName: z.string().min(1, "Full name is required."),
//   line1: z.string().min(1, "Address is required."),
//   line2: z.string().optional(),
//   city: z.string().min(1, "City is required."),
//   region: z.string().optional(),
//   postalCode: z.string().optional(),
//   country: z.string().min(1, "Country is required."),
//   phone: z.string().min(1, "Phone number is required."),
// });

// export interface CheckoutState {
//   error?: string;
// }

// export async function placeOrderAction(
//   _prevState: CheckoutState,
//   formData: FormData
// ): Promise<CheckoutState> {
//   const session = await auth();

//   const addressInput: ShippingAddressInput = {
//     fullName: String(formData.get("fullName") ?? ""),
//     line1: String(formData.get("line1") ?? ""),
//     line2: String(formData.get("line2") ?? "") || undefined,
//     city: String(formData.get("city") ?? ""),
//     region: String(formData.get("region") ?? "") || undefined,
//     postalCode: String(formData.get("postalCode") ?? "") || undefined,
//     country: String(formData.get("country") ?? ""),
//     phone: String(formData.get("phone") ?? ""),
//   };

//   const parsedAddress = addressSchema.safeParse(addressInput);
//   if (!parsedAddress.success) {
//     return { error: parsedAddress.error.issues[0]?.message ?? "Invalid address." };
//   }

//   const guestEmail = String(formData.get("guestEmail") ?? "").trim();
//   if (!session) {
//     const emailCheck = z.email().safeParse(guestEmail);
//     if (!emailCheck.success) {
//       return { error: "Enter a valid email so we can send order updates." };
//     }
//   }



//     const paymentMethod =
//     String(formData.get("paymentMethod") ?? "cash_on_delivery") === "pesapal"
//       ? "pesapal"
//       : "cash_on_delivery";

//   let order;
//   try {
//     order = await placeOrder({
//       shippingAddress: parsedAddress.data,
//       guestEmail: session ? undefined : guestEmail,
//       paymentMethod,
//       couponCode: String(formData.get("couponCode") ?? "").trim() || undefined,
//     });
//   } catch (err) {
//     if (err instanceof InsufficientStockError) {
//       return { error: err.message };
//     }
//     if (err instanceof CouponError) {
//       return { error: err.message };
//     }
//     return { error: "Something went wrong placing your order. Please try again." };
//   }

//   if (paymentMethod === "pesapal") {
//     let redirectUrl: string;
//     try {
//       redirectUrl = await initiatePesapalPayment(String(order._id));
//     } catch (err) {
//       console.error("[checkout] Pesapal initiation failed:", err);
//       return {
//         error:
//           "We couldn't start the payment process. Your order was saved as pending — please try again or choose Cash on Delivery.",
//       };
//     }
//     redirect(redirectUrl);
//   }

//   redirect(`/order/${order.orderNumber}`);
// }





//   let order;
//   try {
//     order = await placeOrder({
//       shippingAddress: parsedAddress.data,
//       guestEmail: session ? undefined : guestEmail,
//       paymentMethod: "cash_on_delivery",
//     });
//   } catch (err) {
//     if (err instanceof InsufficientStockError) {
//       return { error: err.message };
//     }
//     return { error: "Something went wrong placing your order. Please try again." };
//   }

//   redirect(`/order/${order.orderNumber}`);
// }