# json-seq-stream

application/json-seq / jsonl (NDJSON) support stream / async iterator library

This library provides composable `TransformStream` / `ReadableWritablePair` classes and async generator utilities to work with streaming JSON data formats.

## Features

- [x] Supports [RFC 7464](https://datatracker.ietf.org/doc/html/rfc7464) (`application/json-seq`), including multi-line JSON and truncated record recovery
- [x] Supports JSON Lines / NDJSON (`application/jsonl`, `application/x-ndjson`)
- [x] Fully stream-compatible (Fetch API, File API, Node.js, Bun, Deno, etc.)
- [x] Composable with standard Web Streams (`pipeThrough()`) and `AsyncIterable` / `for await...of`
- [x] Supports async `parse` / `stringify` functions and maximum buffer length (`maxLength`) protection

---

## Usage Examples

### JSON Sequence (RFC 7464)

```ts
import { InputJsonSequenceStream } from "json-seq-stream";

type Value = { value: number };

const sequenceStream = new InputJsonSequenceStream<Value>();

const response = await fetch(url);
const readable = response.body!.pipeThrough(sequenceStream);

for await (const value of readable) {
  console.log(value);
}
```

### JSON Lines / NDJSON

```ts
import { InputJsonLinesStream } from "json-seq-stream";

type Value = { value: number };

const linesStream = new InputJsonLinesStream<Value>();

const response = await fetch("https://example.com/data.jsonl");
const readable = response.body!.pipeThrough(linesStream);

for await (const value of readable) {
  console.log(value);
}
```

### Output Stream Example

```ts
import { OutputJsonLinesStream } from "json-seq-stream";

type Value = { value: number };

const { readable, writable } = new OutputJsonLinesStream<Value>();

const writer = writable.getWriter();
void writer.write({ value: 1 });
void writer.write({ value: 2 });
void writer.close();

for await (const chunk of readable) {
  console.log(new TextDecoder().decode(chunk)); // NDJSON text lines
}
```

### Async Generator Helpers (`AsyncIterable` / `Iterable`)

```ts
import {
  parseJsonLines,
  parseJsonSequence,
  stringifyJsonLines,
  stringifyJsonSequence,
} from "json-seq-stream";

type Value = { value: number };

const items: Value[] = [{ value: 1 }, { value: 2 }];

// JSON Lines (NDJSON) round-trip with AsyncIterable
const jsonlBytes = stringifyJsonLines(items);
for await (const item of parseJsonLines<Value>(jsonlBytes)) {
  console.log(item);
}

// JSON Text Sequences (RFC 7464) round-trip with AsyncIterable
const jsonSeqBytes = stringifyJsonSequence(items);
for await (const item of parseJsonSequence<Value>(jsonSeqBytes)) {
  console.log(item);
}
```

## See also

- RFC 7464 - JavaScript Object Notation (JSON) Text Sequences \
[https://datatracker.ietf.org/doc/html/rfc7464](https://datatracker.ietf.org/doc/html/rfc7464)
- JSON Lines \
[https://jsonlines.org](https://jsonlines.org)
- JSON streaming - Wikipedia (en) \
[https://en.wikipedia.org/wiki/JSON_streaming](https://en.wikipedia.org/wiki/JSON_streaming)
