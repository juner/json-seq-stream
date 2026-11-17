import { LF, CRLF } from "../jsonlines.js";
import { TextSplitStream } from "./TextSplitStream.js";
import type { TextSplitStreamOptions } from "./TextSplitStream.js";

export type InputLineFeedSeparatedSequenceStreamOptions = Partial<TextSplitStreamOptions>;

const LINEFEED_SEPARATOR = [LF, CRLF];
/**
 * Stream to convert to LF or CRLF delimited sequence
 */

export class InputLineFeedSeparatedSequenceStream extends TextSplitStream {
  constructor(options?: InputLineFeedSeparatedSequenceStreamOptions) {
    const {
      splitter = LINEFEED_SEPARATOR,
      chunkEndSplit = false,
      maxLength,
      writableStrategy,
      readableStrategy,
    } = options ?? {};
    super({ splitter, chunkEndSplit, maxLength, writableStrategy, readableStrategy });
  }
}

/**
 * @deprecated Use {@link InputLineFeedSeparatedSequenceStreamOptions} instead. (to be removed in v3.0.0)
 */
export type InputLineFeedSeparattedSequenceStreamOptions = InputLineFeedSeparatedSequenceStreamOptions;

/**
 * @deprecated Use {@link InputLineFeedSeparatedSequenceStream} instead. (to be removed in v3.0.0)
 */
export const InputLineFeedSeparattedSequenceStream = InputLineFeedSeparatedSequenceStream;
/**
 * @deprecated Use {@link InputLineFeedSeparatedSequenceStream} instead. (to be removed in v3.0.0)
 */
export type InputLineFeedSeparattedSequenceStream = InputLineFeedSeparatedSequenceStream;
