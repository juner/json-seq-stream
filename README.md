# json-seq-stream

application/json-seq / jsonl (NDJSON) support stream / async iterator library

This library provides composable `TransformStream` / `ReadableWritablePair` classes and async generator utilities to work with streaming JSON data formats.

## Features

- [x] Supports [RFC 7464](https://datatracker.ietf.org/doc/html/rfc7464) (`application/json-seq`), including multi-line JSON and truncated record recovery
- [x] Supports JSON Lines / NDJSON (`application/jsonl`, `application/x-ndjson`)
- [x] Fully stream-compatible (Fetch API, File API, Node.js 20+, Bun, Deno, etc.)
- [x] Composable with standard Web Streams (`pipeThrough()`) and `AsyncIterable` / `for await...of`
- [x] Supports async `parse` / `stringify` functions and maximum buffer length (`maxLength`) protection
- [x] `Content-Type` based format detection for `fetch()` responses (`parseJsonResponse`)
- [x] Customizable backpressure via `writableStrategy` / `readableStrategy` queuing strategy options
- [x] Truncated final record handling (`truncationFallback`, RFC 7464 §2.4)
- [x] Format constants (MIME types, separators) via subpath exports (`json-seq-stream/rfc7464`, `json-seq-stream/jsonlines`)

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

### Fetch Response with `Content-Type` Detection

```ts
import { parseJsonResponse } from "json-seq-stream";

type Value = { value: number };

const response = await fetch("https://example.com/data");
// application/json-seq -> RFC 7464, application/jsonl or application/x-ndjson -> JSON Lines
for await (const value of parseJsonResponse<Value>(response)) {
  console.log(value);
}
```

### Error Handling

By default, input streams skip records that fail to parse and report them
with a `console.warn` (RFC 7464 §2.1), while output streams error the stream
when `stringify` fails. Use the `errorFallback` option to customize this:

```ts
import { InputJsonLinesStream } from "json-seq-stream";

const stream = new InputJsonLinesStream<MyType>({
  // false: skip silently / function: decide per record
  errorFallback: (error, { chunk }) => {
    console.error("broken line:", chunk, error);
  },
});
```

### Format Constants (subpath exports)

The format constants are intentionally kept out of the main entry and exposed
via dedicated subpaths:

```ts
import { MIME_TYPE, RS, LF } from "json-seq-stream/rfc7464";
import { NDJSON_MIME_TYPE, EXTENSION } from "json-seq-stream/jsonlines";

const response = await fetch(url, { headers: { accept: MIME_TYPE } });
```

- `json-seq-stream/rfc7464`: `RS`, `LF`, `MIME_TYPE` (`application/json-seq`)
- `json-seq-stream/jsonlines`: `LF`, `CRLF`, `MIME_TYPE` (`application/jsonl`), `NDJSON_MIME_TYPE` (`application/x-ndjson`), `EXTENSION` (`.jsonl`)

## See also

- RFC 7464 - JavaScript Object Notation (JSON) Text Sequences \
[https://datatracker.ietf.org/doc/html/rfc7464](https://datatracker.ietf.org/doc/html/rfc7464)
- JSON Lines \
[https://jsonlines.org](https://jsonlines.org)
- JSON streaming - Wikipedia (en) \
[https://en.wikipedia.org/wiki/JSON_streaming](https://en.wikipedia.org/wiki/JSON_streaming)
