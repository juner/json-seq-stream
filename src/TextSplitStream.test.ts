import { test } from "vitest";
import { InputLineFeedSeparattedSequenceStream, TextSplitStream } from ".";
import { LF, CRLF } from "./jsonlines";

test("empty", async ({ expect }) => {
  const { readable, writable } = new InputLineFeedSeparattedSequenceStream();
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  const { readable, writable } = new InputLineFeedSeparattedSequenceStream();
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push((async () => {
    await writer.write(`${LF}TESTTESTTEST${CRLF}${LF}${LF}NEKONEKO${LF}INUINU`);
    await writer.close();
  })());
  const arrayWait = Array.fromAsync(readable.values());
  promises.push(arrayWait);
  const array = await arrayWait;
  expect(array).toHaveLength(3);
  expect(array).toHaveProperty("[0]", "TESTTESTTEST");
  expect(array).toHaveProperty("[1]", "NEKONEKO");
  expect(array).toHaveProperty("[2]", "INUINU");
});

test("custom", async ({ expect }) => {
  const separator = "改行";
  const chunkEndSplit = true;
  const {readable, writable } = new TextSplitStream({
    separator,
    chunkEndSplit,
  });
  const promises: Promise<unknown>[] = [];
  promises.push((async () => {
    const writer = writable.getWriter();
    await writer.write(`${separator}猫猫${separator}犬犬`);
    await writer.write(`鳥鳥${separator}猿猿${separator}`);
    await writer.close();
  })());
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(4);
  expect(array).toHaveProperty("0", "猫猫");
  expect(array).toHaveProperty("1", "犬犬");
  expect(array).toHaveProperty("2", "鳥鳥");
  expect(array).toHaveProperty("3", "猿猿");
});
