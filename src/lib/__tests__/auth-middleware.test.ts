import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

import { updateSession } from "@/lib/supabase/middleware";

function makeRequest(path: string) {
  const url = new URL(path, "http://localhost:3000");
  // NextURL has a clone() method that returns a mutable copy
  const nextUrl = Object.assign(new URL(url.toString()), {
    clone() {
      return new URL(this.toString());
    },
  });
  const request = new Request(url.toString());

  const cookies = {
    getAll: () => [],
    set: vi.fn(),
  };

  return Object.assign(request, {
    nextUrl,
    cookies,
  });
}

describe("auth middleware – updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("redirects unauthenticated users to /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const request = makeRequest("/bookings");
    const response = await updateSession(request as never);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("allows unauthenticated access to /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const request = makeRequest("/login");
    const response = await updateSession(request as never);

    expect(response.status).toBe(200);
  });

  it("allows unauthenticated access to /auth/callback", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const request = makeRequest("/auth/callback");
    const response = await updateSession(request as never);

    expect(response.status).toBe(200);
  });

  it("allows authenticated users through to protected routes", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const request = makeRequest("/bookings");
    const response = await updateSession(request as never);

    expect(response.status).toBe(200);
  });

  it("redirects unauthenticated users from the root path", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const request = makeRequest("/");
    const response = await updateSession(request as never);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });
});
