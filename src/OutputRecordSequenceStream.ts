import { LF, RS } from "./rfc7464";
import type { TransformStreamConstructor } from "./TransformStreamConstructor";

const LINE_BEGIN = RS;
const LINE_END = LF;

export type OutputRecordSequenceStreamOptions = {
  lineBegin?: string;
  lineEnd?: string;
};
function makeInternalOutputRecordSequenceStream({ lineBegin, lineEnd }: OutputRecordSequenceStreamOptions = {}): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  lineBegin ??= LINE_BEGIN;
  lineEnd ??= LINE_END;
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk: string, controller: TransformStreamDefaultController<string>) {
        controller.enqueue(`${lineBegin}${chunk}${lineEnd}`);
      },
    }
  ];
  return {
    args,
  };
}
/**
 * 行データを RS で始まって LF で1行を表す 連続した文字列データに変換する
 */
export class OutputRecordSequenceStream extends TransformStream<string, string> {
  constructor(options?: OutputRecordSequenceStreamOptions) {
    const { args } = makeInternalOutputRecordSequenceStream(options);
    super(...args);
  }
}

// #region deprecated remove v2.0.0 -

/**
 * @deprecated rename to OutputRecordSequenceStreamOptions
 * @see OutputRecordSequenceStreamOptions
 */
export type OutputSequenceStreamOptions = OutputRecordSequenceStreamOptions;

/**
 * @deprecated rename to OutputRecordSequenceStream
 * @see OutputRecordSequenceStream
 */
export const OutputSequenceStream = OutputRecordSequenceStream;

// #endregion
