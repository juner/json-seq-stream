import { CRLF, LF } from "./jsonlines";
import type { TransformStreamConstructor } from "./TransformStreamConstructor";

function makeSeparator(separater: string[] | string) {
  if (typeof separater === "string")
    separater = [separater];
  const parts = separater.map(s => RegExp.escape(s)).join('|');
  return {
    separator: new RegExp(`(${parts})`),
    checker: new RegExp(`^(${parts})$`),
  }
}

export type SplitSeqenceStreamOptions = {
  separater: string | string[];
}

function makeInternalInputSeparatedSeqenceStream({ separater: sep }: SplitSeqenceStreamOptions): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  const { separator, checker } = makeSeparator(sep);
  const sequence: string[] = [];
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk, controller) {
        for (const c of chunk.split(separator)) {
          if (checker.test(c)) {
            if (sequence.length <= 0) continue;
            const enqueue = enqueueSequence(sequence);
            if (enqueue.length <= 0) continue;
            controller.enqueue(enqueue);
            continue;
          }
          sequence.push(c);
        }
      }
    }
  ];
  return {
    args
  };
  function enqueueSequence(sequence: string[]) {
    return sequence.splice(0, sequence.length).join("");
  }
}

/**
 * 任意の文字列で区切られた 文字列を シーケンスに変換するストリーム
 */
export class TextSplitStream extends TransformStream<string, string> {
  constructor(options: SplitSeqenceStreamOptions) {
    const { args } = makeInternalInputSeparatedSeqenceStream(options);
    super(...args);
  }
}


const SEPARATOR = [LF, CRLF];

/**
 * LF もしくは CRLF で区切られた シーケンスに変換するストリーム
 */
export class InputLineFeedSeparattedSequenceStream extends TextSplitStream {
  constructor(options?: Partial<SplitSeqenceStreamOptions>) {
    // eslint-disable-next-line prefer-const
    let { separater, ...o } = options ?? {};
    separater ??= SEPARATOR;
    super({ separater, ...o });
  }
}

