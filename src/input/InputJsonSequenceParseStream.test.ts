import { test, vi } from "vitest";
import { InputJsonSequenceParseStream } from "./index.js";

test("empty", async ({ expect }) => {
  const { readable, writable } = new InputJsonSequenceParseStream();
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array.length).toEqual(0);
});
test("enqueue", async ({ expect }) => {
  type Value = {
    value: number
  };
  const { readable, writable } = new InputJsonSequenceParseStream<Value>();
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push(writer.write(JSON.stringify({ value: 10 })));
  promises.push(writer.write(JSON.stringify({ value: 5 })));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array.length).toEqual(2);
  expect(array).toHaveProperty("[0].value", 10);
  expect(array).toHaveProperty("[1].value", 5);
});

test("ignore whitespace-only chunks without error", async ({ expect }) => {
  type Value = { value: number };
  let errorCalled = false;
  const { readable, writable } = new InputJsonSequenceParseStream<Value>({
    errorFallback: () => {
      errorCalled = true;
    },
  });
  const writer = writable.getWriter();
  const arrayWait = Array.fromAsync(readable.values());
  await writer.write("");
  await writer.write("   ");
  await writer.write("\t\r\n");
  await writer.write(JSON.stringify({ value: 42 }));
  await writer.close();
  const array = await arrayWait;
  expect(errorCalled).toBe(false);
  expect(array).toEqual([{ value: 42 }]);
});

test("default errorFallback skips the record and warns", async ({ expect }) => {
  type Value = {
    value: number
  };
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  try {
    const { readable, writable } = new InputJsonSequenceParseStream<Value>();
    const writer = writable.getWriter();
    const promises: Promise<unknown>[] = [];
    promises.push(writer.write("{value: 10}"));
    const arrayWait = Array.fromAsync(readable.values());
    promises.push(arrayWait);
    await writer.close();
    const array = await arrayWait;
    expect(array).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  }
  finally {
    warnSpy.mockRestore();
  }
});

test("errorFallback: false skips the record silently", async ({ expect }) => {
  type Value = {
    value: number
  };
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  try {
    const { readable, writable } = new InputJsonSequenceParseStream<Value>({ errorFallback: false });
    const writer = writable.getWriter();
    const promises: Promise<unknown>[] = [];
    promises.push(writer.write("{value: 10}"));
    const arrayWait = Array.fromAsync(readable.values());
    promises.push(arrayWait);
    await writer.close();
    const array = await arrayWait;
    expect(array).toHaveLength(0);
    expect(warnSpy).not.toHaveBeenCalled();
  }
  finally {
    warnSpy.mockRestore();
  }
});

test("error to enqueue", async ({ expect }) => {
  type Value = {
    value: number
    error?: undefined
  } | {
    error: unknown
  };
  const { readable, writable } = new InputJsonSequenceParseStream<Value>({
    errorFallback: async (e, { enqueue }) => {
      const { resolve, promise } = Promise.withResolvers<void>();
      queueMicrotask(resolve);
      await promise;
      enqueue({ error: e });
    },
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push(writer.write("{value: 10}"));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array).toHaveLength(1);
  expect(array[0]?.error).toBeDefined();
});

test("error to error", async ({ expect }) => {
  type Value = {
    value: number
    error?: undefined
  } | {
    error: unknown
  };
  const errorInstance = new Error("sample-error");
  const { readable, writable } = new InputJsonSequenceParseStream<Value>({
    errorFallback: (_e, { error }) => {
      errorInstance.cause = [_e];
      error(errorInstance);
    },
  });
  const writer = writable.getWriter();
  async function call() {
    const promises: Promise<unknown>[] = [];
    promises.push(writer.write("{value: 10}"));
    promises.push(Array.fromAsync(readable.values()));
    promises.push(writer.close());
    await Promise.all(promises);
  }
  await expect(call()).rejects.toThrow(errorInstance);
});

test("queuing strategies are forwarded", ({ expect }) => {
  const { writable } = new InputJsonSequenceParseStream({
    writableStrategy: { highWaterMark: 7 },
  });
  expect(writable.getWriter().desiredSize).toBe(7);
});
