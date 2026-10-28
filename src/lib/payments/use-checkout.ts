import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { PAYMENTS_COMING_SOON_MESSAGE } from "./paystack";

/** Payment actions stay disabled until event inventory and fulfillment are persistent. */
export function useCheckout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function run() {
    if (!user) {
      toast.info("Please sign in to continue to checkout.");
      void navigate({ to: "/login" });
      return;
    }
    toast.info(PAYMENTS_COMING_SOON_MESSAGE);
  }

  return {
    pending: false,
    buyTicket: async (_eventSlug: string, _ticketTypeId: string, _quantity = 1) => run(),
    buyMembership: run,
  };
}
