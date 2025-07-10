import type { TransformStreamConstructor } from "./TransformStreamConstructor.ts";

const LINE_BEGIN = 30;
const LINE_END = 10;

export type SequenceStreamOptions = {
    lineBegin?: number;
    lineEnd?: number;
};
function makeInternalSequenceStream({ lineBegin, lineEnd }: SequenceStreamOptions = {}): {
    args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
    lineBegin ??= LINE_BEGIN;
    lineEnd ??= LINE_END;
    const begin = String.fromCodePoint(lineBegin);
    const end = String.fromCodePoint(lineEnd);
    const sequence: string[] = [];
    const separater = new RegExp(`(${RegExp.escape(begin)}|${RegExp.escape(end)})`, "u");
    const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
        {
            transform(chunk: string, controller: TransformStreamDefaultController<string>) {
                for (const c of chunk.split(separater)) {
                    if (c === begin) {
                        const enqueue = enqueueSequence(sequence);
                        if (enqueue.length <= 0) continue;
                        controller.enqueue(enqueue);
                        continue;
                    }
                    if (c === end) {
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
        if (sequence[sequence.length - 1] === end) {
            let pos = sequence.length - 1;
            for (let index = sequence.length - 2; index > 0; index--) {
                if (sequence[index] !== end) break;
                pos = index;
            }
            sequence.splice(pos, sequence.length - pos);
        }
        return sequence.splice(0, sequence.length).join("");
    }
}
export class SequenceStream extends TransformStream<string, string> {
    constructor(options?: SequenceStreamOptions) {
        const { args } = makeInternalSequenceStream(options);
        super(...args);
    }
}