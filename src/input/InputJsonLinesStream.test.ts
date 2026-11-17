import { test } from "vitest";
import { InputJsonLinesStream, parseJsonLines } from "./index.js";

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

test("parseJsonLines helper with string and binary chunks", async ({ expect }) => {
  type Value = { a: number };
  const encoder = new TextEncoder();
  const chunks: (string | BufferSource)[] = [
    `{"a":1}\n`,
    encoder.encode(`{"a":2}\n`),
  ];
  const array = await Array.fromAsync(parseJsonLines<Value>(chunks));
  expect(array).toEqual([{ a: 1 }, { a: 2 }]);
});
