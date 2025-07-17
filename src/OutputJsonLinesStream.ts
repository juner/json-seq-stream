import { OutputJsonSequenceStringifyStream } from "./OutputJsonSequenceStfingifyStream";
import type { OutputJsonSequenceStringifyStreamOptions } from "./OutputJsonSequenceStfingifyStream";
import { OutputTextJoinLineFeedSequenceStream } from "./OutputTextJoinLineFeedSequenceStream";
import type { OutputTextJoinLineFeedSequenceStreamOptions } from "./OutputTextJoinLineFeedSequenceStream";

export type OutputJsonLinesStreamOptions<T> = OutputJsonSequenceStringifyStreamOptions<T> & OutputTextJoinLineFeedSequenceStreamOptions;


function makeInternalOutputJsonLinesStream<T>(options: OutputJsonLinesStreamOptions<T>) {
  const { delimiter, skip, start, end, stringify, errorFallback } = options;
  const encoder = new TextEncoderStream();
  const sequence = new OutputTextJoinLineFeedSequenceStream({ delimiter, end, skip, start });
  const jsonSequence = new OutputJsonSequenceStringifyStream({ stringify, errorFallback });
  const { writable } = jsonSequence;
  const readable = jsonSequence.readable
    .pipeThrough(sequence)
    .pipeThrough(encoder);
  return { writable, readable };
}

/**
 * T型 を application/jsonl フォーマットに変換する Stream
 */
export class OutputJsonLinesStreamO<T> implements ReadableWritablePair<BufferSource, T> {
  #writable: WritableStream<T>;
  #readable: ReadableStream<BufferSource>;
  get writable() { return this.#writable; }
  get readable() { return this.#readable; }
  constructor(options: OutputJsonLinesStreamOptions<T> = {}) {
    ({
      readable: this.#readable,
      writable: this.#writable
    } = makeInternalOutputJsonLinesStream(options))
  }
}
