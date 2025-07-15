import { LF, RS } from "./rfc7464";
import type { TransformStreamConstructor } from "./TransformStreamConstructor";

const LINE_BEGIN = RS;
const LINE_END = LF;

export type OutputSequenceStreamOptions = {
  lineBegin?: string;
  lineEnd?: string;
};
function makeInternalOutputSequenceStream({ lineBegin, lineEnd }: OutputSequenceStreamOptions = {}): {
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
export class OutputSequenceStream extends TransformStream<string, string> {
  constructor(options?: OutputSequenceStreamOptions) {
    const { args } = makeInternalOutputSequenceStream(options);
    super(...args);
  }
}
