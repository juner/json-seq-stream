import { test } from "vitest";
import { RecordToSequenceStream } from "../index.js";

test("empty", async ({ expect }) => {
  const { readable, writable } = new RecordToSequenceStream({
    begin: "<",
    end: ">",
    chunkEndSplit: false,
    fallbackSkip: false,
  });
  await writable.close();
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(0);
});

test("enqueue", async ({ expect }) => {
  const BEGIN = "<";
  const END = ">";
  const { readable, writable } = new RecordToSequenceStream({
    begin: BEGIN,
    end: END,
    chunkEndSplit: true,
    fallbackSkip: true,
  });
  (async () => {
    const writer = writable.getWriter();
    await writer.write("<123>456<789");
    await writer.write("012><345><678");
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(2);
});

test("enqueue fallbackSkip", async ({ expect }) => {
  const BEGIN = "|";
  const END = "";
  const { readable, writable } = new RecordToSequenceStream({
    begin: BEGIN,
    end: END,
    chunkEndSplit: false,
    fallbackSkip: (_1,_2,next) => next === "begin" || next === "record",
  });
  (async () => {
    const writer = writable.getWriter();
    await writer.write("|123|456|789");
    await writer.write("012|345|678");
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(5);
});


test("enqueue chunkEndSplit:false", async ({ expect }) => {
  const BEGIN = "<<";
  const END = ">>";
  const { readable, writable } = new RecordToSequenceStream({
    begin: BEGIN,
    end: END,
    chunkEndSplit: false,
    fallbackSkip: false,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push((async () => {
    await writer.write(`${BEGIN}TESTTESTTEST${END}${END}${BEGIN}${BEGIN}${BEGIN}NEKONEKO${BEGIN}INUINU>`);
    await writer.write(`>UOUO`);
    await writer.close();
  })());
  const arrayWait = Array.fromAsync(readable);
  promises.push(arrayWait);
  const array = await arrayWait;
  expect(array).toHaveLength(4);
  expect(array).toHaveProperty("[0]", "TESTTESTTEST");
  expect(array).toHaveProperty("[1]", "NEKONEKO");
  expect(array).toHaveProperty("[2]", "INUINU");
  expect(array).toHaveProperty("[3]", "UOUO");
});

test("enqueue chunkEndSplit:true", async ({ expect }) => {
  const BEGIN = "<<";
  const END = ">>";
  const { readable, writable } = new RecordToSequenceStream({
    begin: BEGIN,
    end: END,
    chunkEndSplit: true,
    fallbackSkip: false,
  });
  const writer = writable.getWriter();
  const promises: Promise<unknown>[] = [];
  promises.push((async () => {
    await writer.write(`${BEGIN}TESTTESTTEST${END}${END}${BEGIN}${BEGIN}${BEGIN}NEKONEKO${BEGIN}INUINU>`);
    await writer.write(`>UOUO`);
    await writer.close();
  })());
  const arrayWait = Array.fromAsync(readable);
  promises.push(arrayWait);
  const array = await arrayWait;
  expect(array).toHaveLength(4);
  expect(array).toHaveProperty("[0]", "TESTTESTTEST");
  expect(array).toHaveProperty("[1]", "NEKONEKO");
  expect(array).toHaveProperty("[2]", "INUINU>");
  expect(array).toHaveProperty("[3]", ">UOUO");
});
