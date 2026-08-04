import { describe, expect, it } from "vitest";
import {
  formatBackendDateTime,
  isAdminRole,
  orderTransitions,
  parseBackendDateTime,
  parseCurrencyInput,
  purchaseOrderTransitions,
  resolveImageUrl,
  stockMovementSign,
  toBackendDateTime,
} from "./utils";

describe("backend date time", () => {
  it("parses the explicit backend format without browser-dependent parsing", () => {
    const result = parseBackendDateTime("04-08-2026 12:30:00");
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(7);
    expect(result?.getDate()).toBe(4);
  });

  it("rejects impossible or ISO dates", () => {
    expect(parseBackendDateTime("31-02-2026 12:30:00")).toBeNull();
    expect(parseBackendDateTime("2026-08-04T12:30:00Z")).toBeNull();
  });

  it("formats a valid backend value and produces the backend shape", () => {
    expect(formatBackendDateTime(null)).toBe("—");
    expect(toBackendDateTime(new Date(2026, 7, 4, 12, 30, 0))).toMatch(/^04-08-2026 \d{2}:30:00$/);
  });
});

describe("money and stock helpers", () => {
  it("parses VND input without punctuation or currency symbol", () => {
    expect(parseCurrencyInput("12.500.000 ₫")).toBe(12_500_000);
    expect(parseCurrencyInput("")).toBeNull();
  });

  it("maps outbound movements to a negative sign", () => {
    expect(stockMovementSign("DAMAGE_OUT")).toBe(-1);
    expect(stockMovementSign("ADJUSTMENT_IN")).toBe(1);
    expect(stockMovementSign("OTHER")).toBe(1);
  });
});

describe("security and workflow helpers", () => {
  it("accepts only an admin role", () => {
    expect(isAdminRole(["ROLE_ADMIN"])).toBe(true);
    expect(isAdminRole(["CUSTOMER"])).toBe(false);
  });

  it("keeps terminal transitions closed", () => {
    expect(orderTransitions.REFUNDED).toEqual([]);
    expect(orderTransitions.CANCELLED).toEqual([]);
    expect(purchaseOrderTransitions.RECEIVED).toEqual([]);
  });

  it("resolves only relative image URLs against the backend", () => {
    expect(resolveImageUrl("/uploads/a.jpg", "http://localhost:8080")).toBe("http://localhost:8080/uploads/a.jpg");
    expect(resolveImageUrl("https://cdn.example/a.jpg", "http://localhost:8080")).toBe("https://cdn.example/a.jpg");
    expect(resolveImageUrl("blob:test", "http://localhost:8080")).toBe("blob:test");
  });
});
