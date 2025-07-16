import { LF, CRLF } from "./jsonlines";
import { TextSplitStream, TextSplitStreamOptions } from "./TextSplitStream";

const LINEFEED_SEPARATOR = [LF, CRLF];
/**
 * Stream to convert to LF or CRLF delimited sequence
 */

export class InputLineFeedSeparattedSequenceStream extends TextSplitStream {
  constructor(options?: Partial<TextSplitStreamOptions>) {
    let { splitter, chunkEndSplit } = options ?? {};
    splitter ??= LINEFEED_SEPARATOR;
    chunkEndSplit ??= false;
    super({ splitter, chunkEndSplit });
  }
}
