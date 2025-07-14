import { OutputJsonSequenceStringifyStream } from "./OutputJsonSequenceStfingifyStream";
import type { OutputJsonSequenceStringifyStreamOptions } from "./OutputJsonSequenceStfingifyStream";
import { OutputSequenceStream } from "./OutputSequenceStream";
import type { OutputSequenceStreamOptions } from "./OutputSequenceStream";

export type OutputJsonSequenceStreamOptions<T> = OutputJsonSequenceStringifyStreamOptions<T> & OutputSequenceStreamOptions;

function makeInternalOutputJsonSequenceStream<T>(options: OutputJsonSequenceStreamOptions<T>) {
  const { lineBegin, lineEnd, stringify, errorFallback } = options;
  const encoder = new TextEncoderStream();
  const sequence = new OutputSequenceStream({ lineBegin, lineEnd });
  const jsonSequence = new OutputJsonSequenceStringifyStream({ stringify, errorFallback });
  const { writable } = jsonSequence;
  const readable = jsonSequence.readable
    .pipeThrough(sequence)
    .pipeThrough(encoder);
  return { writable, readable };
}

/**
 * T型 を application/json-seq フォーマットに変換する Stream
 */
export class OutputJsonSequenceStream<T> extends TransformStream<T, BufferSource> {
  #writable: WritableStream<T>;
  #readable: ReadableStream<BufferSource>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: OutputJsonSequenceStreamOptions<T> = {}) {
    super();
    ({
      readable: this.#readable,
      writable: this.#writable
    } = makeInternalOutputJsonSequenceStream(options))
  }
}
