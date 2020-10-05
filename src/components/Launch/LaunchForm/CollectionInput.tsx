import { TextField } from '@material-ui/core';
import * as React from 'react';
import { InputChangeHandler, InputProps, InputType } from './types';
import { UnsupportedInput } from './UnsupportedInput';
import { getLaunchInputId } from './utils';

function stringChangeHandler(onChange: InputChangeHandler) {
    return ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
        onChange(value);
    };
}

/** Handles rendering of the input component for a Collection of SimpleType values*/
export const CollectionInput: React.FC<InputProps> = props => {
    const {
        error,
        label,
        name,
        onChange,
        typeDefinition: { subtype },
        value = ''
    } = props;
    if (!subtype) {
        console.error(
            'Unexpected missing subtype for collection input',
            props.typeDefinition
        );
        return <UnsupportedInput {...props} />;
    }
    const hasError = !!error;
    const helperText = hasError ? error : props.helperText;
    switch (subtype.type) {
        case InputType.Blob:
        case InputType.Boolean:
        case InputType.Collection:
        case InputType.Datetime:
        case InputType.Duration:
        case InputType.Error:
        case InputType.Float:
        case InputType.Integer:
        case InputType.Map:
        case InputType.String:
        case InputType.Struct:
            return (
                <TextField
                    id={getLaunchInputId(name)}
                    error={hasError}
                    helperText={helperText}
                    fullWidth={true}
                    label={label}
                    multiline={true}
                    onChange={stringChangeHandler(onChange)}
                    rowsMax={8}
                    value={value}
                    variant="outlined"
                />
            );
        default:
            return <UnsupportedInput {...props} />;
    }
};
