import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";
import { getAvailableTransitions, shouldAutoLock } from "@/lib/status";
import type { BookingStatus } from "@/types/database";

describe("getAvailableTransitions", () => {
  it("returns all statuses except current when not locked", () => {
    const transitions = getAvailableTransitions("enquiry", false);
    expect(transitions).not.toContain("enquiry");
    expect(transitions).toContain("hold");
    expect(transitions).toContain("offered");
    expect(transitions).toContain("contracted");
    expect(transitions).toContain("cancelled");
    expect(transitions).toContain("declined");
  });

  it("returns empty array when locked", () => {
    const transitions = getAvailableTransitions("contracted", true);
    expect(transitions).toEqual([]);
  });

  it("includes cancelled and declined from any status", () => {
    const statuses: BookingStatus[] = [
      "enquiry",
      "hold",
      "offered",
      "pending",
      "confirmed",
      "contracted",
      "advanced",
      "settled",
    ];
    for (const status of statuses) {
      const transitions = getAvailableTransitions(status, false);
      expect(transitions).toContain("cancelled");
      expect(transitions).toContain("declined");
    }
  });

  it("allows backward transitions", () => {
    const transitions = getAvailableTransitions("confirmed", false);
    expect(transitions).toContain("enquiry");
    expect(transitions).toContain("hold");
  });
});

describe("shouldAutoLock", () => {
  it("returns true for contracted", () => {
    expect(shouldAutoLock("contracted")).toBe(true);
  });

  it("returns true for advanced", () => {
    expect(shouldAutoLock("advanced")).toBe(true);
  });

  it("returns true for settled", () => {
    expect(shouldAutoLock("settled")).toBe(true);
  });

  it("returns false for enquiry", () => {
    expect(shouldAutoLock("enquiry")).toBe(false);
  });

  it("returns false for confirmed", () => {
    expect(shouldAutoLock("confirmed")).toBe(false);
  });

  it("returns false for cancelled", () => {
    expect(shouldAutoLock("cancelled")).toBe(false);
  });
});

// DAL tests with mocked Supabase
vi.mock("@/lib/supabase", () => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue(chain),
      _chain: chain,
    },
  };
});

import { changeBookingStatus, getStatusHistory, unlockBooking } from "@/lib/status";
import { supabase } from "@/lib/supabase";

const getChain = () =>
  (supabase as unknown as { _chain: Record<string, MockInstance> })._chain;

beforeEach(() => {
  vi.clearAllMocks();
  (supabase.from as unknown as MockInstance).mockReturnValue(getChain());
  const chain = getChain();
  chain.select.mockReturnValue(chain);
  chain.insert.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
});

describe("changeBookingStatus", () => {
  it("updates booking status and creates log entry", async () => {
    const chain = getChain();
    // update call
    chain.eq.mockResolvedValueOnce({ error: null });
    // insert log call - need to reset from() for second call
    (supabase.from as unknown as MockInstance).mockReturnValue(chain);
    chain.insert.mockResolvedValueOnce({ error: null });

    const result = await changeBookingStatus(
      "booking-1",
      "enquiry",
      "offered",
      "Sent to promoter"
    );

    expect(result.status).toBe("offered");
    expect(result.status_locked).toBe(false);
  });

  it("auto-locks when transitioning to contracted", async () => {
    const chain = getChain();
    chain.eq.mockResolvedValueOnce({ error: null });
    (supabase.from as unknown as MockInstance).mockReturnValue(chain);
    chain.insert.mockResolvedValueOnce({ error: null });

    const result = await changeBookingStatus(
      "booking-1",
      "confirmed",
      "contracted"
    );

    expect(result.status).toBe("contracted");
    expect(result.status_locked).toBe(true);
  });

  it("auto-locks for advanced and settled too", async () => {
    for (const status of ["advanced", "settled"] as BookingStatus[]) {
      vi.clearAllMocks();
      (supabase.from as unknown as MockInstance).mockReturnValue(getChain());
      const chain = getChain();
      chain.update.mockReturnValue(chain);
      chain.eq.mockResolvedValueOnce({ error: null });
      chain.insert.mockResolvedValueOnce({ error: null });

      const result = await changeBookingStatus(
        "booking-1",
        "contracted",
        status
      );
      expect(result.status_locked).toBe(true);
    }
  });
});

describe("getStatusHistory", () => {
  it("returns status log entries ordered by changed_at desc", async () => {
    const chain = getChain();
    const logEntries = [
      {
        id: "log-2",
        booking_id: "booking-1",
        from_status: "offered",
        to_status: "confirmed",
        changed_at: "2026-02-01T00:00:00Z",
        note: null,
      },
      {
        id: "log-1",
        booking_id: "booking-1",
        from_status: "enquiry",
        to_status: "offered",
        changed_at: "2026-01-15T00:00:00Z",
        note: "Initial offer",
      },
    ];
    chain.order.mockResolvedValueOnce({ data: logEntries, error: null });

    const result = await getStatusHistory("booking-1");
    expect(result).toHaveLength(2);
    expect(result[0].to_status).toBe("confirmed");
  });
});

describe("unlockBooking", () => {
  it("sets status_locked to false", async () => {
    const chain = getChain();
    chain.eq.mockResolvedValueOnce({ error: null });

    await expect(unlockBooking("booking-1")).resolves.toBeUndefined();
    expect(chain.update).toHaveBeenCalledWith({ status_locked: false });
  });
});
