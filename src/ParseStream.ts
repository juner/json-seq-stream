
import type { TransformStreamConstructor } from "./TransformStreamConstructor";

export type ParseStreamOptions<T> = {
  parse: (text: string) => (T | undefined),
  errorFallback: false | ((
    error: unknown, args: {
      error: (reason: unknown) => void,
      chunk: string,
      enqueue: (arg: T) => void
    }) => (void | Promise<void>));
};


function makeInternalParseStream<T>({ parse, errorFallback }: ParseStreamOptions<T>): {
  args: ConstructorParameters<TransformStreamConstructor<string, T>>
} {
  parse ??= JSON.parse;
  errorFallback ??= false;
  const args: ConstructorParameters<TransformStreamConstructor<string, T>> = [
    {
      transform(chunk, controller) {
        try {
          const result = parse(chunk);
          if (result) controller.enqueue(result);
        } catch (e: unknown) {
          if (!errorFallback) return;
          const error = controller.error.bind(controller);
          const enqueue = controller.enqueue.bind(controller);
          const reuslt = errorFallback(e, { chunk, error, enqueue });
          if (reuslt?.then)
            return reuslt.catch(() => undefined);
        }
      }
    }
  ];
  return { args };
}

/**
 * string の sequence を 連続した `T` の sequence に変換する TransformStream
 */
export class ParseStream<T> extends TransformStream<string, T> {
  constructor(options: ParseStreamOptions<T>) {
    const { args } = makeInternalParseStream(options);
    super(...args);
  }
}
