import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { sendEmail, escapeHtml } from "@/lib/email";

// Only these status changes email the customer. "Processing", "packed"
// and the like change too often to be worth an inbox message each.
const NOTIFY_STATUSES = ["shipped", "delivered", "cancelled"];

interface OrderForStatusEmail {
  orderNumber: string;
  user?: unknown;
  guestEmail?: string | null;
  items: { product: unknown; name: string }[];
}

export async function sendOrderStatusEmail(
  order: OrderForStatusEmail,
  status: string
) {
  if (!NOTIFY_STATUSES.includes(status)) return;

  await connectToDatabase();

  const recipient = order.user
    ? (await User.findById(order.user).select("email").lean())?.email
    : order.guestEmail;
  if (!recipient) return;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const number = escapeHtml(order.orderNumber);
  // Replies to our sender address go nowhere, so point people at the
  // contact page instead of saying "reply to this email".
  const contactLink = `<a href="${baseUrl}/contact">contact us</a>`;

  if (status === "shipped") {
    await sendEmail({
      to: recipient,
      subject: `Your order is on its way — ${order.orderNumber}`,
      html: `
        <h2>Your order is on its way</h2>
        <p>Order #${number} has been shipped and is heading to you.</p>
        <p>Questions? Please ${contactLink}.</p>
      `,
    });
    return;
  }

  if (status === "cancelled") {
    await sendEmail({
      to: recipient,
      subject: `Order cancelled — ${order.orderNumber}`,
      html: `
        <h2>Your order has been cancelled</h2>
        <p>Order #${number} has been cancelled.</p>
        <p>If you weren't expecting this, please ${contactLink}.</p>
      `,
    });
    return;
  }

  // Delivered. Only registered customers can leave reviews, so only
  // they get the review links.
  let reviewLinks = "";
  if (order.user) {
    const products = await Product.find({
      _id: { $in: order.items.map((item) => item.product) },
    })
      .select("slug name")
      .lean();

    reviewLinks = products
      .map(
        (p: { slug: string; name: string }) =>
          `<li><a href="${baseUrl}/product/${encodeURIComponent(p.slug)}#reviews">${escapeHtml(p.name)}</a></li>`
      )
      .join("");
  }

  await sendEmail({
    to: recipient,
    subject: `Your order was delivered — ${order.orderNumber}`,
    html: `
      <h2>Your order has been delivered</h2>
      <p>Order #${number} was marked as delivered. We hope you love it.</p>
      ${
        reviewLinks
          ? `<p>Enjoying it? Tell other shoppers what you think:</p><ul>${reviewLinks}</ul>`
          : ""
      }
      <p>Anything not right? Please ${contactLink}.</p>
    `,
  });
}