import type { TransformStreamConstructor } from "../types/TransformStreamConstructor.js";

export type StringifyStreamOptions<T> = {
  /** A function that converts a `T` value to a string (synchronously or asynchronously). */
  stringify: (value: T) => (string | undefined | Promise<string | undefined>)
  /**
   * A function that handles errors during stringification. It receives the error,
   * the original value, and helper methods (`enqueue`, `error`) to control the stream behavior.
   * If set to `false`, errors are silently ignored.
   */
  errorFallback: false | ((
    error: unknown, args: {
      error: (reason: unknown) => void
      chunk: T
      enqueue: (arg: string) => void
    }) => (void | Promise<void>))
};

function makeInternalStringifyStream<T>({ stringify, errorFallback }: StringifyStreamOptions<T>): {
  args: ConstructorParameters<TransformStreamConstructor<T, string>>
} {
  const args: ConstructorParameters<TransformStreamConstructor<T, string>> = [
    {
      async transform(chunk, controller) {
        try {
          const result = await stringify(chunk);
          if (result !== undefined) controller.enqueue(result);
        }
        catch (e: unknown) {
          if (!errorFallback) return;
          const error = controller.error.bind(controller);
          const enqueue = controller.enqueue.bind(controller);
          try {
            await errorFallback(e, { chunk, error, enqueue });
          }
          catch {
            return;
          }
        }
      },
    },
  ];
  return { args };
}

/**
 * A TransformStream that converts typed values of type `T` into string chunks using a
 * customizable stringifier function.
 *
 * This stream applies a user-provided `stringify` function to each incoming `T` value.
 * If the function returns a string (not `undefined`), it is emitted as output.
 * If the stringification process throws an error, an optional `errorFallback` handler
 * can be used to recover or handle the error.
 *
 * Options:
 * - `stringify`: A function that converts a `T` value to a string.
 * - `errorFallback`: A function that handles errors during stringification. It receives the error,
 *   the original value, and helper methods (`enqueue`, `error`) to control the stream behavior.
 *   If set to `false`, errors are silently ignored.
 *
 * Example use case:
 *   - Serializing structured data into newline-delimited JSON (NDJSON)
 *   - Converting typed messages into protocol-specific text formats
 *
 * Example:
 * ```text
 *   Input chunks: [{ id: 1 }, { id: 2 }, CircularRefObject]
 *   stringify: JSON.stringify
 *   errorFallback: (err, { chunk }) => console.warn("Failed to stringify:", chunk)
 *   Output: ['{"id":1}', '{"id":2}']
 * ```
 */
export class StringifyStream<T> extends TransformStream<T, string> {
  constructor(options: StringifyStreamOptions<T>) {
    const { args } = makeInternalStringifyStream(options);
    super(...args);
  }
}
