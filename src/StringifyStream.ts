import type { TransformStreamConstructor } from "./TransformStreamConstructor";

export type StringifyStreamOptions<T> = {
  stringify: (value: T) => (string | undefined),
  errorFallback: false | ((
    error: unknown, args: {
      error: (reason: unknown) => void,
      chunk: T,
      enqueue: (arg: string) => void
    }) => (void | Promise<void>));
};


function makeInternalStringifyStream<T>({ stringify, errorFallback }: StringifyStreamOptions<T>): {
  args: ConstructorParameters<TransformStreamConstructor<T, string>>
} {
  stringify ??= JSON.stringify;
  errorFallback ??= false;
  const args: ConstructorParameters<TransformStreamConstructor<T, string>> = [
    {
      transform(chunk, controller) {
        try {
          const result = stringify(chunk);
          if ((result?.length ?? 0) > 0) controller.enqueue(result);
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
 * 連続した `T` の sequence を string の sequence に変換する TransformStream
 */
export class StringifyStream<T> extends TransformStream<T, string> {
  constructor(options: StringifyStreamOptions<T>) {
    const { args } = makeInternalStringifyStream(options);
    super(...args);
  }
}
