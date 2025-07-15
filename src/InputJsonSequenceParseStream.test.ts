import { test } from "vitest";
import { InputJsonSequenceParseStream } from ".";

test("empty", async ({ expect }) => {
  const { readable, writable } = new InputJsonSequenceParseStream();
  await writable.close();
  const array = await Array.fromAsync(readable.values())
  expect(array.length).toEqual(0);
});
test("enqueue", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const { readable, writable } = new InputJsonSequenceParseStream<Value>();
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push(writer.write(JSON.stringify({ "value": 10 })));
  promises.push(writer.write(JSON.stringify({ "value": 5 })));
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  await writer.close();
  const array = await arrayWait;
  expect(array.length).toEqual(2);
  expect(array).toHaveProperty("[0].value", 10);
  expect(array).toHaveProperty("[1].value", 5);
});

test("error to skip", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const { readable, writable } = new InputJsonSequenceParseStream<Value>();
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
    value: number;
    error?: undefined;
  } | {
    error: unknown;
  };
  const { readable, writable } = new InputJsonSequenceParseStream<Value>({
    errorFallback: async (e, { enqueue }) => {
      const {resolve, promise } = Promise.withResolvers<void>();
      queueMicrotask(resolve);
      await promise;
      enqueue({ error: e });
    }
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

test("error to error", async ({ expect, }) => {
  type Value = {
    value: number;
    error?: undefined;
  } | {
    error: unknown;
  };
  const { readable, writable } = new InputJsonSequenceParseStream<Value>({
    errorFallback: (_e, { error }) => {
      error(new Error("sample-error", {cause: [_e]}));
    }
  });
  const writer = writable.getWriter();
  async function call() {
    const promises: Promise<unknown>[] = [];
    promises.push(writer.write("{value: 10}"));
    promises.push(Array.fromAsync(readable.values()));
    promises.push(writer.close());
    await Promise.all(promises);
  }
  await expect(call()).rejects.toThrowError("sample-error");
});
