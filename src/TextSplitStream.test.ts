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
  const {readable, writable } = new TextSplitStream({
    splitter,
    chunkEndSplit,
  });
  (async () => {
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
