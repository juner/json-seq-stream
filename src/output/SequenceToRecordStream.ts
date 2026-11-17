import type { QueuingStrategiesOptions } from "../types/index.js";
import type { TransformStreamConstructor } from "../types/TransformStreamConstructor.js";

export type SequenceToRecordStreamOptions = {
  /** record begin character */
  begin: string
  /** record end character */
  end: string
  /** empty chunk skip enable */
  skip: boolean
} & QueuingStrategiesOptions<string, string>;

function makeInternalSequenceToRecordStream({ begin: recordBegin, end: recordEnd, skip: emptySkip, writableStrategy, readableStrategy }: SequenceToRecordStreamOptions): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk: string, controller: TransformStreamDefaultController<string>) {
        if (emptySkip && chunk.length <= 0) return;
        controller.enqueue(recordBegin);
        controller.enqueue(chunk);
        controller.enqueue(recordEnd);
      },
    },
    writableStrategy,
    readableStrategy,
  ];
  return {
    args,
  };
}

/**
 * A TransformStream that wraps each input string chunk with a specified begin and end delimiter,
 * optionally skipping empty chunks.
 *
 * This stream is useful for converting plain string sequences into delimited records, such as
 * preparing data for structured streaming protocols or framing messages.
 *
 * Example:
 * ```example:text
 *   Input chunks: ["foo", "", "bar"]
 *   With begin = "<", end = ">", and skip = true
 *   Output chunks: ["<", "foo", ">", "<", "bar", ">"]
 * ```
 */
export class SequenceToRecordStream extends TransformStream<string, string> {
  constructor(options: SequenceToRecordStreamOptions) {
    const { args } = makeInternalSequenceToRecordStream(options);
    super(...args);
  }
}
