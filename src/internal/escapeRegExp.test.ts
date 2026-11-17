import { test } from "vitest";
import { escapeRegExp } from "./escapeRegExp.js";

test("escapes all regex syntax characters", ({ expect }) => {
  const special = String.raw`\^$.*+?()[]{}|`;
  const escaped = escapeRegExp(special);
  const regexp = new RegExp(`^(${escaped})$`, "u");
  expect(regexp.test(special)).toBe(true);
  expect(regexp.test("anything-else")).toBe(false);
});

test("keeps non-special characters as-is", ({ expect }) => {
  expect(escapeRegExp("abc-123_\u001e\n")).toBe("abc-123_\u001e\n");
});
