interface RegExpConstructor {
  /**
   * The RegExp.escape() static method escapes any potential regex syntax characters in a string, and returns a new string that can be safely used as a literal pattern for the RegExp() constructor.
   * @param str The string to escape.
   * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
   */
  escape(str: string): string;
}

interface ReadableStream<R> {
  values(param?: { preventCancel?: boolean }): AsyncGenerator<R, void, undefined>;
  [Symbol.asyncIterator](): AsyncGenerator<R, void, undefined>;
}
