import { test } from "vitest";
import { OutputTextJoinLineFeedSequenceStream } from "../index.js";

test("enqueue", async ({ expect }) => {
  const { readable, writable } = new OutputTextJoinLineFeedSequenceStream();
  const response = new Response(readable.pipeThrough(new TextEncoderStream()));
  void (async () => {
    const writer = writable.getWriter();
    void writer.write(`🐈🐶`);
    void writer.write(``);
    void writer.write(`🐒🐓`);
    void writer.write(`🐕🐗`);
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal(`🐈🐶\n🐒🐓\n🐕🐗`);
});

test("queuing strategies are forwarded", ({ expect }) => {
  const { writable } = new OutputTextJoinLineFeedSequenceStream({
    writableStrategy: { highWaterMark: 7 },
  });
  expect(writable.getWriter().desiredSize).toBe(7);
});
