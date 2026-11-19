/**
 * Pipes an `AsyncIterable` or `Iterable` into a `ReadableWritablePair` and
 * yields values from its `readable` side, properly cleaning up both the stream
 * and the source iterator when the consumer stops early (e.g. via `break`) or
 * when the source throws.
 */
export async function* pipeIterableThrough<I, W, O>(
  source: AsyncIterable<I> | Iterable<I>,
  stream: ReadableWritablePair<O, W>,
  mapChunk: (chunk: I) => W,
): AsyncGenerator<O, void, undefined> {
  const writer = stream.writable.getWriter();
  let stopped = false;

  const writePromise = (async () => {
    try {
      for await (const chunk of source) {
        await writer.write(mapChunk(chunk));
        if (stopped) return;
      }
      await writer.close();
    }
    catch (e) {
      await writer.abort(e);
    }
  })();

  try {
    yield* stream.readable;
  }
  finally {
    stopped = true;
    await writer.abort();
    await writePromise;
  }
}
