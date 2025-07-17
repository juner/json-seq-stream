import { InputJsonSequenceParseStream } from "./InputJsonSequenceParseStream";
import type { InputJsonSequenceParseStreamOptions } from "./InputJsonSequenceParseStream";
import { InputLineFeedSeparattedSequenceStream } from "./InputLineFeedSeparattedSequenceStream";
import type { InputLineFeedSeparattedSequenceStreamOptions } from "./InputLineFeedSeparattedSequenceStream";

export type InputJsonLinesStreamOptions<T> = { label?: string } & TextDecoderOptions & InputLineFeedSeparattedSequenceStreamOptions & InputJsonSequenceParseStreamOptions<T>

function makeInternalJsonLinesStream<T>(options?: InputJsonLinesStreamOptions<T>) {
  const { label, fatal, splitter, chunkEndSplit, parse, errorFallback } = options ?? {};
  const decoder = new TextDecoderStream(label, { fatal });
  const sequence = new InputLineFeedSeparattedSequenceStream({ splitter, chunkEndSplit });
  const jsonSequence = new InputJsonSequenceParseStream({ parse, errorFallback });
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
 * - `InputLineFeedSeparattedSequenceStream`: Splits the text stream into individual lines
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
  constructor(options?: InputJsonLinesStreamOptions<T>) {
    ({
      readable: this.#readable,
      writable: this.#writable
    } = makeInternalJsonLinesStream(options))
  }
}
