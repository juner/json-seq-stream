/**
 * JavaScript Object Notation (JSON) Text Sequences
 * @see https://datatracker.ietf.org/doc/html/rfc7464
 */

/**
 * RS = %x1E; "record separator" (RS), see RFC 20
 * @see https://datatracker.ietf.org/doc/html/rfc7464#section-2.2
 * @see https://datatracker.ietf.org/doc/html/rfc20
 */
export const RS = "\u001e";

/**
 * LF = %x0A; "line feed" (LF), see RFC 20
 * @see https://datatracker.ietf.org/doc/html/rfc7464#section-2.2
 * @see https://datatracker.ietf.org/doc/html/rfc20
 */
export const LF = "\n";

/**
 * The MIME media type for JSON text sequences is application/json-seq.
 * @see https://datatracker.ietf.org/doc/html/rfc7464#section-4
 */
export const MIME_TYPE = "application/json-seq";
