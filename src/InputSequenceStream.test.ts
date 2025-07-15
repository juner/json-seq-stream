import { test } from "vitest";
import { InputSequenceStream } from ".";
import { LF, RS } from "./rfc7464";

test("empty", async ({expect}) => {
  const {readable, writable} = new InputSequenceStream();
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array).toHaveLength(0);
});


test("enqueue", async ({expect}) => {
  const {readable, writable} = new InputSequenceStream();
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push((async () => {
    await writer.write(`${RS}TESTTESTTEST${LF}${LF}${RS}${RS}${RS}NEKONEKO${RS}INUINU`);
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
