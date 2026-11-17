import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
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

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a reset token, stores only its hash (never the raw token)
 * against the user, and returns the raw token for the caller to email
 * out. Returns null if the email doesn't exist. The caller must not
 * reveal that, or this becomes a way to enumerate registered customers.
 */
export async function createPasswordResetToken(
  email: string
): Promise<string | null> {
  await connectToDatabase();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;

  const rawToken = randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashToken(rawToken);
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await user.save();

  return rawToken;
}

export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string
): Promise<boolean> {
  await connectToDatabase();

  const tokenHash = hashToken(rawToken);
  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordTokenHash +resetPasswordExpires");

  if (!user) return false;

  user.passwordHash = await hashPassword(newPassword);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpires = null;
  await user.save();

  return true;
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
 * Registers a new customer account. Returns an error object if the
 * email is already taken.
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

export type GoogleSignInResult =
  | { ok: true; id: string; role: "customer" | "admin" }
  | { ok: false };

/**
 * Finds or creates the customer account for a Google sign-in. The
 * caller must already have checked that Google reports the email as
 * verified. Refuses (ok: false) for disabled accounts and for admins:
 * admin access stays on email + password.
 *
 * If the email belongs to an account created with a password, that
 * account is linked to Google and its password is removed once. We never
 * verify emails at registration, so that password could have been set
 * by someone who pre-registered another person's address. The real owner
 * can set a new password with "Forgot password" at any time.
 */
export async function findOrCreateGoogleUser(
  email: string,
  name: string
): Promise<GoogleSignInResult> {
  await connectToDatabase();
  const normalized = email.toLowerCase();

  let user = await User.findOne({ email: normalized }).select("+passwordHash");

  if (!user) {
    try {
      const created = await User.create({
        name: name.trim() || normalized.split("@")[0],
        email: normalized,
        role: "customer",
        provider: "google",
      });
      return { ok: true, id: String(created._id), role: "customer" };
    } catch (err) {
      // Lost a race with another sign-in for the same email: use theirs.
      if ((err as { code?: number }).code !== 11000) throw err;
      user = await User.findOne({ email: normalized }).select("+passwordHash");
    }
  }

  if (!user || user.isDisabled || user.role === "admin") {
    return { ok: false };
  }

  if (user.provider !== "google") {
    user.provider = "google";
    user.passwordHash = undefined;
    await user.save();
  }

  return { ok: true, id: String(user._id), role: user.role };
}

/**
 * Creates the admin user if it doesn't exist yet, or promotes/updates an
 * existing user with this email to admin. Used only by the seed script —
 * never exposed as an API route.
 */
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
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}