import { LF, RS } from "./rfc7464";
import { SequenceToRecordStream } from "./SequenceToRecordStream";
import type { SequenceToRecordStreamOptions } from "./SequenceToRecordStream";

const RECORD_BEGIN = RS;
const RECORD_END = LF;
const SKIP = false;

export type OutputRecordSequenceStreamOptions = Partial<SequenceToRecordStreamOptions>;

/**
 * Converts line data into continuous string data starting with RS and each LF represents one line.
 */
export class OutputRecordSequenceStream extends SequenceToRecordStream {
  constructor(options?: OutputRecordSequenceStreamOptions) {
    // eslint-disable-next-line prefer-const
    let { begin: recordBegin, end: recordEnd, skip, ...args } = options ?? {};
    recordBegin ??= RECORD_BEGIN;
    recordEnd ??= RECORD_END;
    skip ??= SKIP;
    super({ begin: recordBegin, end: recordEnd, skip, ...args });
  }
}

// #region deprecated remove v2.0.0 -

/**
 * @deprecated rename to OutputRecordSequenceStreamOptions
 * @see SequenceToRecordStreamOptions
 */
export type OutputSequenceStreamOptions = SequenceToRecordStreamOptions;

/**
 * @deprecated rename to OutputRecordSequenceStream
 * @see OutputRecordSequenceStream
 */
export const OutputSequenceStream = OutputRecordSequenceStream;

// #endregion
