/**
 * Options to customize the queuing strategies of a `TransformStream`-based class.
 *
 * - `writableStrategy`: Queuing strategy for the writable (input) side.
 * - `readableStrategy`: Queuing strategy for the readable (output) side.
 */
export type QueuingStrategiesOptions<I, O> = {
  /** queuing strategy for the writable (input) side */
  writableStrategy?: QueuingStrategy<I>
  /** queuing strategy for the readable (output) side */
  readableStrategy?: QueuingStrategy<O>
};

/**
 * Removes the queuing strategy options from an options type.
 * Used by composite (`ReadableWritablePair`) streams that cannot apply
 * strategies to every internal component.
 */
export type OmitQueuingStrategies<T> = Omit<T, keyof QueuingStrategiesOptions<unknown, unknown>>;
