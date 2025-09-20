import { test } from "vitest";
import { OutputJsonLinesStream } from "./index.js";
import { MIME_TYPE } from "./jsonlines.js";

test("empty", async ({ expect }) => {
  const { writable, response } = make();
  await writable.close();
  const array = await response.text();
  expect(array).toHaveLength(0);
});

function make<T = unknown>(options?: ConstructorParameters<typeof OutputJsonLinesStream<T>>[0]) {
  const { writable, readable } = new OutputJsonLinesStream(options);
  const response = new Response(readable);
  response.headers.append("content-type", MIME_TYPE);
  return { writable, response };
}
