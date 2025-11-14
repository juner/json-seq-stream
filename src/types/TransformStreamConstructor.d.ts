export type TransformStreamConstructor<I, O> = new (transformer?: Transformer<I, O>, writableStrategy?: QueuingStrategy<I>, readableStrategy?: QueuingStrategy<O>) => TransformStream<I, O>;
