# CHANGELOG

## v1.0.9

- [npm:json-seq-stream@1.0.9](https://www.npmjs.com/package/json-seq-stream/v/1.0.9)
- [github:juner/json-seq/stream/release/tag/v1.0.9](https://github.com/juner/json-seq-stream/releases/tag/v1.0.9)

- release
  - 2025/11/13

- fix
  - fix: use modern esm type resolution for consumers with NodeNext [!9](https://github.com/juner/json-seq-stream/pull/9)

## v1.0.8

🐛 Bug fix for record separator (RS).

- [npm:json-seq-stream@1.0.8](https://www.npmjs.com/package/json-seq-stream/v/1.0.8)  
- [github:juner/json-seq-stream/releases/tag/v1.0.8](https://github.com/juner/json-seq-stream/releases/tag/v1.0.8)

- release  
  - 2025/08/29  

- fix  
  - Incorrectly used `\u00e1` instead of the correct `\u001e` for RS (Record Separator). 

## v1.0.7

🚀 Supports `application/jsonl` (JSON Lines) and `application/x-ndjson` (NDJSON) and some generalization of functionality.

- [npm:json-seq-stream@1.0.7](https://www.npmjs.com/package/json-seq-stream/v/1.0.7)
- [github:juner/json-seq-stream/releases/tag/v1.0.7](https://github.com/juner/json-seq-stream/releases/tag/v1.0.7)

- release
  - 2025/07/17

- design
  - Generalized core transformation streams (`ParseStream`, `StringifyStream`, etc.)
    - These now form the base of higher-level format-specific classes
    - Options required for instantiation
- docs
  - Updated `README.md` with JSON Lines usage examples
- rename
  - `InputSequenceStream` -> `InputRecordSequenceStream`
    - sequence -> record sequence
  - `OutputJsonSequenceStfingifyStream<T>` -> `OutputJsonSequenceStringifyStream<T>`
    - typo
  - `OutputSequenceStream` -> `OutputRecordSequenceStream`
    - sequence -> record sequence
- new feature
  - `InputJsonLinesStream<T>`
    - `application/jsonl` (JSON Lines) / `application/x-ndjson` (NDJSON) binary -> object `T` sequence
  - `OutputJsonLinesStream<T>`
    - object `T` sequence -> `application/jsonl` (JSON Lines) / `application/x-ndjson` (NDJSON) binary
  - `InputLineFeedSeparattedSequenceStream`
    - `LF` (or `CRLF`) seprated `<TEXT>` chunk -> `<TEXT>` sequence
    - base of NDJSON / JSONL parsing logic
  - `OutputRecordSequenceStream`
    - `<TEXT>` sequence -> `RS` `<TEXT>` `LF` chunks
  - `OutputTextJoinLineFeedSequenceStream`
    - `<TEXT>` sequence -> `LF` separeted `<TEXT>` chunks
    - base of NDJSON / JSONL parsing logic
  - `ParseStream<T>`
    - general: `<TEXT>` sequence -> object `T` sequence
  - `RecordToSequenceStream`
    - general: `BEGIN` `<TEXT>` `END` chunks -> `<TEXT>` sequence
  - `SequenceToRecordStream`
    - general: `<TEXT>` sequence -> `BEGIN` `<TEXT>` `END` chunks
  - `StringifyStream<T>`
    - general: object `T` sequence -> `<TEXT>` sequence
  - `TextJoinStream`
    - general: `<TEXT>` sequence -> `DELIMITER` separeted `<TEXT>` chunks
    - useful for composing structured output (e.g., for logging or NDJSON)
  - `TextSplitStream`
    - general: `DELIMITER` separeted `<TEXT>` chunks -> `<TEXT>` sequence
    - useful for parsing plain delimited logs, TSV/CSV-style streams
- deprecated (to be removed in v2.0.0)
  - `InputSequenceStream`
    - rename after `InputRecordSequenceStream`
  - `OutputJsonSequenceStfingifyStream<T>`
    - rename after `OutputJsonSequenceStringifyStream<T>`
  - `OutputSequenceStream`
    - rename after `OutputRecordSequenceStream`

## v1.0.6

🚀 Both input and output of application/json-seq are now supported.

- [npm:json-seq-stream@1.0.6](https://www.npmjs.com/package/json-seq-stream/v/1.0.6)
- [github:juner/json-seq-stream/releases/tag/v1.0.6](https://github.com/juner/json-seq-stream/releases/tag/v1.0.6)

- release
  - 2025/07/15

- rename
  - `JsonSequenceFormatStream<T>` -> `InputJsonSequenceParseStream<T>`
    - add `Input` prefix
  - `JsonSequenceStream<T>` -> `InputJsonSequenceStream<T>`
    - add `Input` prefix
  - `SequenceStream` -> `InputSequenceStream`
    - add `Input` prefix
- new features
  - `OutputJsonSequenceStfingifyStream<T>`
    - object `T` Sequence -> `JSON Text <T>`
  - `OutputJsonSequenceStream<T>`
    - object `T` Sequence -> `application/json-seq` (json sequence) binary
  - `OutputSequenceStream`
    - `<TEXT>` sequence -> `RS` `<TEXT>` `LF` chunks
- deprecated (to be removed in v2.0.0)
  - `JsonSequenceFormatStream<T>`
  　 - rename after `InputJsonSequenceParseStream<T>`
  - `JsonSequenceStream<T>`
  　 - rename after `InputJsonSequenceStream<T>`
  - `SequenceStream`
  　 - rename after `InputSequenceStream`

## v1.0.5

🚀 First working release

- [npm:json-seq-stream@1.0.5](https://www.npmjs.com/package/json-seq-stream/v/1.0.5)

- release
  - 2025/07/10

- new features
  - `JsonSequenceFormatStream<T>`
    - `JSON Text <T>` Sequence -> object `T` Sequence
  - `JsonSequenceStream<T>`
    - `application/json-seq` (json sequence) binary -> object `T` Sequence
  - `SequenceStream`
    - `RS` `<TEXT>` `LF` chunks -> `<TEXT>` Sequence
