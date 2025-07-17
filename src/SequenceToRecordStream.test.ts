import { test } from "vitest";
import { SequenceToRecordStream } from "./SequenceToRecordStream";

test("empty", async ({ expect }) => {
  const { writable, response } = make({
    begin: "",
    end: "",
    skip: false,
  })
  await writable.close();
  const text = await response.text();
  expect(text).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  const { response, writable } = make({
    begin: "<",
    end: ">",
    skip: true,
  });
  (async () => {
    const writer = writable.getWriter();
    await writer.write(`T`);
    await writer.write('');
    await writer.write('HOGEFUGA');
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal(`<T><HOGEFUGA>`);
});

function make(options: ConstructorParameters<typeof SequenceToRecordStream>[0]) {
  const { readable, writable } = new SequenceToRecordStream(options);
  const response = new Response(readable.pipeThrough(new TextEncoderStream()));
  return { writable, response };
}
