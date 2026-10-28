import { toast } from "sonner";
import { PAYMENTS_COMING_SOON_MESSAGE, type PaymentPurpose } from "./paystack";

const titles: Record<PaymentPurpose, string> = {
  TICKET_PURCHASE: "Ticket reserved",
  WALLET_FUNDING: "Funding saved",
  INVITATION: "Invitation drafted",
  PRESALE_CONTRIBUTION: "Presale support noted",
  MEMBERSHIP: "Membership request noted",
};

/** Single place that reports a payment-gated action while Paystack is pending. */
export function notifyPaymentsComingSoon(purpose: PaymentPurpose, detail?: string) {
  toast.info(titles[purpose], { description: detail ?? PAYMENTS_COMING_SOON_MESSAGE });
}
