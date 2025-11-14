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

test("stringify empty", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const { readable, writable } = new StringifyStream<Value>({
    stringify: () => undefined,
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push(writer.write({ "value": 0 }));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const { readable, writable } = new StringifyStream<Value>({
    stringify: JSON.stringify,
    errorFallback: false,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push(writer.write({ "value": 10 }));
  promises.push(writer.write({ "value": 5 }));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array).toHaveLength(2);
  expect(array).toHaveProperty("0", `{"value":10}`);
  expect(array).toHaveProperty("1", `{"value":5}`);
});

test("error to skip", async ({ expect }) => {
  type Value = {
    value: unknown;
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
    value: unknown;
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

test("error to error", async ({ expect, }) => {
  type Value = {
    value: unknown;
  };
  const { readable, writable } = new StringifyStream<Value>({
    errorFallback: (_e, { error }) => {
      error(new Error("sample-error", { cause: [_e] }));
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
  await expect(call()).rejects.toThrowError("sample-error");
});
