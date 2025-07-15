import { LF, RS } from "./rfc7464";
import type { TransformStreamConstructor } from "./TransformStreamConstructor";

const LINE_BEGIN = RS;
const LINE_END = LF;

export type InputSequenceStreamOptions = {
  lineBegin?: string;
  lineEnd?: string;
};
function makeInternalInputSequenceStream({ lineBegin, lineEnd }: InputSequenceStreamOptions = {}): {
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
export class InputSequenceStream extends TransformStream<string, string> {
  constructor(options?: InputSequenceStreamOptions) {
    const { args } = makeInternalInputSequenceStream(options);
    super(...args);
  }
}

// #region deprecated remove v2.0.0 -

/**
 * @deprecated rename to InputSequenceStreamOptions
 * @see InputSequenceStreamOptions
 */
export type SequenceStreamOptions = InputSequenceStreamOptions;

/**
 * @deprecated rename to InputSequenceStream
 * @see InputSequenceStream
 */
export const SequenceStream = InputSequenceStream;

// #endregion
