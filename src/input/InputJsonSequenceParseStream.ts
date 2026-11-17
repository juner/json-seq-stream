import { ParseStream } from "./ParseStream.js";
import type { ParseStreamOptions } from "./ParseStream.js";

export type InputJsonSequenceParseStreamOptions<T> = Partial<ParseStreamOptions<T>>;

function defaultParse<T>(text: string): T | undefined {
  if (text.trim().length <= 0) return undefined;
  return JSON.parse(text) as T;
}

/**
 * Default error fallback: skips the record and warns, as required by
 * RFC 7464 section 2.1 (parsers must not abort on malformed texts and
 * should signal them to the application).
 */
function defaultErrorFallback(error: unknown, { chunk }: { chunk: string }): void {
  console.warn("json-seq-stream: failed to parse JSON text; the record was skipped.", { chunk, error });
}

/**
 * string の sequence を 連続した `T` の sequence に変換する TransformStream
 *
 * By default, records that fail to parse are skipped with a `console.warn`
 * (RFC 7464 section 2.1). Pass `errorFallback: false` to skip silently, or a
 * custom handler to control the behavior.
 */
export class InputJsonSequenceParseStream<T> extends ParseStream<T> {
  constructor(options?: InputJsonSequenceParseStreamOptions<T>) {
    let { errorFallback, parse } = options ?? {};
    const { writableStrategy, readableStrategy } = options ?? {};
    parse ??= defaultParse;
    errorFallback ??= defaultErrorFallback;
    super({ parse, errorFallback, writableStrategy, readableStrategy });
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
/**
 * @deprecated rename to InputJsonSequenceFormatStream
 * @see InputJsonSequenceParseStream
 */
export type JsonSequenceFormatStream<T> = InputJsonSequenceParseStream<T>;

// #endregion
