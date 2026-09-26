import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

/**
 * Verifies email/password credentials against the database.
 * Returns null on any failure (wrong email, wrong password, disabled
 * account, OAuth-only account) without distinguishing which — never
 * leak which part was wrong to the client.
 */
export async function authenticateWithCredentials(
  email: string,
  password: string
): Promise<AuthenticatedUser | null> {
  await connectToDatabase();

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash"
  );

  if (!user || !user.passwordHash || user.isDisabled) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Creates the admin user if it doesn't exist yet, or promotes/updates an
 * existing user with this email to admin. Used only by the seed script —
 * never exposed as an API route.
 */


export async function registerCustomer(
  name: string,
  email: string,
  password: string
): Promise<AuthenticatedUser | { error: string }> {
  await connectToDatabase();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "customer",
    provider: "credentials",
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}




export async function upsertAdminUser(
  email: string,
  password: string,
  name = "Admin"
): Promise<AuthenticatedUser> {
  await connectToDatabase();

  const passwordHash = await hashPassword(password);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { name, passwordHash, role: "admin", provider: "credentials" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
