import { InputJsonSequenceParseStream } from "./InputJsonSequenceParseStream.js";
import type { InputJsonSequenceParseStreamOptions } from "./InputJsonSequenceParseStream.js";
import { InputLineFeedSeparatedSequenceStream } from "./InputLineFeedSeparatedSequenceStream.js";
import type { InputLineFeedSeparatedSequenceStreamOptions } from "./InputLineFeedSeparatedSequenceStream.js";
import { pipeIterableThrough } from "../internal/pipeIterableThrough.js";
import type { OmitQueuingStrategies } from "../types/index.js";

export type InputJsonLinesStreamOptions<T> = { label?: string } & TextDecoderOptions
  & OmitQueuingStrategies<InputLineFeedSeparatedSequenceStreamOptions>
  & Omit<InputJsonSequenceParseStreamOptions<T>, "writableStrategy">;

function makeInternalJsonLinesStream<T>(options: InputJsonLinesStreamOptions<T>) {
  const { label, fatal, ignoreBOM, splitter, chunkEndSplit, maxLength, parse, errorFallback, readableStrategy } = options;
  const decoder = new TextDecoderStream(label, { fatal, ignoreBOM });
  const sequence = new InputLineFeedSeparatedSequenceStream({ splitter, chunkEndSplit, maxLength });
  const jsonSequence = new InputJsonSequenceParseStream({ parse, errorFallback, readableStrategy });
  const { writable } = decoder;
  const readable = decoder.readable
    .pipeThrough(sequence)
    .pipeThrough(jsonSequence);
  return { writable, readable };
}

/**
 * A composite stream that parses a binary NDJSON / JSON Lines stream
 * (`application/jsonl`) into a stream of typed JSON values (`T`).
 *
 * This stream is designed to work with binary sources such as `fetch().body`,
 * decoding line-delimited JSON records into structured JavaScript objects.
 *
 * Internally, it composes:
 * - `TextDecoderStream`: Decodes binary data (e.g. UTF-8) into text.
 * - `InputLineFeedSeparatedSequenceStream`: Splits the text stream into individual lines
 *   using newline (`\n`) or custom delimiters.
 * - `InputJsonSequenceParseStream`: Parses each line as a JSON object of type `T`.
 *
 * Options:
 * - `label`, `fatal`: Text decoding behavior (passed to `TextDecoderStream`).
 * - `splitter`, `chunkEndSplit`: Controls how lines are detected and split.
 * - `parse`: Custom JSON parse function for each line (defaults to `JSON.parse`).
 * - `errorFallback`: Optional handler for parse errors to gracefully handle invalid lines.
 *
 * Useful for:
 * - Streaming NDJSON (newline-delimited JSON) over HTTP, WebSockets, or other binary transport.
 * - Processing server-sent logs, analytics, or event streams in real-time.
 *
 * @example ```ts
 *   const stream = response.body.pipeThrough(new InputJsonLinesStream<MyType>());
 * ```
 */
export class InputJsonLinesStream<T> implements ReadableWritablePair<T, BufferSource> {
  #writable: WritableStream<BufferSource>;
  #readable: ReadableStream<T>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: InputJsonLinesStreamOptions<T> = {}) {
    ({
      readable: this.#readable,
      writable: this.#writable,
    } = makeInternalJsonLinesStream(options));
  }
}

/**
 * Parses an `AsyncIterable` or `Iterable` of binary or string chunks in NDJSON / JSON Lines format
 * and yields typed JSON values (`T`).
 */
export async function* parseJsonLines<T>(
  source: AsyncIterable<BufferSource | string> | Iterable<BufferSource | string>,
  options?: InputJsonLinesStreamOptions<T>,
): AsyncGenerator<T, void, undefined> {
  const stream = new InputJsonLinesStream<T>(options);
  const encoder = new TextEncoder();
  yield* pipeIterableThrough(
    source,
    stream,
    chunk => (typeof chunk === "string" ? encoder.encode(chunk) : chunk),
  );
}
