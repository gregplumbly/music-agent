import { describe, it, expect } from "vitest";
import { cn, slugify } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("slugify", () => {
  it("converts simple name to slug", () => {
    expect(slugify("DJ Example")).toBe("dj-example");
  });

  it("handles special characters", () => {
    expect(slugify("DJ Example!")).toBe("dj-example");
  });

  it("handles diacritics", () => {
    expect(slugify("Röyksopp & Friends")).toBe("royksopp-friends");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });

  it("collapses multiple non-alphanumeric chars", () => {
    expect(slugify("foo---bar")).toBe("foo-bar");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});
