import { test } from "vitest";
import InputJsonSequenceStream from ".";

test("empty", async ({expect}) => {
  type Value = {
    value: number;
  };
  const {readable, writable} = new InputJsonSequenceStream<Value>();
  await writable.close();
  const array = await Array.fromAsync(readable.values());
  expect(array.length).toEqual(0);
}); 

test("enqueue", async ({ expect }) => {
  type Value = {
    value: number;
  };
  const sequenceStream = new InputJsonSequenceStream<Value>();
  const blob = new Blob([`\u00e1{"value":30}\n\u00e1{"value":3}`]);
  const file = new File([blob], "json-seq.json-seq",{ type: "application/json-seq" });
  const url = URL.createObjectURL(file);
  await using stack = new AsyncDisposableStack();
  stack.defer(() => URL.revokeObjectURL(url));

  const response = await fetch(url);
  if (!response.ok) expect.fail();
  const readable = response.body!.pipeThrough(sequenceStream);
  const array = await Array.fromAsync(readable.values());
  expect(array).toHaveLength(2);
  expect(array).toHaveProperty("[0].value", 30);
  expect(array).toHaveProperty("[1].value", 3);
});