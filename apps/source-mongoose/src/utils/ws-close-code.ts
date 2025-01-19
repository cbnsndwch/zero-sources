/**
 * WebSocket connection close codes
 * 
 * @see {@link https://www.rfc-editor.org/rfc/rfc6455.html#section-7.1.5}
 * @see {@link https://www.iana.org/assignments/websocket/websocket.xhtml#close-code-number}
 */

//#region Standard

/**
 * Successful operation, connection not required anymore
 */
export const WS_1000_NORMAL_CLOSURE = 1000;

/**
 * Browser tab closing, graceful server shutdown
 */
export const WS_1001_GOING_AWAY = 1001;

/**
 * Endpoint received malformed frame
 */
export const WS_1002_PROTOCOL_ERROR = 1002;

/**
 * Endpoint received unsupported frame (e.g. binary-only got text frame, ping/pong frames not handled properly)
 */
export const WS_1003_UNSUPPORTED_DATA = 1003;

/**
 * Got no close status but transport layer finished normally (e.g. TCP FIN but no previous CLOSE frame)
 */
export const WS_1005_NO_STATUS_RECEIVED = 1005;

/**
 * Transport layer broke (e.g. couldn't connect, TCP RST)
 */
export const WS_1006_ABNORMAL_CLOSURE = 1006;

/**
 * Data in endpoint's frame is not consistent (e.g. malformed UTF-8)
 */
export const WS_1007_INVALID_FRAME_PAYLOAD_DATA = 1007;

/**
 * Generic code not applicable to any other (e.g. isn't `1003` nor `1009`)
 */
export const WS_1008_POLICY_VIOLATION = 1008;

/**
 * Endpoint won't process large message
 */
export const WS_1009_MESSAGE_TOO_BIG = 1009;

/**
 * Client wanted extension(s) that server did not negotiate
 */
export const WS_1010_MANDATORY_EXTENSIONS = 1010;

/**
 * Unexpected server problem while operating
 */
export const WS_1011_INTERNAL_ERROR = 1011;

/**
 * Server/service is restarting
 */
export const WS_1012_SERVICE_RESTART = 1012;

/**
 * Temporary server condition forced blocking client's application-based request
 */
export const WS_1013_TRY_AGAIN_LATER = 1013;

/**
 * Server acting as gateway/proxy got invalid response. Equivalent to HTTP `502`
 */
export const WS_1014_BAD_GATEWAY = 1014;

/**
 * Transport layer broke because TLS handshake failed
 */
export const WS_1015_TLS_HANDSHAKE = 1015;

/**
 * Endpoint must be authorized to perform application-based request. Equivalent to HTTP `401`
 */
export const WS_3000_UNAUTHORIZED = 3000;

/**
 * Endpoint is authorized but has no permissions to perform application-based request. Equivalent to HTTP `403`
 */
export const WS_3003_FORBIDDEN = 3003;

/**
 * Endpoint took too long to respond to application-based request. Equivalent to HTTP `408`
 */
export const WS_3008_TIMEOUT = 3008;

//#endregion Standard

//#region App-specific

/**
 * The underlying stream was closed, client should reconnect.
 */
export const WS_4900_UNDERLYING_STREAM_CLOSED = 4900;

//#endregion App-specific
