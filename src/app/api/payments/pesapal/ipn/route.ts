import { NextRequest, NextResponse } from "next/server";
import { confirmPesapalPayment } from "@/services/payment/PaymentService";

async function handleIpn(orderTrackingId: string | null, merchantReference: string | null) {
  if (!orderTrackingId) {
    return NextResponse.json({ error: "Missing OrderTrackingId" }, { status: 400 });
  }

  try {
    await confirmPesapalPayment(orderTrackingId);
  } catch (err) {
    console.error("[pesapal ipn] confirmation failed:", err);
    return NextResponse.json(
      {
        orderNotificationType: "IPNCHANGE",
        orderTrackingId,
        orderMerchantReference: merchantReference,
        status: 500,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    orderNotificationType: "IPNCHANGE",
    orderTrackingId,
    orderMerchantReference: merchantReference,
    status: 200,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return handleIpn(
    searchParams.get("OrderTrackingId"),
    searchParams.get("OrderMerchantReference")
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  return handleIpn(
    body.OrderTrackingId ?? null,
    body.OrderMerchantReference ?? null
  );
}