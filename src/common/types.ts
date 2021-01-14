export interface DecodeProtobufTypedDictionaryResult {
    error?: Error;
    // tslint:disable-next-line:no-any
    value?: { [k: string]: unknown };
}

/** Converts type `T` to one in which all fields are optional and
 * all fields in nested objects are also optional.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
