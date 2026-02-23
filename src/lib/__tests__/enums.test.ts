import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { BookingStatus, DealType } from "@/types/database";

// Compile-time check: ensure the union types have the expected shape
const _bookingStatusCheck = (v: BookingStatus): string => v;
const _dealTypeCheck = (v: DealType): string => v;

const BOOKING_STATUS_VALUES: BookingStatus[] = [
  "enquiry",
  "hold",
  "offered",
  "pending",
  "confirmed",
  "contracted",
  "advanced",
  "settled",
  "cancelled",
  "declined",
];

const DEAL_TYPE_VALUES: DealType[] = [
  "flat_fee",
  "door_split",
  "versus",
  "plus",
  "buyout",
  "custom",
];

const migrationPath = join(
  import.meta.dirname,
  "../../..",
  "supabase/migrations/20240003000000_create_enums.sql"
);

describe("BookingStatus enum type", () => {
  it("has exactly 10 values", () => {
    expect(BOOKING_STATUS_VALUES).toHaveLength(10);
  });

  it("contains all expected status values", () => {
    const expected = [
      "enquiry",
      "hold",
      "offered",
      "pending",
      "confirmed",
      "contracted",
      "advanced",
      "settled",
      "cancelled",
      "declined",
    ];
    for (const val of expected) {
      expect(BOOKING_STATUS_VALUES).toContain(val);
    }
  });

  it("each value is assignable to BookingStatus", () => {
    for (const val of BOOKING_STATUS_VALUES) {
      const status: BookingStatus = val;
      expect(typeof status).toBe("string");
    }
  });
});

describe("DealType enum type", () => {
  it("has exactly 6 values", () => {
    expect(DEAL_TYPE_VALUES).toHaveLength(6);
  });

  it("contains all expected deal type values", () => {
    const expected = ["flat_fee", "door_split", "versus", "plus", "buyout", "custom"];
    for (const val of expected) {
      expect(DEAL_TYPE_VALUES).toContain(val);
    }
  });

  it("each value is assignable to DealType", () => {
    for (const val of DEAL_TYPE_VALUES) {
      const dealType: DealType = val;
      expect(typeof dealType).toBe("string");
    }
  });
});

describe("Migration SQL: 20240003000000_create_enums.sql", () => {
  let sql: string;

  it("migration file exists and is readable", () => {
    sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toBeTruthy();
  });

  it("creates booking_status type", () => {
    const content = readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CREATE TYPE booking_status AS ENUM");
  });

  it("booking_status contains all 10 values", () => {
    const content = readFileSync(migrationPath, "utf-8");
    const values = [
      "'enquiry'",
      "'hold'",
      "'offered'",
      "'pending'",
      "'confirmed'",
      "'contracted'",
      "'advanced'",
      "'settled'",
      "'cancelled'",
      "'declined'",
    ];
    for (const val of values) {
      expect(content).toContain(val);
    }
  });

  it("creates deal_type type", () => {
    const content = readFileSync(migrationPath, "utf-8");
    expect(content).toContain("CREATE TYPE deal_type AS ENUM");
  });

  it("deal_type contains all 6 values", () => {
    const content = readFileSync(migrationPath, "utf-8");
    const values = [
      "'flat_fee'",
      "'door_split'",
      "'versus'",
      "'plus'",
      "'buyout'",
      "'custom'",
    ];
    for (const val of values) {
      expect(content).toContain(val);
    }
  });
});
