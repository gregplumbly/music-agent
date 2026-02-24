import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DealMemoLink, DealMemoLinkStatus, Database } from "../../types/database";

const MIGRATION_PATH = join(
  import.meta.dirname,
  "../../..",
  "supabase/migrations/20240006000000_create_deal_memo_links.sql"
);

const sql = readFileSync(MIGRATION_PATH, "utf-8");

// ──────────────────────────────────────────────
// TypeScript compile-time checks
// ──────────────────────────────────────────────

// All 4 DealMemoLinkStatus values must be assignable to the type
const _allStatuses: DealMemoLinkStatus[] = ["sent", "viewed", "submitted", "expired"];

// DealMemoLink shape satisfies check — compile error if fields are missing/wrong
const _sampleDealMemoLink = {
  id: "uuid-1",
  booking_id: "uuid-2",
  token: "abc123token",
  status: "sent" as DealMemoLinkStatus,
  submitted_data: null,
  created_at: "2024-01-01T00:00:00Z",
  expires_at: null,
} satisfies DealMemoLink;

// Database type includes deal_memo_links
type DealMemoLinksRow = Database["public"]["Tables"]["deal_memo_links"]["Row"];
const _row: DealMemoLinksRow = _sampleDealMemoLink;

// ──────────────────────────────────────────────
// Runtime type shape tests
// ──────────────────────────────────────────────

describe("DealMemoLinkStatus", () => {
  it("has all 4 status values", () => {
    expect(_allStatuses).toEqual(["sent", "viewed", "submitted", "expired"]);
  });

  it("includes 'sent'", () => expect(_allStatuses).toContain("sent"));
  it("includes 'viewed'", () => expect(_allStatuses).toContain("viewed"));
  it("includes 'submitted'", () => expect(_allStatuses).toContain("submitted"));
  it("includes 'expired'", () => expect(_allStatuses).toContain("expired"));
});

describe("DealMemoLink interface", () => {
  it("has id property", () => expect(_sampleDealMemoLink).toHaveProperty("id"));
  it("has booking_id property", () => expect(_sampleDealMemoLink).toHaveProperty("booking_id"));
  it("has token property", () => expect(_sampleDealMemoLink).toHaveProperty("token"));
  it("has status property", () => expect(_sampleDealMemoLink).toHaveProperty("status"));
  it("has submitted_data property (nullable)", () => expect(_sampleDealMemoLink.submitted_data).toBeNull());
  it("has created_at property", () => expect(_sampleDealMemoLink).toHaveProperty("created_at"));
  it("has expires_at property (nullable)", () => expect(_sampleDealMemoLink.expires_at).toBeNull());

  it("status defaults to 'sent' sample", () => {
    expect(_sampleDealMemoLink.status).toBe("sent");
  });

  it("Database Row type matches DealMemoLink shape", () => {
    const row: DealMemoLinksRow = _sampleDealMemoLink;
    expect(row.id).toBe("uuid-1");
    expect(row.booking_id).toBe("uuid-2");
    expect(row.token).toBe("abc123token");
  });
});

// ──────────────────────────────────────────────
// Migration SQL content checks
// ──────────────────────────────────────────────

describe("deal_memo_links migration SQL", () => {
  it("defines deal_memo_link_status enum", () => {
    expect(sql).toContain("CREATE TYPE deal_memo_link_status AS ENUM");
  });

  it("enum includes 'sent'", () => expect(sql).toContain("'sent'"));
  it("enum includes 'viewed'", () => expect(sql).toContain("'viewed'"));
  it("enum includes 'submitted'", () => expect(sql).toContain("'submitted'"));
  it("enum includes 'expired'", () => expect(sql).toContain("'expired'"));

  it("creates deal_memo_links table", () => {
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS deal_memo_links");
  });

  it("has FK to bookings(id) ON DELETE CASCADE", () => {
    expect(sql).toMatch(/REFERENCES bookings\(id\)\s+ON DELETE CASCADE/);
  });

  it("token column has UNIQUE constraint", () => {
    expect(sql).toMatch(/token\s+text\s+UNIQUE NOT NULL/);
  });

  it("submitted_data is jsonb (nullable — no NOT NULL)", () => {
    expect(sql).toContain("submitted_data  jsonb");
    // nullable — should NOT have 'submitted_data ... NOT NULL'
    expect(sql).not.toMatch(/submitted_data\s+jsonb\s+NOT NULL/);
  });

  it("has index on booking_id", () => {
    expect(sql).toContain("deal_memo_links_booking_id_idx");
  });

  it("has unique index on token", () => {
    expect(sql).toContain("CREATE UNIQUE INDEX");
    expect(sql).toContain("deal_memo_links_token_idx");
  });

  it("enables RLS", () => {
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
  });

  it("has open allow_all policy", () => {
    expect(sql).toContain("CREATE POLICY allow_all ON deal_memo_links");
    expect(sql).toContain("USING (true)");
    expect(sql).toContain("WITH CHECK (true)");
  });
});
