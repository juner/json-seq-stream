import { OutputJsonSequenceStringifyStream } from "./OutputJsonSequenceStringifyStream.js";
import type { OutputJsonSequenceStringifyStreamOptions } from "./OutputJsonSequenceStringifyStream.js";
import { OutputRecordSequenceStream } from "./OutputRecordSequenceStream.js";
import type { OutputRecordSequenceStreamOptions } from "./OutputRecordSequenceStream.js";
import { pipeIterableThrough } from "../internal/pipeIterableThrough.js";
import type { OmitQueuingStrategies } from "../types/index.js";

export type OutputJsonSequenceStreamOptions<T> = Omit<OutputJsonSequenceStringifyStreamOptions<T>, "readableStrategy">
  & OmitQueuingStrategies<OutputRecordSequenceStreamOptions>;

function makeInternalOutputJsonSequenceStream<T>(options: OutputJsonSequenceStreamOptions<T>) {
  const { begin, end, skip, stringify, errorFallback, writableStrategy } = options;
  const encoder = new TextEncoderStream();
  const sequence = new OutputRecordSequenceStream({ begin, end, skip });
  const jsonSequence = new OutputJsonSequenceStringifyStream({ stringify, errorFallback, writableStrategy });
  const { writable } = jsonSequence;
  const readable = jsonSequence.readable
    .pipeThrough(sequence)
    .pipeThrough(encoder);
  return { writable, readable };
}

/**
 * A composite stream that serializes typed values (`T`) into the `application/json-seq` format
 * and outputs them as a binary stream (`BufferSource`).
 *
 * This stream is intended for use in scenarios where JSON values must be streamed
 * over binary-compatible channels (e.g., HTTP request bodies, WebSocket streams),
 * using a record-based format like JSON Text Sequences (RFC 7464) or custom delimiters.
 *
 * Internally, this stream is composed of:
 * - `OutputJsonSequenceStringifyStream`: Converts `T` values into JSON strings.
 * - `OutputRecordSequenceStream`: Wraps each JSON string with custom `begin` and `end` delimiters.
 * - `TextEncoderStream`: Encodes the final delimited text into a binary stream.
 *
 * Options:
 * - `stringify`: Custom function to convert a `T` value into a JSON string (defaults to `JSON.stringify`).
 * - `errorFallback`: Optional handler for recoverable stringify errors.
 * - `begin`, `end`: Delimiters inserted before and after each JSON record.
 *
 * Useful for:
 * - Writing streaming JSON data over `fetch()` or `WebSocket`.
 * - Generating NDJSON or JSON Text Sequences (RFC 7464) from typed application data.
 *
 * @example ```ts
 *   const stream = new OutputJsonSequenceStream<MyType>();
 *   stream.writable.getWriter().write({ id: 1 });
 * ```
 */
export class OutputJsonSequenceStream<T> implements ReadableWritablePair<Uint8Array<ArrayBuffer>, T> {
  #writable: WritableStream<T>;
  #readable: ReadableStream<Uint8Array<ArrayBuffer>>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: OutputJsonSequenceStreamOptions<T> = {}) {
    ({
      readable: this.#readable,
      writable: this.#writable,
    } = makeInternalOutputJsonSequenceStream(options));
  }
}

/**
 * Serializes an `AsyncIterable` or `Iterable` of typed values (`T`) into `application/json-seq` binary chunks.
 */
export async function* stringifyJsonSequence<T>(
  source: AsyncIterable<T> | Iterable<T>,
  options?: OutputJsonSequenceStreamOptions<T>,
): AsyncGenerator<Uint8Array<ArrayBuffer>, void, undefined> {
  const stream = new OutputJsonSequenceStream<T>(options);
  yield* pipeIterableThrough(source, stream, item => item);
}
