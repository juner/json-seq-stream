import type { TransformStreamConstructor } from "./TransformStreamConstructor";

export type TextJoinStreamOptions = {
  /** delimiter character */
  delimiter: string;
  /** insert a delimiter at the start */
  start: boolean;
  /** insert a delimiter at the end */
  end: boolean;
  /** skip empty string chunks */
  skip: boolean;
}

function makeInternalTextJoinStream({ delimiter, start: startSplit, end: endSplit, skip: skipEmpty }: TextJoinStreamOptions): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  let firstChunk = true;
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk, controller) {
        if (skipEmpty && chunk.length <= 0) return;
        if (firstChunk) {
          if (startSplit)
            controller.enqueue(delimiter);
          firstChunk = false;
        } else {
          controller.enqueue(delimiter);
        }
        controller.enqueue(chunk);
      },
      flush(controller: TransformStreamDefaultController<string>) {
        if (firstChunk) return;
        if (!endSplit) return;
        controller.enqueue(delimiter);
      }
    }
  ];
  return {
    args
  };
}

/**
 * A TransformStream that joins incoming string chunks using a specified delimiter.
 *
 * This stream inserts the delimiter between chunks, and can optionally:
 * - insert a delimiter at the start (`start: true`)
 * - insert a delimiter at the end (`end: true`)
 * - skip empty string chunks (`skip: true`)
 *
 * This is useful for constructing joined strings from a stream of segments,
 * such as building CSV lines, JSON arrays, or custom formatted output.
 *
 * Example:
 * ```text
 *   Input chunks: ["foo", "bar", "baz"]
 *   Options: { delimiter: ",", start: false, end: true, skip: false }
 *   Output chunks: ["foo", ",", "bar", ",", "baz", ","]
 * ```
 */
export class TextJoinStream extends TransformStream<string, string> {
  constructor(options: TextJoinStreamOptions) {
    const { args } = makeInternalTextJoinStream(options);
    super(...args);
  }
}
