import { test } from "vitest";
import { ParseStream } from "../index.js";

test("empty", async ({ expect }) => {
  const { readable, writable } = new ParseStream({
    parse: () => ``,
    errorFallback: false,
  });
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array.length).toEqual(0);
});

test("enqueue", async ({ expect }) => {
  type Value = {
    value: number
  };
  const { readable, writable } = new ParseStream<Value>({
    parse: JSON.parse,
    errorFallback: false,
  });
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

test("enqueue falsy values and skip undefined", async ({ expect }) => {
  const { readable, writable } = new ParseStream<unknown>({
    parse: text => (text === "UNDEFINED" ? undefined : JSON.parse(text) as unknown),
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const arrayWait = Array.fromAsync(readable.values());
  await writer.write("0");
  await writer.write("false");
  await writer.write("null");
  await writer.write(`""`);
  await writer.write("UNDEFINED");
  await writer.close();
  const array = await arrayWait;
  expect(array).toEqual([0, false, null, ""]);
});

test("async parse", async ({ expect }) => {
  type Value = { value: number };
  const { readable, writable } = new ParseStream<Value>({
    parse: async (text) => {
      await Promise.resolve();
      return JSON.parse(text) as Value;
    },
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const arrayWait = Array.fromAsync(readable.values());
  await writer.write(JSON.stringify({ value: 1 }));
  await writer.write(JSON.stringify({ value: 2 }));
  await writer.close();
  const array = await arrayWait;
  expect(array).toEqual([{ value: 1 }, { value: 2 }]);
});

test("error to skip", async ({ expect }) => {
  type Value = {
    value: number
  };
  const { readable, writable } = new ParseStream<Value>({
    parse: JSON.parse,
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push(writer.write("{value: 10}"));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array).toHaveLength(0);
});

test("error to enqueue", async ({ expect }) => {
  type Value = {
    value: number
    error?: undefined
  } | {
    error: unknown
  };
  const { readable, writable } = new ParseStream<Value>({
    parse: JSON.parse,
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
  const { readable, writable } = new ParseStream<Value>({
    parse: JSON.parse,
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

test("error to reject", async ({ expect }) => {
  type Value = {
    value: number
    error?: undefined
  } | {
    error: unknown
  };
  const errorInstance = new Error("sample-error");
  const { readable, writable } = new ParseStream<Value>({
    parse: JSON.parse,
    errorFallback: (_e, { error }) => {
      errorInstance.cause = [_e];
      return Promise.reject(errorInstance).finally(() => error(errorInstance));
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
