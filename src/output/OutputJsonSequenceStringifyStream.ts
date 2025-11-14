import { StringifyStream } from "./StringifyStream.js";
import type { StringifyStreamOptions } from "./StringifyStream.js";

export type OutputJsonSequenceStringifyStreamOptions<T> = Partial<StringifyStreamOptions<T>>;

/**
 * 連続した `T` の sequence を string の sequence に変換する TransformStream
 */
export class OutputJsonSequenceStringifyStream<T> extends StringifyStream<T> {
  constructor(options?: OutputJsonSequenceStringifyStreamOptions<T>) {
    let { errorFallback, stringify } = options ?? {};
    errorFallback ??= false;
    stringify ??= JSON.stringify;
    super({ stringify, errorFallback });
  }
}
