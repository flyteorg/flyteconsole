import { makeStyles, Theme } from '@material-ui/core/styles';
import { MultiSelectForm } from 'components/common/MultiSelectForm';
import { SearchInputForm } from 'components/common/SearchInputForm';
import { SingleSelectForm } from 'components/common/SingleSelectForm';
import { FilterPopoverButton } from 'components/Tables/filters/FilterPopoverButton';
import { FilterByUserButton } from 'components/Tables/filters/FilterByUserButton';
import { APIContext } from 'components/data/apiContext';
import {
    buttonHoverColor,
    interactiveTextBackgroundColor,
    interactiveTextColor
} from 'components/Theme/constants';
import * as React from 'react';
import {
    FilterState,
    MultiFilterState,
    SearchFilterState,
    SingleFilterState
} from './filters/types';

const useStyles = makeStyles((theme: Theme) => {
    const buttonInteractiveStyles = {
        borderColor: theme.palette.text.primary,
        color: theme.palette.text.primary
    };
    return {
        container: {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            height: theme.spacing(7),
            minHeight: theme.spacing(7),
            paddingLeft: theme.spacing(1),
            width: '100%'
        },
        filterButton: {
            marginLeft: theme.spacing(1)
        },
        button: {
            backgroundColor: theme.palette.common.white,
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            height: theme.spacing(4),
            fontWeight: 'bold',
            lineHeight: '1.1875rem',
            padding: `${theme.spacing(0.375)}px ${theme.spacing(1.5)}px`,
            textTransform: 'none',
            marginLeft: theme.spacing(1),
            '&.active, &.active:hover, &.active.open': {
                backgroundColor: interactiveTextBackgroundColor,
                borderColor: 'transparent',
                color: interactiveTextColor
            },
            '&:hover': {
                ...buttonInteractiveStyles,
                backgroundColor: buttonHoverColor
            },
            '&.open': buttonInteractiveStyles
        }
    };
});

const RenderFilter: React.FC<{ filter: FilterState }> = ({ filter }) => {
    const searchFilterState = filter as SearchFilterState;
    switch (filter.type) {
        case 'single':
            return <SingleSelectForm {...(filter as SingleFilterState<any>)} />;
        case 'multi':
            return (
                <MultiSelectForm {...(filter as MultiFilterState<any, any>)} />
            );
        case 'search':
            return (
                <SearchInputForm
                    {...searchFilterState}
                    defaultValue={searchFilterState.value}
                />
            );
        default:
            return null;
    }
};

/** Renders the set of filter buttons relevant to a table of WorkflowExecutions:
 * Status, Version, Start Time, Duration
 * The state for this component is generated externally by `useExecutionFiltersState` and passed in.
 * This allows for the consuming code to have direct access to the
 * current filters without relying on complicated callback arrangements
 */
export const ExecutionFilters: React.FC<{ filters: FilterState[] }> = ({
    filters
}) => {
    const styles = useStyles();
    const { profile } = React.useContext(APIContext);

    return (
        <div className={styles.container}>
            {filters.map(filter => {
                if (filter.type == 'byUser') {
                    if (profile?.value == null) {
                        return <></>;
                    } else {
                        return (
                            <FilterByUserButton
                                {...filter.button}
                                active={filter.active}
                                key={filter.label}
                                buttonText={filter.label}
                                className={styles.filterButton}
                            />
                        );
                    }
                } else {
                    const renderContent = () => (
                        <RenderFilter filter={filter} />
                    );
                    return (
                        <FilterPopoverButton
                            {...filter.button}
                            active={filter.active}
                            key={filter.label}
                            onReset={filter.onReset}
                            buttonText={filter.label}
                            className={styles.filterButton}
                            renderContent={renderContent}
                        />
                    );
                }
            })}
        </div>
    );
};
