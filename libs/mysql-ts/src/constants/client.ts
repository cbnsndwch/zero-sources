'use strict';

// Manually extracted from mysql-5.5.23/include/mysql_com.h

/**
 * new more secure passwords 
 */
export const LONG_PASSWORD = 0x00000001; 

/**
 * found instead of affected rows 
 */
export const FOUND_ROWS = 0x00000002; 

/**
 * get all column flags 
 */
export const LONG_FLAG = 0x00000004; 

/**
 * one can specify db on connect 
 */
export const CONNECT_WITH_DB = 0x00000008; 

/**
 * don't allow database.table.column 
 */
export const NO_SCHEMA = 0x00000010; 

/**
 * can use compression protocol 
 */
export const COMPRESS = 0x00000020; 

/**
 * odbc client 
 */
export const ODBC = 0x00000040; 

/**
 * can use LOAD DATA LOCAL 
 */
export const LOCAL_FILES = 0x00000080; 

/**
 * ignore spaces before '' 
 */
export const IGNORE_SPACE = 0x00000100; 

/**
 * new 4.1 protocol 
 */
export const PROTOCOL_41 = 0x00000200; 

/**
 * this is an interactive client 
 */
export const INTERACTIVE = 0x00000400; 

/**
 * switch to ssl after handshake 
 */
export const SSL = 0x00000800; 

/**
 * IGNORE sigpipes 
 */
export const IGNORE_SIGPIPE = 0x00001000; 

/**
 * client knows about transactions 
 */
export const TRANSACTIONS = 0x00002000; 

/**
 * old flag for 4.1 protocol  
 */
export const RESERVED = 0x00004000; 

/**
 * new 4.1 authentication 
 */
export const SECURE_CONNECTION = 0x00008000; 

/**
 * enable/disable multi-stmt support 
 */
export const MULTI_STATEMENTS = 0x00010000; 

/**
 * enable/disable multi-results 
 */
export const MULTI_RESULTS = 0x00020000; 

/**
 * multi-results in ps-protocol 
 */
export const PS_MULTI_RESULTS = 0x00040000; 

/**
 * client supports plugin authentication 
 */
export const PLUGIN_AUTH = 0x00080000; 

/**
 * permits connection attributes 
 */
export const CONNECT_ATTRS = 0x00100000; 

/**
 * Understands length-encoded integer for auth response data in Protocol::HandshakeResponse41. 
 */
export const PLUGIN_AUTH_LENENC_CLIENT_DATA = 0x00200000; 

/**
 * Announces support for expired password extension. 
 */
export const CAN_HANDLE_EXPIRED_PASSWORDS = 0x00400000; 

/**
 * Can set SERVER_SESSION_STATE_CHANGED in the Status Flags and send session-state change data after a OK packet. 
 */
export const SESSION_TRACK = 0x00800000; 

/**
 * Can send OK after a Text Resultset. 
 */
export const DEPRECATE_EOF = 0x01000000; 

export const SSL_VERIFY_SERVER_CERT = 0x40000000;
export const REMEMBER_OPTIONS = 0x80000000;

/**
 * multi-factor authentication 
 */
export const MULTI_FACTOR_AUTHENTICATION = 0x10000000; 
