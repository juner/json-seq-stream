import { test } from "vitest";
import { InputJsonLinesStream, OutputJsonLinesStream, parseJsonLines, stringifyJsonLines } from "../index.js";
import { MIME_TYPE } from "../jsonlines.js";

test("empty", async ({ expect }) => {
  const { writable, response } = make();
  await writable.close();
  const array = await response.text();
  expect(array).toHaveLength(0);
});

test("real-time streaming into InputJsonLinesStream before close", async ({ expect }) => {
  type Value = { id: number };
  const output = new OutputJsonLinesStream<Value>();
  const input = new InputJsonLinesStream<Value>();
  const readable = output.readable.pipeThrough(input);
  const writer = output.writable.getWriter();
  const reader = readable.getReader();

  void writer.write({ id: 1 });
  expect(await reader.read()).toEqual({ value: { id: 1 }, done: false });

  void writer.write({ id: 2 });
  expect(await reader.read()).toEqual({ value: { id: 2 }, done: false });

  await writer.close();
  expect(await reader.read()).toEqual({ value: undefined, done: true });
});

test("stringifyJsonLines round-trip with parseJsonLines", async ({ expect }) => {
  type Value = { id: number };
  const input: Value[] = [{ id: 1 }, { id: 2 }];
  const array = await Array.fromAsync(parseJsonLines<Value>(stringifyJsonLines(input)));
  expect(array).toEqual(input);
});

function make<T = unknown>(options?: ConstructorParameters<typeof OutputJsonLinesStream<T>>[0]) {
  const { writable, readable } = new OutputJsonLinesStream(options);
  const response = new Response(readable);
  response.headers.append("content-type", MIME_TYPE);
  return { writable, response };
}
