
import type { TransformStreamConstructor } from "./TransformStreamConstructor.ts";

export type JsonSequenceStreamOptions<T> = {
    parse?: (text: string) => (T | undefined),
    errorFallback?: false | ((
        error: unknown, args: {
            error: (reason: unknown) => void,
            chunk: string,
            enqueue: (arg: T) => void
        }) => (void | Promise<void>));
};

function errorSkip() { }

function makeInternalJsonSequenceStream<T>({ parse, errorFallback }: JsonSequenceStreamOptions<T> = {}): {
    args: ConstructorParameters<TransformStreamConstructor<string, T>>
} {
    parse ??= JSON.parse;
    errorFallback ??= errorSkip;
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
                    return errorFallback(e, { chunk, error, enqueue });
                }
            }
        }
    ];
    return { args };
}

/**
 * string の sequence を 連続した `T` の sequence に変換する TransformStream
 */
export class JsonSequenceStream<T> extends TransformStream<string, T> {
    constructor(options: JsonSequenceStreamOptions<T> = {}) {
        const { args } = makeInternalJsonSequenceStream(options);
        super(...args);
    }
}