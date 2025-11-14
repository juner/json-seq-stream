import { test } from "vitest";
import { OutputJsonSequenceStream } from "../index.js";

test("empty", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const { response, writable } = make<Value>();
  await writable.close();
  const text = await response.text();
  expect(text).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const { writable, response } = make<Value>();
  (async () => {
    const writer = writable.getWriter();
    writer.write({ value: 30 });
    writer.write({ value: 3 });
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal(`\u001e{"value":30}\n\u001e{"value":3}\n`);
});

function make<T>(options?: ConstructorParameters<typeof OutputJsonSequenceStream<T>>[0]) {
  const { readable, writable } = new OutputJsonSequenceStream(options);
  const response = new Response(readable);
  response.headers.append("content-type", "application/json-seq");
  return { writable, response };
}
