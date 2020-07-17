import { Core } from 'flyteidl';
import { BlobDimensionality } from 'models';
import { BlobValue, InputValue } from '../types';
import { literalNone } from './constants';
import { ConverterInput, InputHelper } from './types';

function fromLiteral(literal: Core.ILiteral): InputValue {
    if (!literal.scalar || !literal.scalar.blob) {
        throw new Error('Literal blob missing scalar.blob property');
    }
    const { blob } = literal.scalar;
    const uri = blob.uri ?? '';
    const format = blob.metadata?.type?.format ?? '';
    const dimensionality =
        blob.metadata?.type?.dimensionality ?? BlobDimensionality.SINGLE;

    return {
        dimensionality,
        format,
        uri
    };
}

function toLiteral({ value }: ConverterInput): Core.ILiteral {
    if (typeof value !== 'object') {
        return literalNone();
    }
    const {
        dimensionality = BlobDimensionality.SINGLE,
        format: rawFormat,
        uri
    } = value as BlobValue;
    if (!uri) {
        return literalNone();
    }

    // Send null for empty string values of format
    const format = rawFormat ? rawFormat : null;
    return {
        scalar: {
            blob: { uri, metadata: { type: { dimensionality, format } } }
        }
    };
}

function validate({ value }: ConverterInput) {
    if (typeof value !== 'object') {
        throw new Error('Value must be an object');
    }

    const blobValue = value as BlobValue;
    if (typeof blobValue.uri !== 'string' || blobValue.uri.length === 0) {
        throw new Error('Value is not a valid Blob: uri is required');
    }
    if (
        ![BlobDimensionality.SINGLE, BlobDimensionality.MULTIPART].includes(
            blobValue.dimensionality
        )
    ) {
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
