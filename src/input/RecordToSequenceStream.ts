import type { QueuingStrategiesOptions } from "../types/index.js";
import type { TransformStreamConstructor } from "../types/TransformStreamConstructor.js";
import { escapeRegExp } from "../internal/escapeRegExp.js";

const modes = {
  begin: "begin",
  end: "end",
  record: "record",
  init: "init",
  flush: "flush",
} as const;

type Mode = typeof modes[keyof typeof modes];

export type RecordToSequenceStreamOptions = {
  begin: string
  end: string
  chunkEndSplit: boolean
  fallbackSkip: true | false | ((minChunk: string, mode: Mode, next: Mode) => boolean)
  /** maximum allowed length for a single record */
  maxLength?: number
} & QueuingStrategiesOptions<string, string>;

function getTrailingPrefixLength(text: string, target: string): number {
  const maxLen = Math.min(text.length, target.length - 1);
  for (let len = maxLen; len > 0; len--) {
    if (text.endsWith(target.slice(0, len))) {
      return len;
    }
  }
  return 0;
}

function isJsonBalanced(text: string): boolean {
  const trimmed = text.trimStart();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return true;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (const ch of trimmed) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") depth--;
  }
  return depth <= 0;
}

function makeInternalInputRecordSequenceStream({ begin: recordBegin, end: recordEnd, chunkEndSplit, fallbackSkip, maxLength, writableStrategy, readableStrategy }: RecordToSequenceStreamOptions): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  const sequence: string[] = [];
  let carry = "";
  const parts = [recordBegin, recordEnd]
    .sort((a, b) => b.length - a.length)
    .map(s => escapeRegExp(s))
    .join("|");
  const separator = new RegExp(`(${parts})`, "u");
  const fallback = fallbackSkip === true
    ? () => true
    : fallbackSkip === false
      ? () => false
      : fallbackSkip;
  let mode: Mode = modes.init;
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk: string, controller: TransformStreamDefaultController<string>) {
        if (!chunkEndSplit) {
          chunk = [...sequence.splice(0, sequence.length), carry, chunk].join("");
          carry = "";
        }
        const tokens = chunk.split(separator);
        for (let i = 0; i < tokens.length; i++) {
          let c = tokens[i];
          if (c === recordBegin) {
            const next = modes.begin;
            if (mode === modes.end || mode === modes.init) {
              enqueue(sequence, controller);
              mode = next;
            }
            else if (!fallback(c, mode, next)) {
              enqueue(sequence, controller);
              mode = next;
            }
            else {
              sequence.splice(0, sequence.length);
              mode = next;
            }
            continue;
          }
          if (c === recordEnd) {
            const next = modes.end;
            if (mode === modes.record || mode === modes.begin) {
              if (!isJsonBalanced(sequence.join(""))) {
                sequence.push(c);
                continue;
              }
              enqueue(sequence, controller);
              mode = next;
            }
            else if (!fallback(c, mode, next)) {
              enqueue(sequence, controller);
              mode = next;
            }
            continue;
          }
          if (!chunkEndSplit && i === tokens.length - 1 && (mode === modes.init || mode === modes.end)) {
            const prefixLen = getTrailingPrefixLength(c, recordBegin);
            if (prefixLen > 0) {
              carry = c.slice(c.length - prefixLen);
              c = c.slice(0, c.length - prefixLen);
            }
          }
          if (c.length <= 0) continue;
          const next = modes.record;
          if (mode === modes.begin || mode === modes.record) {
            sequence.push(c);
            mode = next;
          }
          else if (!fallback(c, mode, modes.record)) {
            sequence.push(c);
            mode = next;
          }
          if (maxLength !== undefined && sequence.join("").length > maxLength) {
            sequence.splice(0, sequence.length);
            controller.error(new RangeError(`Maximum length (${maxLength}) exceeded`));
            return;
          }
        }
        if (!chunkEndSplit) return;
        if (!fallback("", mode, modes.flush)) {
          enqueue(sequence, controller);
        }
        else {
          sequence.splice(0, sequence.length);
        }
        mode = modes.end;
      },
      flush(controller: TransformStreamDefaultController<string>) {
        if (carry.length > 0 && !fallback(carry, mode, modes.record)) {
          sequence.push(carry);
          mode = modes.record;
        }
        if (!fallback("", mode, modes.flush)) {
          enqueue(sequence, controller);
        }
      },
    },
    writableStrategy,
    readableStrategy,
  ];
  return {
    args,
  };
}

function enqueue(sequence: string[], controller: TransformStreamDefaultController<string>) {
  if (sequence.length <= 0) return;
  const enqueue = sequence.splice(0, sequence.length).join("");
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
