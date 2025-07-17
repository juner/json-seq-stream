import { RecordToSequenceStream } from "./RecordToSequenceStream";
import type { RecordToSequenceStreamOptions } from "./RecordToSequenceStream";
import { LF, RS } from "./rfc7464";


export type InputRecordSequenceStreamOptions = Partial<RecordToSequenceStreamOptions>;

const LINE_BEGIN = RS;
const LINE_END = LF;

/**
 * RS で始まって LF で1行を表す 連続した文字列データを 行データとして整形して返す
 */
export class InputRecordSequenceStream extends RecordToSequenceStream {
  constructor(options?: InputRecordSequenceStreamOptions) {
    let {begin, end, chunkEndSplit, fallbackSkip } = options ?? {};
    begin ??= LINE_BEGIN;
    end ??= LINE_END;
    chunkEndSplit ??= false;
    fallbackSkip ??= false;
    super({begin, end, chunkEndSplit, fallbackSkip});
  }
}

// #region deprecated remove v2.0.0 -

/**
 * @deprecated rename to InputSequenceStreamOptions
 * @see InputRecordSequenceStreamOptions
 */
export type SequenceStreamOptions = InputRecordSequenceStreamOptions;

/**
 * @deprecated rename to InputSequenceStream
 * @see InputRecordSequenceStream
 */
export const SequenceStream = InputRecordSequenceStream;

/**
 * @deprecated rename to InputRecordSequenceStreamOptions
 * @see InputRecordSequenceStreamOptions
 */
export type InputSequenceStreamOptions = InputRecordSequenceStreamOptions;

/**
 * @deprecated rename to InputRecordSequenceStream
 * @see InputRecordSequenceStream
 */
export const InputSequenceStream = InputRecordSequenceStream;
// #endregion
