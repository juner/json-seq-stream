import { InputJsonSequenceFormatStream, type InputJsonSequenceFormatStreamOptions } from "./InputJsonSequenceFormatStream";
import { InputSequenceStream, } from "./InputSequenceStream";
import type { InputSequenceStreamOptions } from "./InputSequenceStream";

export type InputJsonSequenceStreamOptions<T> = { label?: string } & TextDecoderOptions & InputJsonSequenceFormatStreamOptions<T> & InputSequenceStreamOptions;

function makeInternalJsonSequenceStream<T>(options: InputJsonSequenceStreamOptions<T>) {
  const { label, fatal, lineBegin, lineEnd, parse, errorFallback } = options;
  const decoder = new TextDecoderStream(label, { fatal });
  const sequence = new InputSequenceStream({ lineBegin, lineEnd });
  const jsonSequence = new InputJsonSequenceFormatStream({ parse, errorFallback });
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
  constructor(options: { label?: string } & TextDecoderOptions & InputJsonSequenceFormatStreamOptions<T> & InputSequenceStreamOptions = {}) {
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
