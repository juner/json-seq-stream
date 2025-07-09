const LINE_BEGIN = 30;
const LINE_END = 10;

const SEARCH_LINE_BEGIN = "begin";
const SEARCH_LINE_END = "end";

type SearchMode = typeof SEARCH_LINE_BEGIN | typeof SEARCH_LINE_END;

TextDecoderStream

export type JsonSequenceStreamOptions = {
    lineBegin: number;
    lineEnd: number;
};

export class SequenceStream extends TransformStream<string, string> {
    constructor({ lineBegin, lineEnd }: { lineBegin?: number, lineEnd?: number } = {}) {
        lineBegin ??= LINE_BEGIN;
        lineEnd ??= LINE_END;
        const begin = String.fromCodePoint(lineBegin);
        const end = String.fromCodePoint(lineEnd);
        let seuqnce: string[] = [];
        let mode: SearchMode = SEARCH_LINE_BEGIN;
        let separater = new RegExp(`(${RegExp.escape(begin)}|${RegExp.escape(end)})`, "u");
        super({
            transform(chunk, controller) {
                for (const c of chunk.split(separater)) {
                    switch (mode) {
                        case SEARCH_LINE_BEGIN:
                            if (c === begin) {
                                mode = SEARCH_LINE_BEGIN;
                                continue;
                            }
                        case SEARCH_LINE_END:
                            if (c === end) {
                                controller.enqueue(seuqnce.splice(0, seuqnce.length).join(""));
                                continue;
                            }
                            seuqnce.push(c);
                    }
                }
            }
        });


    }
}
const defaultOption: JsonSequenceStreamOptions = {
    lineBegin: LINE_BEGIN,
    lineEnd: LINE_END,
}

export class JsonSequenceStream<T> extends TransformStream<Uint8Array<ArrayBufferLike>, T> {
    constructor(options: Partial<JsonSequenceStreamOptions>) {
        super(
            {
                transform(chunk, controller) {

                }
            }
        )
    }
}