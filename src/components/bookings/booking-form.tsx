"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "./status-badge";
import { DEAL_TYPE_LABELS, CURRENCIES, BILLING_OPTIONS } from "@/lib/constants";
import type { Booking, BookingStatus, DealType, Artist } from "@/types/database";

interface BookingFormProps {
  booking: Booking;
  artists: Artist[];
  onSave: (field: string, value: unknown) => Promise<void>;
  disabled?: boolean;
}

const DEAL_TYPE_OPTIONS = Object.entries(DEAL_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "enquiry", label: "Enquiry" },
  { value: "hold", label: "Hold" },
  { value: "offered", label: "Offered" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "contracted", label: "Contracted" },
  { value: "advanced", label: "Advanced" },
  { value: "settled", label: "Settled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "declined", label: "Declined" },
];

const BILLING_SELECT_OPTIONS = BILLING_OPTIONS.map((b) => ({
  value: b,
  label: b,
}));

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  span2,
}: {
  label: string;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={`space-y-1 ${span2 ? "sm:col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

export function BookingForm({
  booking,
  artists,
  onSave,
  disabled = false,
}: BookingFormProps) {
  const [local, setLocal] = useState(booking);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when booking prop changes (e.g. after save)
  useEffect(() => {
    setLocal(booking);
  }, [booking]);

  const debouncedSave = useCallback(
    (field: string, value: unknown) => {
      if (disabled) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onSave(field, value);
      }, 500);
    },
    [onSave, disabled]
  );

  const handleChange = (field: keyof Booking, value: unknown) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    debouncedSave(field, value);
  };

  const handleBlur = (field: keyof Booking) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!disabled) {
      onSave(field, local[field]);
    }
  };

  const showPercentageField =
    local.deal_type === "door_split" ||
    local.deal_type === "versus" ||
    local.deal_type === "plus";

  return (
    <div className="space-y-6">
      <Section title="Booking">
        <Field label="Artist">
          <Select
            value={local.artist_id}
            onChange={(e) => {
              setLocal((prev) => ({ ...prev, artist_id: e.target.value }));
              onSave("artist_id", e.target.value);
            }}
            options={artists.map((a) => ({ value: a.id, label: a.name }))}
            disabled={disabled}
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={local.date}
            onChange={(e) => handleChange("date", e.target.value)}
            onBlur={() => handleBlur("date")}
            disabled={disabled}
          />
        </Field>
      </Section>

      <Section title="Venue">
        <Field label="Country">
          <Input
            value={local.country ?? ""}
            onChange={(e) => handleChange("country", e.target.value || null)}
            onBlur={() => handleBlur("country")}
            placeholder="e.g. United Kingdom"
            disabled={disabled}
          />
        </Field>
        <Field label="City">
          <Input
            value={local.city ?? ""}
            onChange={(e) => handleChange("city", e.target.value || null)}
            onBlur={() => handleBlur("city")}
            placeholder="e.g. London"
            disabled={disabled}
          />
        </Field>
        <Field label="Venue">
          <Input
            value={local.venue_name ?? ""}
            onChange={(e) => handleChange("venue_name", e.target.value || null)}
            onBlur={() => handleBlur("venue_name")}
            placeholder="Venue name"
            disabled={disabled}
          />
        </Field>
        <Field label="Venue Capacity">
          <Input
            type="number"
            value={local.venue_capacity ?? ""}
            onChange={(e) =>
              handleChange(
                "venue_capacity",
                e.target.value ? Number(e.target.value) : null
              )
            }
            onBlur={() => handleBlur("venue_capacity")}
            disabled={disabled}
          />
        </Field>
        <Field label="Room / Stage">
          <Input
            value={local.room ?? ""}
            onChange={(e) => handleChange("room", e.target.value || null)}
            onBlur={() => handleBlur("room")}
            placeholder="e.g. Main Room"
            disabled={disabled}
          />
        </Field>
        <Field label="Room Capacity">
          <Input
            type="number"
            value={local.room_capacity ?? ""}
            onChange={(e) =>
              handleChange(
                "room_capacity",
                e.target.value ? Number(e.target.value) : null
              )
            }
            onBlur={() => handleBlur("room_capacity")}
            disabled={disabled}
          />
        </Field>
      </Section>

      <Section title="Deal">
        <Field label="Currency">
          <Select
            value={local.currency ?? ""}
            onChange={(e) => {
              handleChange("currency", e.target.value || null);
              onSave("currency", e.target.value || null);
            }}
            options={CURRENCIES}
            placeholder="Select currency"
            disabled={disabled}
          />
        </Field>
        <Field label="Fee">
          <Input
            type="number"
            step="0.01"
            value={local.fee ?? ""}
            onChange={(e) =>
              handleChange("fee", e.target.value ? Number(e.target.value) : null)
            }
            onBlur={() => handleBlur("fee")}
            placeholder="0.00"
            disabled={disabled}
          />
        </Field>
        <Field label="Deal Type">
          <Select
            value={local.deal_type ?? ""}
            onChange={(e) => {
              const val = (e.target.value || null) as DealType | null;
              handleChange("deal_type", val);
              onSave("deal_type", val);
            }}
            options={DEAL_TYPE_OPTIONS}
            placeholder="Select deal type"
            disabled={disabled}
          />
        </Field>
        {showPercentageField && (
          <Field label="Percentage (%)">
            <Input
              type="number"
              step="0.1"
              value={local.deal_percentage ?? ""}
              onChange={(e) =>
                handleChange(
                  "deal_percentage",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              onBlur={() => handleBlur("deal_percentage")}
              placeholder="e.g. 80"
              disabled={disabled}
            />
          </Field>
        )}
        {local.deal_type === "versus" && (
          <Field label="Versus Deal">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={local.deal_versus}
                onChange={(e) => {
                  handleChange("deal_versus", e.target.checked);
                  onSave("deal_versus", e.target.checked);
                }}
                disabled={disabled}
              />
              Higher of fee or percentage
            </label>
          </Field>
        )}
        <Field label="Expenses">
          <Input
            type="number"
            step="0.01"
            value={local.expenses ?? ""}
            onChange={(e) =>
              handleChange(
                "expenses",
                e.target.value ? Number(e.target.value) : null
              )
            }
            onBlur={() => handleBlur("expenses")}
            placeholder="0.00"
            disabled={disabled}
          />
        </Field>
        <Field label="Buyout">
          <Input
            type="number"
            step="0.01"
            value={local.buyout ?? ""}
            onChange={(e) =>
              handleChange(
                "buyout",
                e.target.value ? Number(e.target.value) : null
              )
            }
            onBlur={() => handleBlur("buyout")}
            placeholder="0.00"
            disabled={disabled}
          />
        </Field>
        <Field label="Add-ons / Additional Terms" span2>
          <Textarea
            value={local.add_ons ?? ""}
            onChange={(e) => handleChange("add_ons", e.target.value || null)}
            onBlur={() => handleBlur("add_ons")}
            placeholder="Additional deal terms..."
            rows={2}
            disabled={disabled}
          />
        </Field>
      </Section>

      <Section title="Show">
        <Field label="Billing">
          <Select
            value={local.billing ?? ""}
            onChange={(e) => {
              handleChange("billing", e.target.value || null);
              onSave("billing", e.target.value || null);
            }}
            options={BILLING_SELECT_OPTIONS}
            placeholder="Select billing"
            disabled={disabled}
          />
        </Field>
        <Field label="Set Length (mins)">
          <Input
            type="number"
            value={local.set_length ?? ""}
            onChange={(e) =>
              handleChange(
                "set_length",
                e.target.value ? Number(e.target.value) : null
              )
            }
            onBlur={() => handleBlur("set_length")}
            disabled={disabled}
          />
        </Field>
        <Field label="Set Time">
          <Input
            type="time"
            value={local.set_time ?? ""}
            onChange={(e) => handleChange("set_time", e.target.value || null)}
            onBlur={() => handleBlur("set_time")}
            disabled={disabled}
          />
        </Field>
        <Field label="Other Artists on Bill">
          <Input
            value={local.artists_booked ?? ""}
            onChange={(e) =>
              handleChange("artists_booked", e.target.value || null)
            }
            onBlur={() => handleBlur("artists_booked")}
            placeholder="e.g. Artist A, Artist B"
            disabled={disabled}
          />
        </Field>
        <Field label="Previous Artists" span2>
          <Input
            value={local.previous_artists ?? ""}
            onChange={(e) =>
              handleChange("previous_artists", e.target.value || null)
            }
            onBlur={() => handleBlur("previous_artists")}
            placeholder="Who played this slot before"
            disabled={disabled}
          />
        </Field>
      </Section>

      <Section title="Promoter">
        <Field label="Name">
          <Input
            value={local.promoter_name ?? ""}
            onChange={(e) =>
              handleChange("promoter_name", e.target.value || null)
            }
            onBlur={() => handleBlur("promoter_name")}
            disabled={disabled}
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={local.promoter_email ?? ""}
            onChange={(e) =>
              handleChange("promoter_email", e.target.value || null)
            }
            onBlur={() => handleBlur("promoter_email")}
            disabled={disabled}
          />
        </Field>
        <Field label="Company" span2>
          <Input
            value={local.promoter_company ?? ""}
            onChange={(e) =>
              handleChange("promoter_company", e.target.value || null)
            }
            onBlur={() => handleBlur("promoter_company")}
            disabled={disabled}
          />
        </Field>
      </Section>

      <Section title="Notes">
        <Field label="Notes" span2>
          <Textarea
            value={local.notes ?? ""}
            onChange={(e) => handleChange("notes", e.target.value || null)}
            onBlur={() => handleBlur("notes")}
            placeholder="Any notes about this booking..."
            rows={4}
            disabled={disabled}
          />
        </Field>
      </Section>
    </div>
  );
}
