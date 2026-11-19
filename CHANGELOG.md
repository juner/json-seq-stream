# CHANGELOG

## v2.0.1

- [npm:json-seq-stream@2.0.1](https://www.npmjs.com/package/json-seq-stream/v/2.0.1)
- [github:juner/json-seq-stream/releases/tag/v2.0.1](https://github.com/juner/json-seq-stream/releases/tag/v2.0.1)

- release
  - 2026/11/19

- fix
  - Cleanly abort the internal writable stream and close the upstream iterator when consumers stop early (e.g. `break` in `for await ... of`) or when the stream errors in `parseJsonSequence`, `parseJsonLines`, `stringifyJsonSequence`, and `stringifyJsonLines`, preventing unhandled promise rejections and hanging loops

- docs
  - Add `Response` and `Request` streaming examples for output streams in `README.md`

- dev
  - Update devDependencies, GitHub Actions (`actions/checkout@v7`, `actions/setup-node@v7`), and build/lint configurations
  - Replace deprecated ESLint `ignores` configuration with `globalIgnores`


## v2.0.0

- [npm:json-seq-stream@2.0.0](https://www.npmjs.com/package/json-seq-stream/v/2.0.0)
- [github:juner/json-seq-stream/releases/tag/v2.0.0](https://github.com/juner/json-seq-stream/releases/tag/v2.0.0)

- release
  - 2026/11/17

- new feature
  - `parseJsonResponse<T>` / `detectJsonStreamFormat`
    - Parse a `fetch()` `Response` by detecting the streaming JSON format from its `Content-Type` header (`application/json-seq`, `application/jsonl`, `application/x-ndjson`), with a `format` option to override detection
  - `writableStrategy` / `readableStrategy` options
    - Customize the queuing strategies of all `TransformStream`-based classes; composite streams forward the strategy of their typed boundary (`readableStrategy` on `Input*`, `writableStrategy` on `Output*`)
  - `truncationFallback` option
    - Control how an unterminated final record is handled at stream end (RFC 7464 §2.4) in `RecordToSequenceStream`, `InputRecordSequenceStream`, and `InputJsonSequenceStream`: enqueue as-is (default), drop (`false`), or decide via callback
  - `NDJSON_MIME_TYPE` constant (`application/x-ndjson`) in `jsonlines.ts`
  - Subpath exports for format constants
    - `json-seq-stream/rfc7464` (`RS`, `LF`, `MIME_TYPE`) and `json-seq-stream/jsonlines` (`LF`, `CRLF`, `MIME_TYPE`, `NDJSON_MIME_TYPE`, `EXTENSION`), keeping the main entry free of constant exports
  - `parseJsonSequence<T>` / `stringifyJsonSequence<T>`
    - Async generator helpers for `application/json-seq` (`AsyncIterable` / `Iterable` support)
  - `parseJsonLines<T>` / `stringifyJsonLines<T>`
    - Async generator helpers for `application/jsonl` / `application/x-ndjson` (`AsyncIterable` / `Iterable` support)
  - `maxLength` option
    - Limit maximum buffer length per segment/record in `TextSplitStream`, `RecordToSequenceStream`, `InputLineFeedSeparatedSequenceStream`, `InputRecordSequenceStream`, `InputJsonLinesStream`, and `InputJsonSequenceStream`
  - Async `parse` and `stringify` functions
    - Support returning `Promise` in `ParseStream<T>` and `StringifyStream<T>`
  - Multi-line JSON and truncated record support
    - Support pretty-printed (multi-line) JSON objects/arrays and recover from truncated records on the next `RS` in `RecordToSequenceStream` / `InputJsonSequenceStream`

- breaking change
  - Default `errorFallback` behavior changed
    - Input (`InputJsonSequenceParseStream`, `InputJsonSequenceStream`, `InputJsonLinesStream`): records that fail to parse are skipped with a `console.warn` (RFC 7464 §2.1) instead of silently
    - Output (`OutputJsonSequenceStringifyStream`, `OutputJsonSequenceStream`, `OutputJsonLinesStream`): values that fail to stringify now error the stream instead of being silently dropped
    - Pass `errorFallback: false` to restore the previous silent-skip behavior
  - Removed deprecated v1.x aliases (scheduled for removal in v2.0.0)
    - `JsonSequenceFormatStream` / `JsonSequenceFormatStreamOptions` -> use `InputJsonSequenceParseStream` / `InputJsonSequenceParseStreamOptions`
    - `JsonSequenceStream` / `JsonSequenceStreamOptions` -> use `InputJsonSequenceStream` / `InputJsonSequenceStreamOptions`
    - `SequenceStream` / `SequenceStreamOptions` / `InputSequenceStream` / `InputSequenceStreamOptions` -> use `InputRecordSequenceStream` / `InputRecordSequenceStreamOptions`
    - `OutputSequenceStream` / `OutputSequenceStreamOptions` -> use `OutputRecordSequenceStream` / `OutputRecordSequenceStreamOptions`

- fix
  - `ParseStream<T>`: enqueue falsy parsed values (`0`, `false`, `null`, `""`) and only skip `undefined`
  - `StringifyStream<T>`: enqueue empty-string results and only skip `undefined`
  - `InputJsonSequenceParseStream<T>`: ignore empty and whitespace-only chunks before parsing
  - `TextJoinStream`: emit trailing delimiter immediately on each chunk transform when `end: true`
  - `OutputJsonLinesStream<T>`: default `end` option to `true` for real-time line termination
  - `TextSplitStream`: sort splitters by length descending for multi-character delimiters
  - `RecordToSequenceStream`: fix initial `begin` state handling and multi-character delimiters split across chunk boundaries
  - Forward `ignoreBOM`, `chunkEndSplit`, `fallbackSkip`, `maxLength`, and `skip` options in composite streams (`InputJsonSequenceStream`, `InputJsonLinesStream`, `OutputJsonSequenceStream`)

- rename
  - `InputLineFeedSeparattedSequenceStream` -> `InputLineFeedSeparatedSequenceStream`
  - `InputLineFeedSeparattedSequenceStreamOptions` -> `InputLineFeedSeparatedSequenceStreamOptions`

- deprecated (to be removed in v3.0.0)
  - `InputLineFeedSeparattedSequenceStream`
    - rename after `InputLineFeedSeparatedSequenceStream`
  - `InputLineFeedSeparattedSequenceStreamOptions`
    - rename after `InputLineFeedSeparatedSequenceStreamOptions`

- refactor
  - Narrow `OutputJsonSequenceStream<T>` and `OutputJsonLinesStream<T>` readable chunk type from `BufferSource` to `Uint8Array<ArrayBuffer>`

- compat
  - Replace `RegExp.escape` (ES2025) with an internal escape helper and lower `engines.node` to `>=20` (Node.js 20 / 22 LTS support)

- build
  - Add `sideEffects: false` for bundler tree-shaking

- dev
  - Achieve 100% test coverage across all statements, branches, functions, and lines
  - Enable type-checked ESLint rules


## v1.0.11

- [npm:json-seq-stream@1.0.11](https://www.npmjs.com/package/json-seq-stream/v/1.0.11)
- [github:juner/json-seq-stream/releases/tag/v1.0.11](https://github.com/juner/json-seq-stream/releases/tag/v1.0.11)

- release
  - 2026/11/16

- fix
  - unify package exports to ESM to resolve `FalseESM` type resolution issue
  - rename `TransformStreamConstructor.d.ts` to `.ts` so its declaration is emitted to `dist/types/`

- dev
  - update ESLint configuration to use recommended configs for plugins

- build
  - emit ES module format only in Vite build
  - add `.npmrc` with `engine-strict=true`


## v1.0.10

- [npm:json-seq-stream@1.0.10](https://www.npmjs.com/package/json-seq-stream/v/1.0.10)
- [github:juner/json-seq/stream/release/tag/v1.0.10](https://github.com/juner/json-seq-stream/releases/tag/v1.0.10)

- release
  - 2026/03/10

- refactor
  - reorganize TypeScript types and project structure
    - split sources into `input/` and `output/` directories
  - remove `cpx` and replace with `fs-extra`
    - add internal utilities `copy.ts` and `remove.ts`

- dev
  - improve ESLint configuration
  - fix lint rules not being properly applied
  - add `.editorconfig`
  - enable `verbatimModuleSyntax`

- build
  - adjust npm publish workflow
  - refine files included in npm package

- misc
  - update `engines` version


## v1.0.9

- [npm:json-seq-stream@1.0.9](https://www.npmjs.com/package/json-seq-stream/v/1.0.9)
- [github:juner/json-seq-stream/stream/release/tag/v1.0.9](https://github.com/juner/json-seq-stream/releases/tag/v1.0.9)

- release
  - 2025/11/13

- fix
  - fix: use modern esm type resolution for consumers with NodeNext [#9](https://github.com/juner/json-seq-stream/pull/9)

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
