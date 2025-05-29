'use strict';

/**
 *
 * Manually extracted from `mysql-5.5.23/include/mysql_com.h`
 * 
 * @see {@link http://dev.mysql.com/doc/refman/5.5/en/c-api-prepared-statement-type-codes.html}
 */
const TypeCodeToName = {
    /**
     * aka DECIMAL
     */
    0x00: 'DECIMAL',

    /**
     * aka TINYINT, 1 byte
     */
    0x01: 'TINY',

    /**
     * aka SMALLINT, 2 bytes
     */
    0x02: 'SHORT',

    /**
     * aka INT, 4 bytes
     */
    0x03: 'LONG',

    /**
     * aka FLOAT, 4-8 bytes
     */
    0x04: 'FLOAT',

    /**
     * aka DOUBLE, 8 bytes
     */
    0x05: 'DOUBLE',

    /**
     * NULL (used for prepared statements, I think)
     */
    0x06: 'NULL',

    /**
     * aka TIMESTAMP
     */
    0x07: 'TIMESTAMP',

    /**
     * aka BIGINT, 8 bytes
     */
    0x08: 'LONGLONG',

    /**
     * aka MEDIUMINT, 3 bytes
     */
    0x09: 'INT24',

    /**
     * aka DATE
     */
    0x0a: 'DATE',

    /**
     * aka TIME
     */
    0x0b: 'TIME',

    /**
     * aka DATETIME
     */
    0x0c: 'DATETIME',

    /**
     * aka YEAR, 1 byte (don't ask)
     */
    0x0d: 'YEAR',

    /**
     * aka ?
     */
    0x0e: 'NEWDATE',

    /**
     * aka VARCHAR (?)
     */
    0x0f: 'VARCHAR',

    /**
     * aka BIT, 1-8 byte
     */
    0x10: 'BIT',

    /**
     * a JSON/JSONB value, arbitrary length
     */
    0xf5: 'JSON',

    /**
     * aka DECIMAL
     */
    0xf6: 'NEWDECIMAL',

    /**
     * aka ENUM
     */
    0xf7: 'ENUM',

    /**
     * aka SET
     */
    0xf8: 'SET',

    /**
     * aka TINYBLOB, TINYTEXT
     */
    0xf9: 'TINY_BLOB',

    /**
     * aka MEDIUMBLOB, MEDIUMTEXT
     */
    0xfa: 'MEDIUM_BLOB',

    /**
     * aka LONGBLOG, LONGTEXT
     */
    0xfb: 'LONG_BLOB',

    /**
     * aka BLOB, TEXT
     */
    0xfc: 'BLOB',

    /**
     * aka VARCHAR, VARBINARY
     */
    0xfd: 'VAR_STRING',

    /**
     * aka CHAR, BINARY
     */
    0xfe: 'STRING',

    /**
     * aka GEOMETRY
     */
    0xff: 'GEOMETRY'
} as const;

export default TypeCodeToName;

/**
 * aka DECIMAL (http://dev.mysql.com/doc/refman/5.0/en/precision-math-decimal-changes.html)
 */
export const DECIMAL = 0x00;

/**
 * aka TINYINT, 1 byte
 */
export const TINY = 0x01;

/**
 * aka SMALLINT, 2 bytes
 */
export const SHORT = 0x02;

/**
 * aka INT, 4 bytes
 */
export const LONG = 0x03;

/**
 * aka FLOAT, 4-8 bytes
 */
export const FLOAT = 0x04;

/**
 * aka DOUBLE, 8 bytes
 */
export const DOUBLE = 0x05;

/**
 * NULL (used for prepared statements, I think)
 */
export const NULL = 0x06;

/**
 * aka TIMESTAMP
 */
export const TIMESTAMP = 0x07;

/**
 * aka BIGINT, 8 bytes
 */
export const LONGLONG = 0x08;

/**
 * aka MEDIUMINT, 3 bytes
 */
export const INT24 = 0x09;

/**
 * aka DATE
 */
export const DATE = 0x0a;

/**
 * aka TIME
 */
export const TIME = 0x0b;

/**
 * aka DATETIME
 */
export const DATETIME = 0x0c;

/**
 * aka YEAR, 1 byte (don't ask)
 */
export const YEAR = 0x0d;

/**
 * aka ?
 */
export const NEWDATE = 0x0e;

/**
 * aka VARCHAR (?)
 */
export const VARCHAR = 0x0f;

/**
 * aka BIT, 1-8 byte
 */
export const BIT = 0x10;

export const VECTOR = 0xf2;

export const JSON = 0xf5;

/**
 * aka DECIMAL
 */
export const NEWDECIMAL = 0xf6;

/**
 * aka ENUM
 */
export const ENUM = 0xf7;

/**
 * aka SET
 */
export const SET = 0xf8;

/**
 * aka TINYBLOB, TINYTEXT
 */
export const TINY_BLOB = 0xf9;

/**
 * aka MEDIUMBLOB, MEDIUMTEXT
 */
export const MEDIUM_BLOB = 0xfa;

/**
 * aka LONGBLOG, LONGTEXT
 */
export const LONG_BLOB = 0xfb;

/**
 * aka BLOB, TEXT
 */
export const BLOB = 0xfc;

/**
 * aka VARCHAR, VARBINARY
 */
export const VAR_STRING = 0xfd;

/**
 * aka CHAR, BINARY
 */
export const STRING = 0xfe;

/**
 * aka GEOMETRY
 */
export const GEOMETRY = 0xff;
