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

test("parseJsonLines stops cleanly on break without unhandled rejection and closes source", async ({ expect }) => {
  type Value = { a: number };
  let sourceClosed = false;
  let yieldedCount = 0;
  async function* infiniteSource() {
    try {
      while (true) {
        await Promise.resolve();
        yieldedCount++;
        yield `{"a":${yieldedCount}}\n`;
      }
    }
    finally {
      sourceClosed = true;
    }
  }
  const received: Value[] = [];
  for await (const item of parseJsonLines<Value>(infiniteSource())) {
    received.push(item);
    if (received.length >= 2) break;
  }
  expect(received).toEqual([{ a: 1 }, { a: 2 }]);
  expect(sourceClosed).toBe(true);
});

test("readableStrategy is forwarded to the parse stream", async ({ expect }) => {
  const sizes: unknown[] = [];
  const stream = new InputJsonLinesStream<{ value: number }>({
    readableStrategy: { highWaterMark: 1, size: (chunk) => {
      sizes.push(chunk);
      return 1;
    } },
  });
  const writer = stream.writable.getWriter();
  await writer.write(new TextEncoder().encode("{\"value\":1}\n"));
  await writer.close();
  // let the internal pipeline drain before reading, so enqueue uses the queue (and its size callback)
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(sizes).toEqual([{ value: 1 }]);
  expect(await Array.fromAsync(stream.readable)).toEqual([{ value: 1 }]);
});
