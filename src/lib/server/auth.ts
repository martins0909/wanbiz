import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { getMongoDb } from "@/lib/server/mongodb";
import type { SessionUser, UserRole } from "@/lib/types";

const SESSION_COOKIE = "wanbiz_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const RESET_TTL_MS = 1000 * 60 * 30;

interface UserDocument {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  organizationName?: string;
  businessEmail?: string;
  businessPhone?: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: Date;
}

interface SessionDocument {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

interface ResetDocument {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

let indexesPromise: Promise<void> | undefined;

async function ensureIndexes() {
  if (!indexesPromise) {
    indexesPromise = (async () => {
      const db = await getMongoDb();
      await Promise.all([
        db.collection<UserDocument>("users").createIndex({ email: 1 }, { unique: true }),
        db.collection<SessionDocument>("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
        db
          .collection<SessionDocument>("sessions")
          .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        db
          .collection<ResetDocument>("password_resets")
          .createIndex({ tokenHash: 1 }, { unique: true }),
        db
          .collection<ResetDocument>("password_resets")
          .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ]);
    })().catch((error: unknown) => {
      indexesPromise = undefined;
      throw error;
    });
  }
  await indexesPromise;
}

function sessionSecret(): string {
  const secret = process.env["SESSION_SECRET"] ?? "";
  if (secret.length < 32)
    throw new AuthError("SESSION_SECRET must contain at least 32 characters.", 503);
  return secret;
}

function digest(value: string): string {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

function cookieToken(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const pair = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return pair ? decodeURIComponent(pair.slice(SESSION_COOKIE.length + 1)) : null;
}

function sessionCookie(token: string, maxAge: number): string {
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function publicUser(user: UserDocument): SessionUser {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    ...(user.organizationName ? { organizationName: user.organizationName } : {}),
    ...(user.businessEmail ? { businessEmail: user.businessEmail } : {}),
    ...(user.businessPhone ? { businessPhone: user.businessPhone } : {}),
  };
}

function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(`scrypt:${salt}:${key.toString("hex")}`);
    });
  });
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, keyHex] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, expected.length, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function provisionInitialAdmin(email: string): Promise<UserDocument | null> {
  const configuredEmail = process.env["ADMIN_EMAIL"]?.trim().toLowerCase();
  const initialPassword = process.env["ADMIN_INITIAL_PASSWORD"] ?? "";
  if (!configuredEmail || !initialPassword || configuredEmail !== email) return null;

  const db = await getMongoDb();
  const users = db.collection<UserDocument>("users");
  const existing = await users.findOne({ email: configuredEmail });
  if (existing) return existing;

  const admin: UserDocument = {
    _id: crypto.randomUUID(),
    fullName: "Wanbiz Administrator",
    email: configuredEmail,
    phone: "",
    role: "ADMIN",
    passwordHash: await hashPassword(initialPassword),
    status: "ACTIVE",
    createdAt: new Date(),
  };
  try {
    await users.insertOne(admin);
    return admin;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return users.findOne({ email: configuredEmail });
    }
    throw error;
  }
}

async function issueSession(user: UserDocument) {
  const db = await getMongoDb();
  const token = randomBytes(32).toString("base64url");
  await db.collection<SessionDocument>("sessions").insertOne({
    tokenHash: digest(token),
    userId: user._id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return { user: publicUser(user), cookie: sessionCookie(token, SESSION_TTL_MS / 1000) };
}

export async function currentUser(request: Request): Promise<SessionUser | null> {
  const token = cookieToken(request);
  if (!token) return null;
  await ensureIndexes();
  const db = await getMongoDb();
  const session = await db.collection<SessionDocument>("sessions").findOne({
    tokenHash: digest(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;
  const user = await db
    .collection<UserDocument>("users")
    .findOne({ _id: session.userId, status: "ACTIVE" });
  return user ? publicUser(user) : null;
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<UserRole, "ATTENDEE" | "ORGANIZER">;
  organizationName?: string;
  businessEmail?: string;
  businessPhone?: string;
}) {
  await ensureIndexes();
  const db = await getMongoDb();
  const email = input.email.trim().toLowerCase();
  const user: UserDocument = {
    _id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    role: input.role,
    passwordHash: await hashPassword(input.password),
    status: "ACTIVE",
    createdAt: new Date(),
    ...(input.role === "ORGANIZER" && input.organizationName?.trim()
      ? { organizationName: input.organizationName.trim() }
      : {}),
    ...(input.role === "ORGANIZER" && input.businessEmail?.trim()
      ? { businessEmail: input.businessEmail.trim().toLowerCase() }
      : {}),
    ...(input.role === "ORGANIZER" && input.businessPhone?.trim()
      ? { businessPhone: input.businessPhone.trim() }
      : {}),
  };
  try {
    await db.collection<UserDocument>("users").insertOne(user);
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      throw new AuthError("An account with that email already exists.", 409);
    }
    throw error;
  }
  return issueSession(user);
}

export async function loginUser(emailInput: string, password: string) {
  await ensureIndexes();
  const email = emailInput.trim().toLowerCase();
  const db = await getMongoDb();
  let user = await db.collection<UserDocument>("users").findOne({ email });
  if (!user) user = await provisionInitialAdmin(email);
  if (!user || user.status !== "ACTIVE" || !(await verifyPassword(password, user.passwordHash))) {
    throw new AuthError("Email or password is incorrect.", 401);
  }
  return issueSession(user);
}

export async function endSession(request: Request) {
  const token = cookieToken(request);
  if (token) {
    await ensureIndexes();
    await (
      await getMongoDb()
    )
      .collection<SessionDocument>("sessions")
      .deleteOne({ tokenHash: digest(token) });
  }
  return sessionCookie("", 0);
}

export async function requestPasswordReset(emailInput: string, origin: string) {
  const apiKey = process.env["RESEND_API_KEY"] ?? "";
  const from = process.env["RESEND_FROM_EMAIL"] ?? "";
  if (!apiKey || !from) throw new AuthError("Password recovery is not configured yet.", 503);

  await ensureIndexes();
  const db = await getMongoDb();
  const user = await db
    .collection<UserDocument>("users")
    .findOne({ email: emailInput.trim().toLowerCase() });
  if (!user) return;

  const token = randomBytes(32).toString("hex");
  const tokenHash = digest(token);
  await db.collection<ResetDocument>("password_resets").insertOne({
    tokenHash,
    userId: user._id,
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });
  const appUrl = process.env["APP_URL"]?.replace(/\/$/, "") || origin;
  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [user.email],
      subject: "Reset your Wanbiz EventPass password",
      html: `<p>Use this link to set a new password. It expires in 30 minutes.</p><p><a href="${resetUrl}">Reset password</a></p>`,
    }),
  });
  if (!response.ok) {
    await db.collection<ResetDocument>("password_resets").deleteOne({ tokenHash });
    throw new AuthError("We could not send a recovery email. Please try again later.", 502);
  }
}

export async function resetUserPassword(token: string, password: string) {
  await ensureIndexes();
  const db = await getMongoDb();
  const resets = db.collection<ResetDocument>("password_resets");
  const reset = await resets.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } });
  if (!reset) throw new AuthError("This recovery link is invalid or expired.", 400);

  await db
    .collection<UserDocument>("users")
    .updateOne({ _id: reset.userId }, { $set: { passwordHash: await hashPassword(password) } });
  await Promise.all([
    resets.deleteMany({ userId: reset.userId }),
    db.collection<SessionDocument>("sessions").deleteMany({ userId: reset.userId }),
  ]);
}

export function clearSessionCookie(): string {
  return sessionCookie("", 0);
}
