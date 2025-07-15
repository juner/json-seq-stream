import { test } from "vitest";
import { OutputJsonSequenceStream } from ".";
import { LF, RS } from "./rfc7464";

test("empty", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const { readable, writable } = new OutputJsonSequenceStream<Value>();
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array.length).toEqual(0);
});

test("enqueue", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const sequenceStream = new OutputJsonSequenceStream<Value>();
  const writer = sequenceStream.writable.getWriter();
  writer.write({value: 30});
  writer.write({value: 3});
  await writer.close();
  const blob = await new Response(sequenceStream.readable).blob();
  const file = new File([blob], "json-seq.json-seq", { type: "application/json-seq" });
  const url = URL.createObjectURL(file);
  await using stack = new AsyncDisposableStack();
  stack.defer(() => URL.revokeObjectURL(url));

  const response = await fetch(url);
  if (!response.ok) expect.fail();
  const text = await response.text();
  expect(text).equal(`${RS}{"value":30}${LF}${RS}{"value":3}${LF}`);
});
