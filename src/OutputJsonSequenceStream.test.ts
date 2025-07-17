import { test } from "vitest";
import { OutputJsonSequenceStream } from ".";
import { LF, MIME_TYPE, RS } from "./rfc7464";

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
  expect(text).equal(`${RS}{"value":30}${LF}${RS}{"value":3}${LF}`);
});

function make<T>(options?: ConstructorParameters<typeof OutputJsonSequenceStream<T>>[0]) {
  const { readable, writable } = new OutputJsonSequenceStream(options);
  const response = new Response(readable);
  response.headers.append("content-type", MIME_TYPE);
  return { writable, response };
}
