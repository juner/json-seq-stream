import { LF } from "./jsonlines";
import { TextJoinStream } from "./TextJoinStream";
import type { TextJoinStreamOptions } from "./TextJoinStream";

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
