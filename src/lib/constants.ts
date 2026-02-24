import type { BookingStatus, DealType } from "@/types/database";

export const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  enquiry: { label: "Enquiry", color: "#9ca3af" },
  hold: { label: "Hold", color: "#3b82f6" },
  offered: { label: "Offered", color: "#eab308" },
  pending: { label: "Pending", color: "#f97316" },
  confirmed: { label: "Confirmed", color: "#22c55e" },
  contracted: { label: "Contracted", color: "#15803d" },
  advanced: { label: "Advanced", color: "#a855f7" },
  settled: { label: "Settled", color: "#14b8a6" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  declined: { label: "Declined", color: "#991b1b" },
};

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  flat_fee: "Flat Fee",
  door_split: "Door Split",
  versus: "Versus (higher of)",
  plus: "Plus (fee + %)",
  buyout: "Buyout",
  custom: "Custom",
};

export const CURRENCIES = [
  { value: "GBP", label: "GBP (£)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
  { value: "CHF", label: "CHF" },
  { value: "SEK", label: "SEK" },
  { value: "NOK", label: "NOK" },
  { value: "DKK", label: "DKK" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
  { value: "JPY", label: "JPY (¥)" },
];

export const BILLING_OPTIONS = [
  "Headliner",
  "Co-Headliner",
  "Support",
  "B2B",
  "Resident",
  "Special Guest",
  "Other",
];
