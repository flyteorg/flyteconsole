import { BlobDimensionality } from 'models';
import * as React from 'react';
import { InputProps } from './types';
import { getLaunchInputId } from './utils';

/** A micro form for entering the values related to a Blob Literal
 */
export const BlobInput: React.FC<InputProps> = props => {
    const { error, label, name, onChange, value: propValue } = props;
    const blobValue = typeof propValue === 'object' ? propValue : {};
    const hasError = !!error;
    // TODO: We might want a way to pass errors that are specific to a sub-field
    // of an input. Right now, a string error assumes that an input has a single
    // control that can be labeled with the error string.
    const helperText = hasError ? error : props.helperText;

    const handleChange = () => {
        // TODO
        onChange(
            {
                uri: '',
                dimensionality: BlobDimensionality.SINGLE
            } /* BlobValue */
        );
    };
    // TODO:
    return <div />;
};
