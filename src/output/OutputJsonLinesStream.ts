import { OutputJsonSequenceStringifyStream } from "./OutputJsonSequenceStringifyStream.js";
import type { OutputJsonSequenceStringifyStreamOptions } from "./OutputJsonSequenceStringifyStream.js";
import { OutputTextJoinLineFeedSequenceStream } from "./OutputTextJoinLineFeedSequenceStream.js";
import type { OutputTextJoinLineFeedSequenceStreamOptions } from "./OutputTextJoinLineFeedSequenceStream.js";
import type { OmitQueuingStrategies } from "../types/index.js";

export type OutputJsonLinesStreamOptions<T> = Omit<OutputJsonSequenceStringifyStreamOptions<T>, "readableStrategy">
  & OmitQueuingStrategies<OutputTextJoinLineFeedSequenceStreamOptions>;

function makeInternalOutputJsonLinesStream<T>(options: OutputJsonLinesStreamOptions<T>) {
  const { delimiter, skip, start, end = true, stringify, errorFallback, writableStrategy } = options;
  const encoder = new TextEncoderStream();
  const sequence = new OutputTextJoinLineFeedSequenceStream({ delimiter, end, skip, start });
  const jsonSequence = new OutputJsonSequenceStringifyStream({ stringify, errorFallback, writableStrategy });
  const { writable } = jsonSequence;
  const readable = jsonSequence.readable
    .pipeThrough(sequence)
    .pipeThrough(encoder);
  return { writable, readable };
}

/**
 * A composite stream that serializes typed values (`T`) into the NDJSON / JSON Lines format
 * and outputs them as a binary stream (`BufferSource`).
 *
 * This stream is designed for producing newline-delimited JSON (`application/jsonl`) from
 * typed application data, for use in streaming APIs, server-sent logs, or line-based protocols.
 *
 * Internally, it composes:
 * - `OutputJsonSequenceStringifyStream`: Converts each `T` value to a JSON string.
 * - `OutputTextJoinLineFeedSequenceStream`: Appends a line delimiter (default: `\n`) between records,
 *   with options to control start/end behavior and skip empty values.
 * - `TextEncoderStream`: Encodes the final joined string into a binary stream.
 *
 * Options:
 * - `stringify`: Function to convert a `T` value into a string (defaults to `JSON.stringify`).
 * - `errorFallback`: Optional error handler for stringification failures.
 * - `delimiter`: Character(s) used to separate lines (default is usually `\n`).
 * - `start`, `end`: Whether to insert delimiters at the start or end of the stream.
 * - `skip`: Whether to skip empty or undefined string outputs.
 *
 * Useful for:
 * - Streaming NDJSON to HTTP request bodies or WebSockets.
 * - Logging structured data line-by-line.
 * - Interfacing with systems that consume line-delimited JSON.
 *
 * @example ```ts
 * const stream = new OutputJsonLinesStream<MyType>({ delimiter: "\n" });
 * stream.writable.getWriter().write({ id: 1 });
 * ```
 */
export class OutputJsonLinesStream<T> implements ReadableWritablePair<Uint8Array<ArrayBuffer>, T> {
  #writable: WritableStream<T>;
  #readable: ReadableStream<Uint8Array<ArrayBuffer>>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: OutputJsonLinesStreamOptions<T> = {}) {
    ({
      readable: this.#readable,
      writable: this.#writable,
    } = makeInternalOutputJsonLinesStream(options));
  }
}

/**
 * Serializes an `AsyncIterable` or `Iterable` of typed values (`T`) into NDJSON / JSON Lines binary chunks.
 */
export async function* stringifyJsonLines<T>(
  source: AsyncIterable<T> | Iterable<T>,
  options?: OutputJsonLinesStreamOptions<T>,
): AsyncGenerator<Uint8Array<ArrayBuffer>, void, undefined> {
  const stream = new OutputJsonLinesStream<T>(options);
  const writer = stream.writable.getWriter();
  const writePromise = (async () => {
    for await (const item of source) {
      await writer.write(item);
    }
    await writer.close();
  })();
  yield* stream.readable;
  await writePromise;
}
