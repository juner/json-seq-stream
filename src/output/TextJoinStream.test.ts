import { test } from "vitest";
import { TextJoinStream } from "./TextJoinStream.js";

test("empty", async ({ expect }) => {
  const { response, writable } = make({
    delimiter: "",
    start: true,
    end: true,
    skip: true,
  });
  await writable.close();
  const text = await response.text();
  expect(text).toHaveLength(0);
});

test("add empty start / end delimiter", async ({ expect }) => {
  const { response, writable } = make({
    delimiter: ",",
    start: true,
    end: true,
    skip: false,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write("");
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal(",,");
});

test("enqueue", async ({ expect }) => {
  const { response, writable } = make({
    delimiter: "|",
    start: false,
    end: false,
    skip: false,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write("鶏");
    await writer.write("猫");
    await writer.write("犬");
    await writer.write("驢馬");
    await writer.write("");
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal("鶏|猫|犬|驢馬|");
});

test("enqueue and start / end delimiter", async ({ expect }) => {
  const { writable, response } = make({
    delimiter: "|",
    start: true,
    end: true,
    skip: true,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write("鶏");
    await writer.write("猫");
    await writer.write("犬");
    await writer.write("");
    await writer.write("驢馬");
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal("|鶏|猫|犬|驢馬|");
});

test("real-time delimiter emission before close when end:true", async ({ expect }) => {
  const { readable, writable } = new TextJoinStream({
    delimiter: "\n",
    start: false,
    end: true,
    skip: true,
  });
  const writer = writable.getWriter();
  const reader = readable.getReader();

  void writer.write("first");
  expect(await reader.read()).toEqual({ value: "first", done: false });
  expect(await reader.read()).toEqual({ value: "\n", done: false });

  void writer.write("second");
  expect(await reader.read()).toEqual({ value: "second", done: false });
  expect(await reader.read()).toEqual({ value: "\n", done: false });

  await writer.close();
  expect(await reader.read()).toEqual({ value: undefined, done: true });
});

function make(options: ConstructorParameters<typeof TextJoinStream>[0]) {
  const { readable, writable } = new TextJoinStream(options);
  const response = new Response(readable.pipeThrough(new TextEncoderStream()));
  return { writable, response };
}
