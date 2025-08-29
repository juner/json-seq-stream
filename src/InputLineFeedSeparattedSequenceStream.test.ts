import {test} from "vitest";
import { InputLineFeedSeparattedSequenceStream } from "./InputLineFeedSeparattedSequenceStream";

test("enqueue", async ({ expect }) => {
  const { readable, writable } = new InputLineFeedSeparattedSequenceStream();
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push((async () => {
    await writer.write(`\nTESTTESTTEST\r\n\n\nNEKONEKO\nINUINU`);
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
