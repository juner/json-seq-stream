import { test } from "vitest";
import { InputJsonLinesStream } from "./index.js";

test("empty", async ({ expect }) => {
  const { writable, readable } = new InputJsonLinesStream();
  await writable.close();
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(0);
});

test("enqueue with CRLF split across chunks and options", async ({ expect }) => {
  const { writable, readable } = new InputJsonLinesStream<unknown>({
    ignoreBOM: true,
    chunkEndSplit: false,
  });
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const arrayWait = Array.fromAsync(readable);
  await writer.write(encoder.encode(`{"a":1}\r`));
  await writer.write(encoder.encode(`\n0\r\nfalse\nnull\n""`));
  await writer.close();
  const array = await arrayWait;
  expect(array).toEqual([{ a: 1 }, 0, false, null, ""]);
});
