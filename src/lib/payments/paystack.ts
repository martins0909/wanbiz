/**
 * Paystack payment contracts for Wanbiz EventPass.
 *
 * Live processing remains disabled until MongoDB-backed event inventory and
 * verified payment fulfillment are implemented. Every paid
 * action (ticket purchase, wallet funding, invitation, presale support,
 * membership) routes through this module, so enabling Paystack later means
 * implementing these two functions against a trusted server handler — nothing in
 * the UI has to change.
 */

export type PaymentPurpose =
  | "TICKET_PURCHASE"
  | "WALLET_FUNDING"
  | "INVITATION"
  | "PRESALE_CONTRIBUTION"
  | "MEMBERSHIP";

export interface PaymentIntent {
  purpose: PaymentPurpose;
  /** Amount in Naira (converted to kobo before hitting Paystack). */
  amount: number;
  email: string;
  reference?: string;
  metadata?: Record<string, string | number>;
}

export interface PaymentInitializationResult {
  authorizationUrl: string;
  reference: string;
}

export interface PaymentVerificationResult {
  reference: string;
  status: "success" | "failed" | "pending";
  amount: number;
  paidAt: string | null;
}

export class PaymentsDisabledError extends Error {
  readonly purpose: PaymentPurpose;
  constructor(purpose: PaymentPurpose) {
    super("Payments are not enabled until event inventory and fulfillment are connected.");
    this.name = "PaymentsDisabledError";
    this.purpose = purpose;
  }
}

export const PAYMENTS_ENABLED = false;

export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export async function initializePayment(intent: PaymentIntent): Promise<PaymentInitializationResult> {
  throw new PaymentsDisabledError(intent.purpose);
}

export async function verifyPayment(reference: string): Promise<PaymentVerificationResult> {
  return { reference, status: "pending", amount: 0, paidAt: null };
}

/** Friendly copy shown wherever a payment action is triggered while disabled. */
export const PAYMENTS_COMING_SOON_MESSAGE =
  "Secure Paystack checkout is not available yet. No payment has been taken.";
