import { RecordToSequenceStream } from "./RecordToSequenceStream.js";
import type { RecordToSequenceStreamOptions } from "./RecordToSequenceStream.js";
import { LF, RS } from "../rfc7464.js";

export type InputRecordSequenceStreamOptions = Partial<RecordToSequenceStreamOptions>;

const LINE_BEGIN = RS;
const LINE_END = LF;

/**
 * RS で始まって LF で1行を表す 連続した文字列データを 行データとして整形して返す
 */
export class InputRecordSequenceStream extends RecordToSequenceStream {
  constructor(options?: InputRecordSequenceStreamOptions) {
    const {
      begin = LINE_BEGIN,
      end = LINE_END,
      chunkEndSplit = false,
      fallbackSkip = false,
      maxLength,
      truncationFallback,
      writableStrategy,
      readableStrategy,
    } = options ?? {};
    super({ begin, end, chunkEndSplit, fallbackSkip, maxLength, truncationFallback, writableStrategy, readableStrategy });
  }
}
