import { OutputJsonSequenceStringifyStream } from "./OutputJsonSequenceStfingifyStream";
import type { OutputJsonSequenceStringifyStreamOptions } from "./OutputJsonSequenceStfingifyStream";
import { OutputRecordSequenceStream } from "./OutputRecordSequenceStream";
import type { OutputRecordSequenceStreamOptions } from "./OutputRecordSequenceStream";

export type OutputJsonSequenceStreamOptions<T> = OutputJsonSequenceStringifyStreamOptions<T> & OutputRecordSequenceStreamOptions;

function makeInternalOutputJsonSequenceStream<T>(options: OutputJsonSequenceStreamOptions<T>) {
  const { begin, end, stringify, errorFallback } = options;
  const encoder = new TextEncoderStream();
  const sequence = new OutputRecordSequenceStream({ begin, end });
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
export class OutputJsonSequenceStream<T> implements ReadableWritablePair<BufferSource, T> {
  #writable: WritableStream<T>;
  #readable: ReadableStream<BufferSource>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: OutputJsonSequenceStreamOptions<T> = {}) {
    ({
      readable: this.#readable,
      writable: this.#writable
    } = makeInternalOutputJsonSequenceStream(options))
  }
}
