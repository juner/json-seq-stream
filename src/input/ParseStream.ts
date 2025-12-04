import type { TransformStreamConstructor } from "../types/index.js";

export type ParseStreamOptions<T> = {
  /** A function that converts a string to type `T`. */
  parse: (text: string) => (T | undefined)
  /**
   * A function that handles parse errors. It receives the error,
   * the original chunk, and helper methods (`enqueue`, `error`) to control the stream behavior.
   * If set to `false`, parse errors are silently ignored.
   */
  errorFallback: false | ((
    error: unknown, args: {
      error: (reason: unknown) => void
      chunk: string
      enqueue: (arg: T) => void
    }) => (void | Promise<void>))
};

function makeInternalParseStream<T>({ parse, errorFallback }: ParseStreamOptions<T>): {
  args: ConstructorParameters<TransformStreamConstructor<string, T>>
} {
  const args: ConstructorParameters<TransformStreamConstructor<string, T>> = [
    {
      transform(chunk, controller) {
        try {
          const result = parse(chunk);
          if (result) controller.enqueue(result);
        }
        catch (e: unknown) {
          if (!errorFallback) return;
          const error = controller.error.bind(controller);
          const enqueue = controller.enqueue.bind(controller);
          const reuslt = errorFallback(e, { chunk, error, enqueue });
          if (reuslt?.then)
            return reuslt.catch(() => undefined);
        }
      },
    },
  ];
  return { args };
}

/**
 * A TransformStream that parses incoming string chunks into typed values of type `T`.
 *
 * This stream attempts to apply a user-provided `parse` function to each input chunk.
 * If the parsing succeeds and returns a value (not `undefined`), it is enqueued.
 * If parsing fails (throws an error), an optional `errorFallback` handler can be used
 * to recover or handle the error.
 *
 * Options:
 * - `parse`: A function that converts a string to type `T`.
 * - `errorFallback`: A function that handles parse errors. It receives the error,
 *   the original chunk, and helper methods (`enqueue`, `error`) to control the stream behavior.
 *   If set to `false`, parse errors are silently ignored.
 *
 * Example use case:
 *   - Parsing newline-delimited JSON objects from a text stream.
 *   - Custom deserialization of structured text messages.
 *
 * Example:
 * ```text
 *   Input chunks: ['{"id":1}', '{"id":2}', 'INVALID']
 *   parse: JSON.parse
 *   errorFallback: (err, { chunk }) => console.warn("Failed to parse:", chunk)
 *   Output: [{ id: 1 }, { id: 2 }]
 * ```
 */
export class ParseStream<T> extends TransformStream<string, T> {
  constructor(options: ParseStreamOptions<T>) {
    const { args } = makeInternalParseStream(options);
    super(...args);
  }
}
