
import type { TransformStreamConstructor } from "./TransformStreamConstructor";

export type InputJsonSequenceFormatStreamOptions<T> = {
    parse?: (text: string) => (T | undefined),
    errorFallback?: false | ((
        error: unknown, args: {
            error: (reason: unknown) => void,
            chunk: string,
            enqueue: (arg: T) => void
        }) => (void | Promise<void>));
};


function makeInternalInputJsonSequenceFormatStream<T>({ parse, errorFallback }: InputJsonSequenceFormatStreamOptions<T> = {}): {
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
export class InputJsonSequenceFormatStream<T> extends TransformStream<string, T> {
    constructor(options: InputJsonSequenceFormatStreamOptions<T> = {}) {
        const { args } = makeInternalInputJsonSequenceFormatStream(options);
        super(...args);
    }
}

// #region deprecated remove v2.0.0 - 

/**
 * @deprecated rename to InputJsonSequenceFormatStreamOptions
 * @see InputJsonSequenceFormatStreamOptions
 */
export type JsonSequenceFormatStreamOptions<T> = InputJsonSequenceFormatStreamOptions<T>;

/**
 * @deprecated rename to InputJsonSequenceFormatStream
 * @see InputJsonSequenceFormatStream
 */
export const JsonSequenceFormatStream = InputJsonSequenceFormatStream;

// #endregion