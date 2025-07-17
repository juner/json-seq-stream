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
 * fetch 等の stream() に接続する目的の application/json-seq フォーマットを T型の json として パースする Stream
 */
class InputJsonSequenceStream<T> extends TransformStream<BufferSource, T> {
  #writable: WritableStream<BufferSource>;
  #readable: ReadableStream<T>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: InputJsonSequenceStreamOptions<T> = {}) {
    super();
    ({
      readable: this.#readable,
      writable: this.#writable
    } = makeInternalJsonSequenceStream(options))
  }
}
export {
  InputJsonSequenceStream,
  InputJsonSequenceStream as default,
};

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
