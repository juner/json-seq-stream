/**
 * @see https://jsonlines.org/
 */

/**
 * 3. Line Terminator is '\n'
 */
export const LF = `\n`;

/**
 * This means '\r\n' is also supported because surrounding white space is implicitly ignored when parsing JSON values.
 */
export const CRLF = `\r\n`;

export const JsonLinesMimeType = "application/jsonl";
