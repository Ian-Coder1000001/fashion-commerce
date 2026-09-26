const BASE_URL =
  process.env.PESAPAL_ENV === "live"
    ? "https://pay.pesapal.com/v3/api"
    : "https://cybqa.pesapal.com/pesapalv3/api";

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 5000) {
    return tokenCache.token;
  }

  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error(
      "Missing PESAPAL_CONSUMER_KEY or PESAPAL_CONSUMER_SECRET in environment."
    );
  }

  const res = await fetch(`${BASE_URL}/Auth/RequestToken`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  

    const data = await res.json();
  if (!data.token) {
    console.error("[pesapal] auth request failed, full response:", {
      httpStatus: res.status,
      body: data,
    });
    throw new Error(`Pesapal auth failed: ${data.message ?? data.error ?? JSON.stringify(data)}`);
  }




//   const data = await res.json();
//   if (!data.token) {
//     throw new Error(`Pesapal auth failed: ${data.message ?? "unknown error"}`);
//   }

  tokenCache = {
    token: data.token,
    expiresAt: new Date(data.expiryDate).getTime(),
  };
  return data.token;
}

async function getNotificationId(): Promise<string> {
  if (process.env.PESAPAL_NOTIFICATION_ID) {
    return process.env.PESAPAL_NOTIFICATION_ID;
  }

  const token = await getAccessToken();
  const ipnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/pesapal/ipn`;

  const res = await fetch(`${BASE_URL}/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
  });

  const data = await res.json();
  if (!data.ipn_id) {
    throw new Error(
      `Failed to register Pesapal IPN URL: ${data.message ?? "unknown error"}. ` +
        `Note: this URL must be publicly reachable — localhost won't work; use ngrok or a deployed URL.`
    );
  }

  console.warn(
    `[pesapal] Registered new IPN (${data.ipn_id}). Set PESAPAL_NOTIFICATION_ID=${data.ipn_id} ` +
      `in your env to avoid re-registering on every restart.`
  );

  return data.ipn_id;
}

export interface SubmitOrderInput {
  merchantReference: string;
  amount: number;
  currency: string;
  description: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface SubmitOrderResult {
  orderTrackingId: string;
  redirectUrl: string;
}

export async function submitOrder(
  input: SubmitOrderInput
): Promise<SubmitOrderResult> {
  const token = await getAccessToken();
  const notificationId = await getNotificationId();

  const res = await fetch(`${BASE_URL}/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: input.merchantReference,
      currency: input.currency,
      amount: input.amount,
      description: input.description.slice(0, 100),
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/callback`,
      notification_id: notificationId,
      billing_address: {
        email_address: input.email,
        phone_number: input.phone,
        first_name: input.firstName,
        last_name: input.lastName,
      },
    }),
  });

  const data = await res.json();
  if (!data.redirect_url) {
    throw new Error(
      `Pesapal order submission failed: ${data.message ?? data.error ?? "unknown error"}`
    );
  }

  return {
    orderTrackingId: data.order_tracking_id,
    redirectUrl: data.redirect_url,
  };
}

export interface TransactionStatus {
  statusCode: 0 | 1 | 2 | 3;
  statusDescription: string;
  paymentMethod?: string;
  amount?: number;
  merchantReference: string;
}

export async function getTransactionStatus(
  orderTrackingId: string
): Promise<TransactionStatus> {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE_URL}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  return {
    statusCode: data.status_code,
    statusDescription: data.payment_status_description,
    paymentMethod: data.payment_method,
    amount: data.amount,
    merchantReference: data.merchant_reference,
  };
}