import { ParseStream } from "./ParseStream.js";
import type { ParseStreamOptions } from "./ParseStream.js";

export type InputJsonSequenceParseStreamOptions<T> = Partial<ParseStreamOptions<T>>;

/**
 * string の sequence を 連続した `T` の sequence に変換する TransformStream
 */
export class InputJsonSequenceParseStream<T> extends ParseStream<T> {
  constructor(options?: InputJsonSequenceParseStreamOptions<T>) {
    let {errorFallback, parse} = options ?? {};
    parse ??= JSON.parse;
    errorFallback ??= false;
    super({parse, errorFallback});
  }
}

// #region deprecated remove v2.0.0 -

/**
 * @deprecated rename to InputJsonSequenceFormatStreamOptions
 * @see InputJsonSequenceParseStreamOptions
 */
export type JsonSequenceFormatStreamOptions<T> = InputJsonSequenceParseStreamOptions<T>;

/**
 * @deprecated rename to InputJsonSequenceFormatStream
 * @see InputJsonSequenceParseStream
 */
export const JsonSequenceFormatStream = InputJsonSequenceParseStream;

// #endregion
