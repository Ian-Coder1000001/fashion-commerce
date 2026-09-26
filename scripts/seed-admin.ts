/**
 * Run with: npm run seed:admin
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env.local and
 * creates that user as an admin, or promotes an existing user with that
 * email to admin. Safe to run more than once.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { upsertAdminUser } from "../src/services/auth.service";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error(
      "Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env.local. Add both and re-run."
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const user = await upsertAdminUser(email, password, name);
  console.log(`Admin ready: ${user.email} (role: ${user.role})`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
