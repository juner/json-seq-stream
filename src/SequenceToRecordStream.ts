import type { TransformStreamConstructor } from "./TransformStreamConstructor";

export type SequenceToRecordStreamOptions = {
  /** record begin character */
  begin: string;
  /** record end character */
  end: string;
  /** empty chunk skip enable */
  skip: boolean;
};

function makeInternalSequenceToRecordStream({ begin: recordBegin, end: recordEnd, skip: emptySkip }: SequenceToRecordStreamOptions): {
  args: ConstructorParameters<TransformStreamConstructor<string, string>>
} {
  const args: ConstructorParameters<TransformStreamConstructor<string, string>> = [
    {
      transform(chunk: string, controller: TransformStreamDefaultController<string>) {
        if (emptySkip && chunk.length <= 0) return;
        controller.enqueue(recordBegin);
        controller.enqueue(chunk);
        controller.enqueue(recordEnd);
      },
    }
  ];
  return {
    args,
  };
}

export class SequenceToRecordStream extends TransformStream<string, string> {
  constructor(options: SequenceToRecordStreamOptions) {
    const { args } = makeInternalSequenceToRecordStream(options);
    super(...args);
  }
}
