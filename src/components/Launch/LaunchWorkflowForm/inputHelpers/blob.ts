import { Core } from 'flyteidl';
import { BlobDimensionality } from 'models';
import { BlobValue, InputValue } from '../types';
import { literalNone } from './constants';
import { ConverterInput, InputHelper, InputValidatorParams } from './types';

function fromLiteral(literal: Core.ILiteral): InputValue {
    if (!literal.scalar || !literal.scalar.blob) {
        throw new Error('Literal blob missing scalar.blob property');
    }
    const { blob } = literal.scalar;
    const uri = blob.uri ?? '';
    // throw away empty format values
    const format = blob.metadata?.type?.format || undefined;
    const dimensionality =
        blob.metadata?.type?.dimensionality ?? BlobDimensionality.SINGLE;

    return {
        dimensionality,
        format,
        uri
    };
}

// Allows for string values ('single'/'multipart') when specifying blobs manually in collections
function getDimensionality(value: string | number) {
    return typeof value === 'number'
        ? value
        : BlobDimensionality[
              value.toUpperCase() as keyof typeof BlobDimensionality
          ];
}

function toLiteral({ value }: ConverterInput): Core.ILiteral {
    if (typeof value !== 'object') {
        return literalNone();
    }
    const {
        dimensionality: rawDimensionality,
        format: rawFormat,
        uri
    } = value as BlobValue;
    if (!uri) {
        return literalNone();
    }

    const dimensionality = getDimensionality(rawDimensionality);

    // Send null for empty string values of format
    const format = rawFormat ? rawFormat : undefined;
    return {
        scalar: {
            blob: { uri, metadata: { type: { dimensionality, format } } }
        }
    };
}

function validate({ value, required }: InputValidatorParams) {
    if (typeof value !== 'object') {
        throw new Error('Value must be an object');
    }

    const blobValue = value as BlobValue;
    if (
        (required && typeof blobValue.uri !== 'string') ||
        blobValue.uri.length === 0
    ) {
        throw new Error('uri is required');
    }
    if (!(getDimensionality(blobValue.dimensionality) in BlobDimensionality)) {
        throw new Error(
            `Value is not a valid Blob: unknown dimensionality value: ${blobValue.dimensionality}`
        );
    }
    if (blobValue.format != null && typeof blobValue.format !== 'string') {
        throw new Error('Value is not a valid Blob: format must be a string');
    }
}

export const blobHelper: InputHelper = {
    fromLiteral,
    toLiteral,
    validate
};
