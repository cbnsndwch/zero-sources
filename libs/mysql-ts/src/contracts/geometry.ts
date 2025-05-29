// TODO: consider using https://www.npmjs.com/package/wkx-ts

export type WKBPoint = {
    x: number;
    y: number;
};

export type WKBLineString = WKBPoint[];

export type WKBPolygon = WKBLineString[];

export type WKBMultiPoint = WKBPoint[];

export type WKBMultiLineString = WKBLineString[];

export type WKBMultiPolygon = WKBPolygon[];

export type WKBGeometryCollection = Array<
    WKBPoint | WKBLineString | WKBPolygon
>;

export type WKBMultiGeometry = Array<WKBGeometry | WKBMultiGeometry>;

export type WKBGeometry =
    | WKBPoint
    | WKBLineString
    | WKBPolygon
    | WKBMultiPoint
    | WKBMultiLineString
    | WKBMultiPolygon
    | WKBGeometryCollection
    | WKBMultiGeometry;
