import {
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@material-ui/core';
import { NewTargetLink } from 'components/common/NewTargetLink';
import { useDebouncedValue } from 'components/hooks/useDebouncedValue';
import { Admin } from 'flyteidl';
import * as React from 'react';
import { launchInputDebouncDelay, roleTypes } from './constants';
import { makeStringChangeHandler } from './handlers';
import { RoleTypeValue } from './types';

const roleHeader = 'Role';
const roleDescription = 'Enter a role to assume for this execution.';
const roleDocLinkText = 'See source for more information.';
const roleDocLinkUrl =
    'https://github.com/lyft/flyteidl/blob/3789005a1372221eba28fa20d8386e44b32388f5/protos/flyteidl/admin/common.proto#L241';
const roleValueLabel = 'value';
const roleTypeLabel = 'type';
const roleInputId = 'launch-auth-role';

export interface RoleInputProps {
    error?: string;
    roleType: string;
    roleString?: string;
    onChangeRoleString(newValue: string): void;
    onChangeRoleType(newValue: string): void;
}

function getDefaultRoleTypeValue(): RoleTypeValue {
    return roleTypes.iamRole.value;
}

interface RoleInputState extends RoleInputProps {
    getValue(): Admin.IAuthRole;
    validate(): boolean;
}

export function useRoleInputState(): RoleInputState {
    const [error, setError] = React.useState<string>();
    const [roleString, setRoleString] = React.useState<string>();
    const [roleType, setRoleType] = React.useState<RoleTypeValue>(
        getDefaultRoleTypeValue
    );

    const validationValue = useDebouncedValue(
        roleString,
        launchInputDebouncDelay
    );

    const getValue = () => ({ [roleType]: roleString });
    const validate = () => {
        if (roleString == null || roleString.length === 0) {
            setError('Value is required');
            return false;
        }
        setError(undefined);
        return true;
    };

    React.useEffect(() => {
        validate();
    }, [validationValue]);

    return {
        error,
        getValue,
        roleType,
        roleString,
        validate,
        onChangeRoleString: setRoleString,
        onChangeRoleType: (value: string) => setRoleType(value as RoleTypeValue)
    };
}

const RoleDescription = () => (
    <>
        <Typography variant="body2">
            {roleDescription}
            <NewTargetLink href={roleDocLinkUrl}>
                {roleDocLinkText}
            </NewTargetLink>
        </Typography>
    </>
);

export const RoleInput: React.FC<RoleInputProps> = ({
    error,
    roleType,
    roleString,
    onChangeRoleString,
    onChangeRoleType
}) => {
    const hasError = !!error;
    const helperText = hasError ? error : undefined;
    return (
        <section>
            <header>
                <Typography variant="h6">{roleHeader}</Typography>
                <RoleDescription />
            </header>
            <FormControl component="fieldset">
                <FormLabel component="legend">{roleTypeLabel}</FormLabel>
                <RadioGroup
                    aria-label="roleType"
                    name="roleType"
                    value={roleType}
                    onChange={makeStringChangeHandler(onChangeRoleType)}
                >
                    {Object.values(roleTypes).map(({ label, value }) => (
                        <FormControlLabel
                            key={value}
                            value={value}
                            control={<Radio />}
                            label={label}
                        />
                    ))}
                </RadioGroup>
            </FormControl>
            <TextField
                error={hasError}
                id={roleInputId}
                helperText={helperText}
                fullWidth={true}
                label={roleValueLabel}
                onChange={makeStringChangeHandler(onChangeRoleString)}
                value={roleString}
                variant="outlined"
            />
        </section>
    );
};
