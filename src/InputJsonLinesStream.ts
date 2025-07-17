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
 * fetch 等の stream() に接続する目的の application/jsonl フォーマットを T型の json として パースする Stream
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
