import { StringifyStream } from "./StringifyStream.js";
import type { StringifyStreamOptions } from "./StringifyStream.js";

export type OutputJsonSequenceStringifyStreamOptions<T> = Partial<StringifyStreamOptions<T>>;

/**
 * Default error fallback: errors the stream, so stringify failures are not
 * silently dropped when producing output.
 */
function defaultErrorFallback(e: unknown, { error }: { error: (reason: unknown) => void }): void {
  error(e);
}

/**
 * 連続した `T` の sequence を string の sequence に変換する TransformStream
 *
 * By default, values that fail to stringify error the stream. Pass
 * `errorFallback: false` to skip them silently, or a custom handler to
 * control the behavior.
 */
export class OutputJsonSequenceStringifyStream<T> extends StringifyStream<T> {
  constructor(options?: OutputJsonSequenceStringifyStreamOptions<T>) {
    let { errorFallback, stringify } = options ?? {};
    const { writableStrategy, readableStrategy } = options ?? {};
    errorFallback ??= defaultErrorFallback;
    stringify ??= JSON.stringify;
    super({ stringify, errorFallback, writableStrategy, readableStrategy });
  }
}
