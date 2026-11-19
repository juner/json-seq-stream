import { test } from "vitest";
import { OutputJsonSequenceStream, parseJsonSequence, stringifyJsonSequence } from "../index.js";

test("empty", async ({ expect }) => {
  type Value = {
    value: number
  };
  const { response, writable } = make<Value>();
  await writable.close();
  const text = await response.text();
  expect(text).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  type Value = {
    value: number
  };
  const { writable, response } = make<Value>();
  void (async () => {
    const writer = writable.getWriter();
    void writer.write({ value: 30 });
    void writer.write({ value: 3 });
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal(`\u001e{"value":30}\n\u001e{"value":3}\n`);
});

test("options skip", async ({ expect }) => {
  const { writable, response } = make<number | undefined>({
    begin: "<",
    end: ">",
    skip: true,
    stringify: v => (v === undefined ? "" : JSON.stringify(v)),
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write(1);
    await writer.write(undefined);
    await writer.write(2);
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal(`<1><2>`);
});

test("stringifyJsonSequence round-trip with parseJsonSequence", async ({ expect }) => {
  type Value = { id: number };
  const input: Value[] = [{ id: 1 }, { id: 2 }];
  const array = await Array.fromAsync(parseJsonSequence<Value>(stringifyJsonSequence(input)));
  expect(array).toEqual(input);
});

test("stringifyJsonSequence stops cleanly on break and closes source", async ({ expect }) => {
  type Value = { id: number };
  let sourceClosed = false;
  let id = 0;
  async function* infiniteSource(): AsyncGenerator<Value> {
    try {
      while (true) {
        await Promise.resolve();
        id++;
        yield { id };
      }
    }
    finally {
      sourceClosed = true;
    }
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of stringifyJsonSequence(infiniteSource())) {
    chunks.push(chunk);
    if (chunks.length >= 3) break;
  }
  expect(chunks.length).toBe(3);
  expect(sourceClosed).toBe(true);
});

test("stringifyJsonSequence closes source when stringify fails", async ({ expect }) => {
  let sourceClosed = false;
  async function* failingItemSource() {
    try {
      while (true) {
        await Promise.resolve();
        yield { value: 1n }; // BigInt throws in default JSON.stringify
      }
    }
    finally {
      sourceClosed = true;
    }
  }
  await expect(
    Array.fromAsync(stringifyJsonSequence(failingItemSource())),
  ).rejects.toThrow(TypeError);
  expect(sourceClosed).toBe(true);
});

function make<T>(options?: ConstructorParameters<typeof OutputJsonSequenceStream<T>>[0]) {
  const { readable, writable } = new OutputJsonSequenceStream(options);
  const response = new Response(readable);
  response.headers.append("content-type", "application/json-seq");
  return { writable, response };
}

test("writableStrategy is forwarded to the stringify stream", ({ expect }) => {
  const stream = new OutputJsonSequenceStream<{ value: number }>({
    writableStrategy: { highWaterMark: 7 },
  });
  expect(stream.writable.getWriter().desiredSize).toBe(7);
});
