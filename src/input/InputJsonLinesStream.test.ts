import { test } from "vitest";
import { InputJsonLinesStream } from "./index.js";

test("empty", async ({ expect }) => {
  const { writable, readable } = new InputJsonLinesStream();
  await writable.close();
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(0);
});
