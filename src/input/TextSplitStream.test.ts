import { test } from "vitest";
import { TextSplitStream } from "./index.js";

test("empty", async ({ expect }) => {
  const { readable, writable } = new TextSplitStream({
    splitter: "",
    chunkEndSplit: false,
  });
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  const splitter = "改行";
  const chunkEndSplit = true;
  const { readable, writable } = new TextSplitStream({
    splitter,
    chunkEndSplit,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write(`${splitter}猫猫${splitter}犬犬`);
    await writer.write(`鳥鳥${splitter}猿猿${splitter}`);
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(4);
  expect(array).toHaveProperty("0", "猫猫");
  expect(array).toHaveProperty("1", "犬犬");
  expect(array).toHaveProperty("2", "鳥鳥");
  expect(array).toHaveProperty("3", "猿猿");
});

test("multi-char splitter across chunk boundary", async ({ expect }) => {
  const { readable, writable } = new TextSplitStream({
    splitter: ["-", "--"],
    chunkEndSplit: false,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write("a--b-");
    await writer.write("-c-d");
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toEqual(["a", "b", "c", "d"]);
});

test("regex special character splitter is treated literally", async ({ expect }) => {
  const { readable, writable } = new TextSplitStream({
    splitter: ["|", ".*"],
    chunkEndSplit: false,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write("foo|bar.*baz");
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toEqual(["foo", "bar", "baz"]);
});

test("maxLength exceeded throws RangeError", async ({ expect }) => {
  const { readable, writable } = new TextSplitStream({
    splitter: "\n",
    chunkEndSplit: false,
    maxLength: 5,
  });
  const writer = writable.getWriter();
  async function call() {
    const promises: Promise<unknown>[] = [];
    promises.push(writer.write("12345\n123456\n"));
    promises.push(Array.fromAsync(readable));
    promises.push(writer.close());
    await Promise.all(promises);
  }
  await expect(call()).rejects.toThrow(RangeError);
});

test("queuing strategies are applied", ({ expect }) => {
  const { writable } = new TextSplitStream({
    splitter: "\n",
    chunkEndSplit: false,
    writableStrategy: { highWaterMark: 7 },
  });
  expect(writable.getWriter().desiredSize).toBe(7);
});
