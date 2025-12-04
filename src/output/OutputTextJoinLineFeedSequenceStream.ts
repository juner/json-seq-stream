import { LF } from "../jsonlines.js";
import { TextJoinStream } from "./TextJoinStream.js";
import type { TextJoinStreamOptions } from "./TextJoinStream.js";

export type OutputTextJoinLineFeedSequenceStreamOptions = Partial<TextJoinStreamOptions>;

/**
 * Put LF between sequences Convert to a stream
 */

export class OutputTextJoinLineFeedSequenceStream extends TextJoinStream {
  constructor(options?: OutputTextJoinLineFeedSequenceStreamOptions) {
    let { delimiter, start: startSplit, end: endSplit, skip } = options ?? {};
    delimiter ??= LF;
    startSplit ??= false;
    endSplit ??= false;
    skip ??= true;
    super({ delimiter, start: startSplit, end: endSplit, skip });
  }
}
