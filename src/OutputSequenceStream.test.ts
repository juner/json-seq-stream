import { test } from "vitest";
import { OutputSequenceStream } from ".";
import { LF, RS } from "./rfc7464";

test("empty", async ({ expect }) => {
  const { readable, writable } = new OutputSequenceStream();
  writable.close();
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  const { readable, writable } = new OutputSequenceStream();
  const writer = writable.getWriter();
  const array = await (async () => {
    const promises: Promise<unknown>[] = [];
    promises.push(writer.write("test"));
    promises.push(writer.write("hogepiyo"));
    promises.push(writer.write("fugapukapuka"));
    promises.push(writer.close());
    const arrayWait = Array.fromAsync(readable);
    promises.push(arrayWait);
    await Promise.all(promises);
    return arrayWait;
  })();
  expect(array).toHaveLength(3);
  expect(array).toHaveProperty("0", `${RS}test${LF}`);
  expect(array).toHaveProperty("1", `${RS}hogepiyo${LF}`);
  expect(array).toHaveProperty("2", `${RS}fugapukapuka${LF}`);
});
