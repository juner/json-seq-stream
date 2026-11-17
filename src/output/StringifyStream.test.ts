import { test } from "vitest";
import { StringifyStream } from "../index.js";

test("empty", async ({ expect }) => {
  const { readable, writable } = new StringifyStream({
    stringify: () => ``,
    errorFallback: false,
  });
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array.length).toEqual(0);
});

test("empty string is enqueued", async ({ expect }) => {
  const { readable, writable } = new StringifyStream<string>({
    stringify: () => ``,
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const arrayWait = Array.fromAsync(readable.values());
  await writer.write("anything");
  await writer.close();
  const array = await arrayWait;
  expect(array).toEqual([``]);
});

test("stringify empty", async ({ expect }) => {
  type Value = {
    value: number
  };
  const { readable, writable } = new StringifyStream<Value>({
    stringify: () => undefined,
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push(writer.write({ value: 0 }));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  type Value = {
    value: number
  };
  const { readable, writable } = new StringifyStream<Value>({
    stringify: JSON.stringify,
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push(writer.write({ value: 10 }));
  promises.push(writer.write({ value: 5 }));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array).toHaveLength(2);
  expect(array).toHaveProperty("0", `{"value":10}`);
  expect(array).toHaveProperty("1", `{"value":5}`);
});

test("async stringify", async ({ expect }) => {
  type Value = { value: number };
  const { readable, writable } = new StringifyStream<Value>({
    stringify: async (v) => {
      await Promise.resolve();
      return JSON.stringify(v);
    },
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const arrayWait = Array.fromAsync(readable.values());
  await writer.write({ value: 1 });
  await writer.write({ value: 2 });
  await writer.close();
  const array = await arrayWait;
  expect(array).toEqual([`{"value":1}`, `{"value":2}`]);
});

test("error to skip", async ({ expect }) => {
  type Value = {
    value: unknown
  };
  const { readable, writable } = new StringifyStream<Value>({
    stringify: JSON.stringify,
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  const value1: Value = { value: undefined };
  const value2: Value = { value: undefined };
  value1.value = value2;
  value2.value = value1;
  promises.push(writer.write(value1));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array).toHaveLength(0);
});

test("error to enqueue", async ({ expect }) => {
  type Value = {
    value: unknown
  };
  const { readable, writable } = new StringifyStream<Value>({
    errorFallback: async (_e, { enqueue }) => {
      const { resolve, promise } = Promise.withResolvers<void>();
      queueMicrotask(resolve);
      await promise;
      enqueue(`error`);
    },
    stringify: JSON.stringify,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  const value1: Value = { value: undefined };
  const value2: Value = { value: undefined };
  value1.value = value2;
  value2.value = value1;
  promises.push(writer.write(value1));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array).toHaveLength(1);
  expect(array).toHaveProperty("0", "error");
});

test("error to error", async ({ expect }) => {
  type Value = {
    value: unknown
  };
  const errorInstance = new Error("sample-error");
  const { readable, writable } = new StringifyStream<Value>({
    errorFallback: (_e, { error }) => {
      errorInstance.cause = [_e];
      error(errorInstance);
    },
    stringify: JSON.stringify,
  });
  const writer = writable.getWriter();
  async function call() {
    const promises: Promise<unknown>[] = [];
    const value1: Value = { value: undefined };
    const value2: Value = { value: undefined };
    value1.value = value2;
    value2.value = value1;
    promises.push(writer.write(value1));
    promises.push(Array.fromAsync(readable.values()));
    promises.push(writer.close());
    await Promise.all(promises);
  }
  await expect(call()).rejects.toThrow(errorInstance);
});

test("error to reject", async ({ expect }) => {
  type Value = {
    value: unknown
  };
  const errorInstance = new Error("sample-error");
  const { readable, writable } = new StringifyStream<Value>({
    errorFallback: (_e, { error }) => {
      errorInstance.cause = [_e];
      return Promise.reject(errorInstance).finally(() => error(errorInstance));
    },
    stringify: JSON.stringify,
  });
  const writer = writable.getWriter();
  async function call() {
    const promises: Promise<unknown>[] = [];
    const value1: Value = { value: undefined };
    const value2: Value = { value: undefined };
    value1.value = value2;
    value2.value = value1;
    promises.push(writer.write(value1));
    promises.push(Array.fromAsync(readable.values()));
    promises.push(writer.close());
    await Promise.all(promises);
  }
  await expect(call()).rejects.toThrow(errorInstance);
});

test("queuing strategies are applied", async ({ expect }) => {
  const sizes: string[] = [];
  const { readable, writable } = new StringifyStream<number>({
    stringify: String,
    errorFallback: false,
    writableStrategy: { highWaterMark: 7 },
    readableStrategy: { highWaterMark: 1, size: (chunk) => {
      sizes.push(chunk);
      return 1;
    } },
  });
  const writer = writable.getWriter();
  expect(writer.desiredSize).toBe(7);
  await writer.write(1);
  expect(sizes).toEqual(["1"]);
  await writer.close();
  expect(await Array.fromAsync(readable.values())).toEqual(["1"]);
});
