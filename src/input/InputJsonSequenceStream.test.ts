import { test } from "vitest";
import { InputJsonSequenceStream, parseJsonSequence } from "./index.js";

test("empty", async ({ expect }) => {
  type Value = {
    value: number
  };
  const { readable, writable } = new InputJsonSequenceStream<Value>();
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array.length).toEqual(0);
});

test("enqueue", async ({ expect }) => {
  type Value = {
    value: number
  };
  const sequenceStream = new InputJsonSequenceStream<Value>();
  const blob = new Blob([`\u001e{"value":30}\n\u001e{"value":3}`]);
  const file = new File([blob], "json-seq.json-seq", { type: "application/json-seq" });
  const url = URL.createObjectURL(file);
  await using stack = new AsyncDisposableStack();
  stack.defer(() => URL.revokeObjectURL(url));

  const response = await fetch(url);
  if (!response.ok) expect.fail();
  const readable = response.body!.pipeThrough(sequenceStream);
  const array = await Array.fromAsync(readable.values());
  expect(array).toHaveLength(2);
  expect(array).toHaveProperty("[0].value", 30);
  expect(array).toHaveProperty("[1].value", 3);
});

test("options forwarding", async ({ expect }) => {
  const stream = new InputJsonSequenceStream<number>({
    ignoreBOM: true,
    begin: "<<",
    end: ">>",
    chunkEndSplit: false,
    fallbackSkip: true,
  });
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const arrayWait = Array.fromAsync(stream.readable.values());
  await writer.write(encoder.encode("garbage<"));
  await writer.write(encoder.encode("<0>><<1>>trailing"));
  await writer.close();
  const array = await arrayWait;
  expect(array).toEqual([0, 1]);
});

test("pretty-printed multi-line JSON and truncated record recovery", async ({ expect }) => {
  type Value = { id: number, tags?: string[] };
  const stream = new InputJsonSequenceStream<Value>();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const arrayWait = Array.fromAsync(stream.readable.values());

  await writer.write(encoder.encode(`\u001e{\n  "id": 1,\n  "tags": [\n    "a",\n    "b"\n  ]\n}\n`));
  await writer.write(encoder.encode(`\u001e{\n  "id": "truncated"\n\u001e   \n\u001e{"id": 2}\n`));
  await writer.close();

  const array = await arrayWait;
  expect(array).toEqual([
    { id: 1, tags: ["a", "b"] },
    { id: 2 },
  ]);
});

test("parseJsonSequence helper with string and binary chunks", async ({ expect }) => {
  type Value = { id: number };
  const encoder = new TextEncoder();
  async function* generate() {
    await Promise.resolve();
    yield `\u001e{"id":1}\n`;
    yield encoder.encode(`\u001e{"id":2}\n`);
  }
  const array = await Array.fromAsync(parseJsonSequence<Value>(generate()));
  expect(array).toEqual([{ id: 1 }, { id: 2 }]);
});
