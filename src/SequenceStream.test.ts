import { test } from "vitest";
import { SequenceStream } from ".";

test("empty", async ({expect}) => {
  const {readable, writable} = new SequenceStream();
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array).toHaveLength(0);
});


test("enqueue", async ({expect}) => {
  const {readable, writable} = new SequenceStream();
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push((async () => {
    await writer.write(`\u00e1TESTTESTTEST\n\n\u00e1\u00e1\u00e1NEKONEKO\u00e1INUINU`);
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