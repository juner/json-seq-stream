import { test } from "vitest";
import { OutputTextJoinLineFeedSequenceStream } from ".";
import { LF } from "./jsonlines";

test("enqueue", async ({expect})=> {
  const {readable, writable} = new OutputTextJoinLineFeedSequenceStream();
  const response = new Response(readable.pipeThrough(new TextEncoderStream()));
  (async () => {
    const writer = writable.getWriter();
    writer.write(`🐈🐶`);
    writer.write(``);
    writer.write(`🐒🐓`);
    writer.write(`🐕🐗`);
    await writer.close();
  })();
  const text = await response.text();
  expect(text).equal(`🐈🐶${LF}🐒🐓${LF}🐕🐗`);
});
