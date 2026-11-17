interface ReadableStream<R> {
  values(param?: { preventCancel?: boolean }): AsyncGenerator<R, void, undefined>
  [Symbol.asyncIterator](): AsyncGenerator<R, void, undefined>
}
