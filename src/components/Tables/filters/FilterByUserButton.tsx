import { Button } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as classnames from 'classnames';
import {
    buttonHoverColor,
    interactiveTextBackgroundColor,
    interactiveTextColor
} from 'components/Theme/constants';
import * as React from 'react';

const useStyles = makeStyles((theme: Theme) => {
    const buttonInteractiveStyles = {
        borderColor: theme.palette.text.primary,
        color: theme.palette.text.primary
    };
    const horizontalButtonPadding = theme.spacing(1.5);
    return {
        button: {
            backgroundColor: theme.palette.common.white,
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            height: theme.spacing(4),
            fontWeight: 'bold',
            lineHeight: '1.1875rem',
            padding: `${theme.spacing(0.375)}px ${horizontalButtonPadding}px`,
            textTransform: 'none',
            '&.active, &.active:hover': {
                backgroundColor: interactiveTextBackgroundColor,
                borderColor: 'transparent',
                color: interactiveTextColor
            },
            '&:hover': {
                ...buttonInteractiveStyles,
                backgroundColor: buttonHoverColor
            }
        }
    };
});

export interface FilterByUserButtonProps {
    active?: boolean;
    buttonText: string;
    className?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/** Renders a single button for filtering by user,
 * in case that user logged in, button text will be `All executions` by default,
 * table will show only its own executions
 * whereas in case that user not logged in, button will not be displayed
 */
export const FilterByUserButton: React.FC<FilterByUserButtonProps> = ({
    active,
    buttonText = 'All executions',
    className,
    onClick
}) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const styles = useStyles();

    return (
        <div className={className}>
            <Button
                disableRipple={true}
                disableTouchRipple={true}
                className={classnames(styles.button, { active })}
                ref={buttonRef}
                onClick={onClick}
                variant="outlined"
            >
                {buttonText}
            </Button>
        </div>
    );
};
