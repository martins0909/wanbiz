// Shared domain types for Wanbiz EventPass.

export type UserRole = "ATTENDEE" | "ORGANIZER" | "ADMIN";

export type MembershipStatus = "NOT_A_MEMBER" | "ACTIVE" | "SUSPENDED";

export type TicketStatus = "ACTIVE" | "USED" | "TRANSFERRED" | "CANCELLED";

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PresaleStatus = "UPCOMING" | "LIVE" | "FUNDED" | "CLOSED";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export type WalletTransactionType = "FUNDING" | "TICKET_PURCHASE" | "INVITATION" | "REFUND" | "MEMBERSHIP";

export type EventCategorySlug =
  | "concerts"
  | "parties"
  | "conferences"
  | "weddings"
  | "sports"
  | "business"
  | "entertainment"
  | "religious"
  | "networking";

export interface EventCategory {
  slug: EventCategorySlug;
  name: string;
  description: string;
  icon: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  perks: string[];
}

export interface EventRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: EventCategorySlug;
  image: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  state: string;
  organizerName: string;
  startingPrice: number;
  ticketsAvailable: number;
  ticketsTotal: number;
  featured: boolean;
  acceptsTicketPass: boolean;
  seatingEnabled: boolean;
  ticketTypes: TicketType[];
}

export interface PresaleCampaign {
  id: string;
  eventId: string;
  eventName: string;
  image: string;
  city: string;
  date: string;
  status: PresaleStatus;
  goalAmount: number;
  raisedAmount: number;
  supporters: number;
  presalePrice: number;
  regularPrice: number;
  closesOn: string;
  description: string;
}

export interface TicketRecord {
  id: string;
  reference: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  city: string;
  ticketTypeName: string;
  price: number;
  status: TicketStatus;
  seat: string | null;
  checkedInAt: string | null;
  image: string;
}

export interface InvitationRecord {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  recipientName: string;
  recipientContact: string;
  direction: "SENT" | "RECEIVED";
  status: InvitationStatus;
  amount: number;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  description: string;
  amount: number;
  direction: "CREDIT" | "DEBIT";
  createdAt: string;
  status: OrderStatus;
}

export interface WalletRecord {
  balance: number;
  pendingHold: number;
  currency: "NGN";
  transactions: WalletTransaction[];
}

export interface MembershipRecord {
  status: MembershipStatus;
  membershipId: string | null;
  memberName: string | null;
  joinedAt: string | null;
  eligibleEventsCount: number;
  price: number;
  history: { id: string; label: string; date: string }[];
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  organizationName?: string;
  businessEmail?: string;
  businessPhone?: string;
}
