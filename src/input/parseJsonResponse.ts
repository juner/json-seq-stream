import { MIME_TYPE as JSON_SEQ_MIME_TYPE } from "../rfc7464.js";
import { MIME_TYPE as JSONL_MIME_TYPE, NDJSON_MIME_TYPE } from "../jsonlines.js";
import { InputJsonSequenceStream } from "./InputJsonSequenceStream.js";
import type { InputJsonSequenceStreamOptions } from "./InputJsonSequenceStream.js";
import { InputJsonLinesStream } from "./InputJsonLinesStream.js";
import type { InputJsonLinesStreamOptions } from "./InputJsonLinesStream.js";

/** Supported streaming JSON formats. */
export type JsonStreamFormat = "json-seq" | "jsonl" | "json";

export type ParseJsonResponseOptions<T> = {
  /** Explicit format. When set, `Content-Type` detection is skipped. */
  format?: JsonStreamFormat
} & InputJsonSequenceStreamOptions<T> & InputJsonLinesStreamOptions<T>;

/**
 * Detects the streaming JSON format from a `Content-Type` header value.
 *
 * - `application/json-seq` or `application/*+json-seq` -> `"json-seq"` (RFC 7464 / RFC 8091)
 * - `application/jsonl`, `application/*+jsonl`, `application/x-ndjson`, or `application/*+ndjson` -> `"jsonl"`
 * - `application/json` or `application/*+json` -> `"json"`
 * - anything else (or `null`) -> `undefined`
 */
export function detectJsonStreamFormat(contentType: string | null): JsonStreamFormat | undefined {
  if (contentType === null) return undefined;
  const separatorIndex = contentType.indexOf(";");
  const mime = (separatorIndex < 0 ? contentType : contentType.slice(0, separatorIndex)).trim().toLowerCase();
  switch (mime) {
    case JSON_SEQ_MIME_TYPE:
      return "json-seq";
    case JSONL_MIME_TYPE:
    case NDJSON_MIME_TYPE:
      return "jsonl";
    case "application/json":
      return "json";
    default:
      if (mime.startsWith("application/")) {
        if (mime.endsWith("+json-seq") && mime.length > "application/+json-seq".length)
          return "json-seq";
        if (mime.endsWith("+jsonl") && mime.length > "application/+jsonl".length)
          return "jsonl";
        if (mime.endsWith("+ndjson") && mime.length > "application/+ndjson".length)
          return "jsonl";
        if (mime.endsWith("+json") && mime.length > "application/+json".length)
          return "json";
      }
      return undefined;
  }
}

/**
 * Parses a `fetch()` `Response` containing a JSON or streaming JSON body into a
 * `ReadableStream` of typed values (`T`), selecting the format from the
 * response's `Content-Type` header.
 *
 * Supported media types:
 * - `application/json-seq` / `application/*+json-seq` (RFC 7464 JSON Text Sequences)
 * - `application/jsonl` / `application/*+jsonl` / `application/x-ndjson` / `application/*+ndjson` (JSON Lines / NDJSON)
 * - `application/json` / `application/*+json` (Single JSON document emitted as a 1-item stream)
 *
 * Use `options.format` to parse responses with other `Content-Type` values.
 *
 * @throws TypeError when the format cannot be detected or the response has no body.
 *
 * @example ```ts
 *   const response = await fetch(url);
 *   for await (const value of parseJsonResponse<MyType>(response)) {
 *     console.log(value);
 *   }
 * ```
 */
export function parseJsonResponse<T>(response: Response, options?: ParseJsonResponseOptions<T>): ReadableStream<T> {
  const contentType = response.headers.get("content-type");
  const format = options?.format ?? detectJsonStreamFormat(contentType);
  if (format === undefined)
    throw new TypeError(`json-seq-stream: cannot detect a streaming JSON format from content-type ${JSON.stringify(contentType)}; pass the format option to parse it anyway.`);
  if (response.body === null)
    throw new TypeError("json-seq-stream: the response has no body.");
  const stream = format === "json-seq"
    ? new InputJsonSequenceStream<T>(options)
    : format === "jsonl"
      ? new InputJsonLinesStream<T>(options)
      : new InputJsonLinesStream<T>({ splitter: [], chunkEndSplit: false, ...options });
  return response.body.pipeThrough(stream);
}
