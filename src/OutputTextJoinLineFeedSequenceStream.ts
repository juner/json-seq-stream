import { LF } from "./jsonlines";
import { TextJoinStream, TextJoinStreamOptions } from "./TextJoinStream";

/**
 * Put LF between sequences Convert to a stream
 */

export class OutputTextJoinLineFeedSequenceStream extends TextJoinStream {
  constructor(options?: Partial<TextJoinStreamOptions>) {

    let { delimiter, start: startSplit, end: endSplit, skip } = options ?? {};
    delimiter ??= LF;
    startSplit ??= false;
    endSplit ??= false;
    skip ??= true;
    super({ delimiter, start: startSplit, end: endSplit, skip });
  }
}
