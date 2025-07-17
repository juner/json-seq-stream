import { test } from "vitest";
import { OutputRecordSequenceStream } from ".";
import { LF, RS } from "./rfc7464";

test("empty", async ({ expect }) => {
  const { response, writable } = make();
  writable.close();
  const text = await response.text();
  expect(text).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  const { response, writable } = make();

  (async () => {
    const writer = writable.getWriter();
    await writer.write("test");
    await writer.write("hogepiyo");
    await writer.write("fugapukapuka");
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal(`${RS}test${LF}${RS}hogepiyo${LF}${RS}fugapukapuka${LF}`);
});

function make(options?: ConstructorParameters<typeof OutputRecordSequenceStream>[0]) {
  const { readable, writable } = new OutputRecordSequenceStream(options);
  const response = new Response(readable.pipeThrough(new TextEncoderStream()));
  return { response, writable };
}
