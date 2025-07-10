import type { TransformStreamConstructor } from "./TransformStreamConstructor.ts";

const LINE_BEGIN = '\u00e1';
const LINE_END = '\n';

export type SequenceStreamOptions = {
    lineBegin?: string;
    lineEnd?: string;
};
function makeInternalSequenceStream({ lineBegin, lineEnd }: SequenceStreamOptions = {}): {
    args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
    lineBegin ??= LINE_BEGIN;
    lineEnd ??= LINE_END;
    const sequence: string[] = [];
    const separater = new RegExp(`(${RegExp.escape(lineBegin)}|${RegExp.escape(lineEnd)})`, "u");
    const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
        {
            transform(chunk: string, controller: TransformStreamDefaultController<string>) {
                for (const c of chunk.split(separater)) {
                    if (c === lineBegin) {
                        const enqueue = enqueueSequence(sequence);
                        if (enqueue.length <= 0) continue;
                        controller.enqueue(enqueue);
                        continue;
                    }
                    if (c === lineEnd) {
                        continue;
                    }
                    sequence.push(c);
                }
            },
            flush(controller: TransformStreamDefaultController<string>) {
                const enqueue = enqueueSequence(sequence);
                if (enqueue.length <= 0) return;
                controller.enqueue(enqueue);
            }
        }
    ];
    return {
        args,
    };

    function enqueueSequence(sequence: string[]) {
        return sequence.splice(0, sequence.length).join("");
    }
}
/**
 * RS で始まって LF で1行を表す 連続した文字列データを 行データとして整形して返す
 */
export class SequenceStream extends TransformStream<string, string> {
    constructor(options?: SequenceStreamOptions) {
        const { args } = makeInternalSequenceStream(options);
        super(...args);
    }
}