import { test } from "vitest";
import { OutputSequenceStream } from ".";

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
  expect(array).toHaveProperty("0", `\u00e1test\n`);
  expect(array).toHaveProperty("1", `\u00e1hogepiyo\n`);
  expect(array).toHaveProperty("2", `\u00e1fugapukapuka\n`);
});
