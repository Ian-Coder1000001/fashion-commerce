import { redirect, notFound } from "next/navigation";
import { confirmPesapalPayment } from "@/services/payment/PaymentService";

export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ OrderTrackingId?: string; OrderMerchantReference?: string }>;
}) {
  const { OrderTrackingId, OrderMerchantReference } = await searchParams;

  if (!OrderTrackingId || !OrderMerchantReference) notFound();

  try {
    await confirmPesapalPayment(OrderTrackingId);
  } catch (err) {
    console.error("[pesapal callback] confirmation failed:", err);
  }

  redirect(`/order/${OrderMerchantReference}`);
}