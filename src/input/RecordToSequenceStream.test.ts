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
  void (async () => {
    const writer = writable.getWriter();
    await writer.write("<123>456<789");
    await writer.write("012><345><678");
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toHaveLength(2);
  expect(array).toEqual(["123", "345"]);
});

test("enqueue fallbackSkip", async ({ expect }) => {
  const BEGIN = "|";
  const END = "";
  const { readable, writable } = new RecordToSequenceStream({
    begin: BEGIN,
    end: END,
    chunkEndSplit: false,
    fallbackSkip: (_1, _2, next) => next === "begin" || next === "record",
  });
  void (async () => {
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

test("multi-char begin/end split across chunks with fallbackSkip:true", async ({ expect }) => {
  const { readable, writable } = new RecordToSequenceStream({
    begin: "<<",
    end: ">>",
    chunkEndSplit: false,
    fallbackSkip: true,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write("garbage<");
    await writer.write("<123>");
    await writer.write("><<unclosed<<456>><");
    await writer.write("<789>><");
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toEqual(["123", "456", "789"]);
});

test("multi-line JSON and truncated JSON recovery", async ({ expect }) => {
  const { readable, writable } = new RecordToSequenceStream({
    begin: "\u001e",
    end: "\n",
    chunkEndSplit: false,
    fallbackSkip: false,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write(`\u001e{\n  "text": "a \\" { b",\n  "list": [\n    1,\n    2\n  ]\n}\n`);
    await writer.write(`\u001e{\n  "truncated": true\n\u001e[\n  3\n]\n`);
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toEqual([
    `{\n  "text": "a \\" { b",\n  "list": [\n    1,\n    2\n  ]\n}`,
    `{\n  "truncated": true\n`,
    `[\n  3\n]`,
  ]);
});

test("maxLength exceeded throws RangeError", async ({ expect }) => {
  const { readable, writable } = new RecordToSequenceStream({
    begin: "<",
    end: ">",
    chunkEndSplit: false,
    fallbackSkip: false,
    maxLength: 5,
  });
  const writer = writable.getWriter();
  async function call() {
    const promises: Promise<unknown>[] = [];
    promises.push(writer.write("<12345><123456>"));
    promises.push(Array.fromAsync(readable));
    promises.push(writer.close());
    await Promise.all(promises);
  }
  await expect(call()).rejects.toThrow(RangeError);
});

test("trailing partial begin flushed when fallbackSkip:false", async ({ expect }) => {
  const { readable, writable } = new RecordToSequenceStream({
    begin: "<<",
    end: ">>",
    chunkEndSplit: false,
    fallbackSkip: false,
  });
  void (async () => {
    const writer = writable.getWriter();
    await writer.write("<<123>><");
    await writer.close();
  })();
  const array = await Array.fromAsync(readable);
  expect(array).toEqual(["123", "<"]);
});

test("queuing strategies are applied", ({ expect }) => {
  const { writable } = new RecordToSequenceStream({
    begin: "\u001e",
    end: "\n",
    chunkEndSplit: false,
    fallbackSkip: false,
    writableStrategy: { highWaterMark: 7 },
  });
  expect(writable.getWriter().desiredSize).toBe(7);
});
