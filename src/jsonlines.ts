/**
 * @see https://jsonlines.org/
 */

/**
 * 3. Line Terminator is '\n'
 * @see https://jsonlines.org/#line-terminator-is-n
 */
export const LF = `\n`;

/**
 * This means '\r\n' is also supported because surrounding white space is implicitly ignored when parsing JSON values.
 * @see https://jsonlines.org/#line-terminator-is-n
 */
export const CRLF = `\r\n`;

/**
 * MIME type may be `application/jsonl`, but this is not yet standardized; any help writing the RFC would be greatly appreciated (see [issue](https://github.com/wardi/jsonlines/issues/19)).
 * @see https://jsonlines.org/#conventions
 */
export const MIME_TYPE = "application/jsonl";

/**
 * JSON Lines files may be saved with the file extension `.jsonl.`
 * @see https://jsonlines.org/#conventions
 */
export const EXTENSION = ".jsonl";
