import { test } from "vitest";
import { TextJoinStream } from "./TextJoinStream";
import { JsonLinesMimeType } from "./jsonlines";

test("empty", async ({ expect }) => {
  const { readable, writable } = new TextJoinStream({
    delimiter: "",
    start: true,
    end: true,
    skip: true,
  });
  const response = new Response(readable.pipeThrough(new TextEncoderStream()));
  response.headers.append("content-type", JsonLinesMimeType);
  await writable.close();
  const text = await response.text();
  expect(text).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  const { readable, writable } = new TextJoinStream({
    delimiter: "|",
    start: false,
    end: false,
    skip: false,
  });
  const response = new Response(readable.pipeThrough(new TextEncoderStream()));
  response.headers.append("content-type", JsonLinesMimeType);
  (async () => {
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
  const { readable, writable } = new TextJoinStream({
    delimiter: "|",
    start: true,
    end: true,
    skip: true,
  });
  const response = new Response(readable.pipeThrough(new TextEncoderStream()));
  response.headers.append("content-type", JsonLinesMimeType);
  (async () => {
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
