import { JsonSequenceFormatStream, type JsonSequenceFormatStreamOptions } from "./JsonSequenceFormatStream";
import { SequenceStream, } from "./SequenceStream";
import type { SequenceStreamOptions } from "./SequenceStream";

export type JsonSequenceStreamOptions<T> = { label?: string } & TextDecoderOptions & JsonSequenceFormatStreamOptions<T> & SequenceStreamOptions;

function makeInternalJsonSequenceStream<T>(options: JsonSequenceStreamOptions<T>) {
  const { label, fatal, lineBegin, lineEnd, parse, errorFallback } = options;
  const decoder = new TextDecoderStream(label, { fatal });
  const sequence = new SequenceStream({ lineBegin, lineEnd });
  const jsonSequence = new JsonSequenceFormatStream({ parse, errorFallback });
  const { writable } = decoder;
  const readable = decoder.readable
    .pipeThrough(sequence)
    .pipeThrough(jsonSequence);
  return { writable, readable };
}

/**
 * fetch 等の stream() に接続する目的の application/json-seq フォーマットを T型の json として パースする Stream
 */
class JsonSequenceStream<T> extends TransformStream<BufferSource, T> {
  #writable: WritableStream<BufferSource>;
  #readable: ReadableStream<T>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: { label?: string } & TextDecoderOptions & JsonSequenceFormatStreamOptions<T> & SequenceStreamOptions = {}) {
    super();
    ({
      readable: this.#readable,
      writable: this.#writable
    } = makeInternalJsonSequenceStream(options))
  }
}
export { 
  JsonSequenceStream,
  JsonSequenceStream as default,
};