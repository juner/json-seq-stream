import type { TransformStreamConstructor } from "../types/TransformStreamConstructor.js";

const modes = {
  begin: "begin",
  end: "end",
  record: "record",
  init: "init",
  flush: "flush",
} as const;

type Mode = typeof modes[keyof typeof modes]

export type RecordToSequenceStreamOptions = {
  begin: string;
  end: string;
  chunkEndSplit: boolean;
  fallbackSkip: true | false | ((minChunk: string, mode: Mode, next: Mode) => boolean);
};

function makeInternalInputRecordSequenceStream({ begin: recordBegin, end: recordEnd, chunkEndSplit, fallbackSkip }: RecordToSequenceStreamOptions): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  const sequence: string[] = [];
  const separater = new RegExp(`(${RegExp.escape(recordBegin)}|${RegExp.escape(recordEnd)})`, "u");
  const fallback = fallbackSkip === true ? (() => true)
    : fallbackSkip === false ? (() => false)
    : fallbackSkip;
  let mode: Mode = modes.init;
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk: string, controller: TransformStreamDefaultController<string>) {
        if (!chunkEndSplit)
          chunk = [...sequence.splice(0, sequence.length), chunk].join("");
        for (const c of chunk.split(separater)) {
          if (c === recordBegin) {
            const next = modes.begin;
            if (mode === modes.end || mode === undefined) {
              enqueue(sequence, controller);
              mode = next;
            } else if (!fallback(c, mode, next)){
              enqueue(sequence, controller);
              mode = next;
            }
            continue;
          }
          if (c === recordEnd) {
            const next = modes.end;
            if (mode === modes.record || mode === modes.begin) {
              enqueue(sequence, controller);
              mode = next;
            } else if (!fallback(c, mode, next)) {
              enqueue(sequence, controller);
              mode = next;
            }
            continue;
          }
          const next = modes.record;
          if (mode === modes.begin || mode === modes.record) {
            sequence.push(c);
            mode = next;
          } else if (!fallback(c, mode, modes.record)) {
            sequence.push(c);
            mode = next;
          }
        }
        if (!chunkEndSplit) return;
        enqueue(sequence, controller);
        mode = modes.end;
      },
      flush(controller: TransformStreamDefaultController<string>) {
        if (!fallback("", mode, modes.flush)) {
          enqueue(sequence, controller);
        }
      }
    }
  ];
  return {
    args,
  };

}

function enqueue(sequence: string[], controller: TransformStreamDefaultController<string>) {
  if (sequence.length <= 0) return;
  const enqueue = sequence.splice(0, sequence.length).join("");
  if (enqueue.length <= 0) return;
  controller.enqueue(enqueue);
}

/**
 * RS で始まって LF で1行を表す 連続した文字列データを 行データとして整形して返す
 */
export class RecordToSequenceStream extends TransformStream<string, string> {
  constructor(options: RecordToSequenceStreamOptions) {
    const { args } = makeInternalInputRecordSequenceStream(options);
    super(...args);
  }
}
