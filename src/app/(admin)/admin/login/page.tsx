import { redirect } from "next/navigation";

// Alias so that anyone who expects an admin-specific login URL doesn't
// hit a 404. Unauthenticated visitors never actually reach this page —
// the proxy middleware intercepts and sends them to /login first, same
// as any other /admin/* route.
export default function AdminLoginAliasPage() {
  redirect("/admin");
}