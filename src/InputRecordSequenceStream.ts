import { LF, RS } from "./rfc7464";
import type { TransformStreamConstructor } from "./TransformStreamConstructor";

const LINE_BEGIN = RS;
const LINE_END = LF;

export type InputRecordSequenceStreamOptions = {
  lineBegin?: string;
  lineEnd?: string;
};
function makeInternalInputRecordSequenceStream({ lineBegin, lineEnd }: InputRecordSequenceStreamOptions = {}): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  lineBegin ??= LINE_BEGIN;
  lineEnd ??= LINE_END;
  const sequence: string[] = [];
  const separater = new RegExp(`(${RegExp.escape(lineBegin)}|${RegExp.escape(lineEnd)})`, "u");
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk: string, controller: TransformStreamDefaultController<string>) {
        for (const c of chunk.split(separater)) {
          if (c === lineBegin) {
            const enqueue = enqueueSequence(sequence);
            if (enqueue.length <= 0) continue;
            controller.enqueue(enqueue);
            continue;
          }
          if (c === lineEnd) {
            continue;
          }
          sequence.push(c);
        }
      },
      flush(controller: TransformStreamDefaultController<string>) {
        const enqueue = enqueueSequence(sequence);
        if (enqueue.length <= 0) return;
        controller.enqueue(enqueue);
      }
    }
  ];
  return {
    args,
  };

  function enqueueSequence(sequence: string[]) {
    return sequence.splice(0, sequence.length).join("");
  }
}
/**
 * RS で始まって LF で1行を表す 連続した文字列データを 行データとして整形して返す
 */
export class InputRecordSequenceStream extends TransformStream<string, string> {
  constructor(options?: InputRecordSequenceStreamOptions) {
    const { args } = makeInternalInputRecordSequenceStream(options);
    super(...args);
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
