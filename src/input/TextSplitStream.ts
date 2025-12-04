import type { TransformStreamConstructor } from "../types/index.js";

export type TextSplitStreamOptions = {
  /** separator character */
  splitter: string | string[]
  /** chunk end split force */
  chunkEndSplit: boolean
};

function makeInternalTextSplitStream({ splitter, chunkEndSplit }: TextSplitStreamOptions): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  const { separator, checker } = makeSeparator(splitter);
  const sequence: string[] = [];
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk, controller) {
        if (!chunkEndSplit)
          chunk = [...sequence.splice(0, sequence.length), chunk].join("");
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
      },
    },
  ];
  return {
    args,
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
  const parts = separater.map(s => RegExp.escape(s)).join("|");
  return {
    separator: new RegExp(`(${parts})`, "ug"),
    checker: new RegExp(`^(${parts})$`),
  };
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
 * A TransformStream that splits incoming string chunks by specified delimiters
 * and emits each segment as a separate chunk.
 *
 * This stream allows splitting based on one or more delimiters (characters or strings),
 * and supports optional flushing at the end of each input chunk.
 *
 * Options:
 * - `splitter`: A string or array of strings used as delimiters.
 * - `chunkEndSplit`: If `true`, forces split and flush at the end of each input chunk.
 *
 * Empty segments resulting from splitting are automatically skipped.
 *
 * Example:
 * ```text
 *   Input chunk: "foo,bar|baz"
 *   Options: { splitter: [",", "|"], chunkEndSplit: true }
 *   Output chunks: ["foo", "bar", "baz"]
 * ```
 *
 * Useful for processing delimited text data such as CSV rows, log lines,
 * or command sequences.
 */
export class TextSplitStream extends TransformStream<string, string> {
  constructor(options: TextSplitStreamOptions) {
    const { args } = makeInternalTextSplitStream(options);
    super(...args);
  }
}
