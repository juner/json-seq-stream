import { CRLF, LF } from "./jsonlines";
import type { TransformStreamConstructor } from "./TransformStreamConstructor";

export type TextSplitStreamOptions = {
  /** separator character */
  separator: string | string[];
  /** chunk end split force */
  chunkEndSplit: boolean;
}

function makeInternalInputSeparatedSeqenceStream({ separator: sep, chunkEndSplit }: TextSplitStreamOptions): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  const { separator, checker } = makeSeparator(sep);
  const sequence: string[] = [];
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk, controller) {
        for (const c of chunk.split(separator)) {

          // skip empty string
          if (c.length <= 0) continue;

          if (checker.test(c)) {
            enqueue(sequence, controller);
            continue;
          }

          sequence.push(c);
        }

        // chunk end split
        if (!chunkEndSplit) return;
        enqueue(sequence, controller);
      },
      flush(controller: TransformStreamDefaultController<string>) {
        enqueue(sequence, controller);
      }
    }
  ];
  return {
    args
  };
}

/**
 * string[] or string -> RegExp
 * @param separater
 * @returns
 */
function makeSeparator(separater: string[] | string) {
  if (typeof separater === "string")
    separater = [separater];
  const parts = separater.map(s => RegExp.escape(s)).join('|');
  return {
    separator: new RegExp(`(${parts})`, "ug"),
    checker: new RegExp(`^(${parts})$`),
  }
}

/**
 * enqueue controller
 * @param sequence
 * @param controller
 * @returns
 */
function enqueue(sequence: string[], controller: TransformStreamDefaultController<string>) {
  // empty sequence skip
  if (sequence.length <= 0) return;

  // sequence -> string
  const enqueue = sequence.splice(0, sequence.length).join("");
  controller.enqueue(enqueue);
}

/**
 * A stream that converts an arbitrary delimited string into a sequence.
 */
export class TextSplitStream extends TransformStream<string, string> {
  constructor(options: TextSplitStreamOptions) {
    const { args } = makeInternalInputSeparatedSeqenceStream(options);
    super(...args);
  }
}


const LINEFEED_SEPARATOR = [LF, CRLF];

/**
 * Stream to convert to LF or CRLF delimited sequence
 */
export class InputLineFeedSeparattedSequenceStream extends TextSplitStream {
  constructor(options?: Partial<TextSplitStreamOptions>) {
     
    let { separator, chunkEndSplit } = options ?? {};
    separator ??= LINEFEED_SEPARATOR;
    chunkEndSplit ??= false;
    super({ separator, chunkEndSplit });
  }
}

