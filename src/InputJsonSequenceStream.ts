import { InputJsonSequenceParseStream } from "./InputJsonSequenceParseStream";
import type { InputJsonSequenceParseStreamOptions } from "./InputJsonSequenceParseStream";
import { InputRecordSequenceStream, } from "./InputRecordSequenceStream";
import type { InputRecordSequenceStreamOptions } from "./InputRecordSequenceStream";

export type InputJsonSequenceStreamOptions<T> = { label?: string } & TextDecoderOptions & InputJsonSequenceParseStreamOptions<T> & InputRecordSequenceStreamOptions;

function makeInternalJsonSequenceStream<T>(options: InputJsonSequenceStreamOptions<T>) {
  const { label, fatal, begin, end, parse, errorFallback } = options;
  const decoder = new TextDecoderStream(label, { fatal });
  const sequence = new InputRecordSequenceStream({ begin, end });
  const jsonSequence = new InputJsonSequenceParseStream({ parse, errorFallback });
  const { writable } = decoder;
  const readable = decoder.readable
    .pipeThrough(sequence)
    .pipeThrough(jsonSequence);
  return { writable, readable };
}

/**
 * A composite stream that parses a binary stream in `application/json-seq` format
 * into a stream of typed JSON values (`T`).
 *
 * This stream is intended for use with binary sources such as `Response.body` from `fetch()`,
 * where the content is encoded as a sequence of JSON objects, delimited by custom start/end markers.
 *
 * It internally combines the following components:
 * - `TextDecoderStream`: Decodes binary data (e.g., UTF-8) into text.
 * - `InputRecordSequenceStream`: Splits the text into logical record boundaries using `begin` and `end` delimiters.
 * - `InputJsonSequenceParseStream`: Parses each record as a JSON object of type `T`.
 *
 * Options:
 * - `label`, `fatal`: Passed to the `TextDecoderStream` for text decoding behavior.
 * - `begin`, `end`: Record delimiters used by `InputRecordSequenceStream`.
 * - `parse`: Custom JSON parse function (defaults to `JSON.parse`).
 * - `errorFallback`: Error recovery handler if JSON parsing fails.
 *
 * Useful for:
 * - Processing streaming NDJSON or JSON-seq (RFC 7464) over Fetch API or other binary streams.
 * - Handling structured streaming protocols over HTTP or WebSocket.
 *
 * @example ```ts
 *   const stream = response.body.pipeThrough(new InputJsonSequenceStream<MyType>());
 * ```
 */
export class InputJsonSequenceStream<T> implements ReadableWritablePair<T, BufferSource> {
  #writable: WritableStream<BufferSource>;
  #readable: ReadableStream<T>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: InputJsonSequenceStreamOptions<T> = {}) {
    ({
      readable: this.#readable,
      writable: this.#writable
    } = makeInternalJsonSequenceStream(options))
  }
}

// #region deprecated remove to version 2.0.0 -

/**
 * @deprecated rename to InputJsonSequenceStream
 * @see InputJsonSequenceStream
 */
export const JsonSequenceStream = InputJsonSequenceStream;

/**
 * @deprecated rename to InputJsonSequenceStreamOptions
 * @see InputJsonSequenceStreamOptions
 */
export type JsonSequenceStreamOptions<T> = InputJsonSequenceStreamOptions<T>;

// #endregion
