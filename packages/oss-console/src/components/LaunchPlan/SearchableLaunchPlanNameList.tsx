import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import ListItemButton from '@mui/material/ListItemButton';
import LaunchPlansLogo from '@clients/ui-atoms/LaunchPlansLogo';
import { NamedEntity } from '../../models/Common/types';
import { FilterableNamedEntityList, ItemRenderer } from '../common/FilterableNamedEntityList';
import { WaitForData } from '../common/WaitForData';
import { limits, DEFAULT_SORT } from '../../models/AdminEntity/constants';
import { Routes } from '../../routes/routes';
import {
  SearchResult,
  createHighlightedEntitySearchResult,
} from '../common/useSearchableListState';
import { useLaunchPlanInfoList } from './useLaunchPlanInfoList';

export interface SearchableLaunchPlanNameItemProps extends SearchResult<NamedEntity> {
  isScrolling: boolean;
}
/**
 * Renders individual searchable launchPlan item
 * @param item
 * @returns
 */
const SearchableLaunchPlanNameItem: React.FC<SearchableLaunchPlanNameItemProps> = (props) => {
  const { result, value, content } = props;
  const { id } = value;

  const url = Routes.LaunchPlanDetails.makeUrl(id.project, id.domain, id.name);

  return (
    <Grid container>
      <Grid item xs={12}>
        <ListItemButton
          href={url}
          LinkComponent={forwardRef((props, ref) => {
            return <Link to={props?.href} ref={ref} {...props} />;
          })}
          sx={{
            minHeight: '49.5px',
            marginLeft: (theme) => theme.spacing(2),
            marginRight: (theme) => theme.spacing(2),
            padding: (theme) => theme.spacing(1, 2),
            marginBottom: '-1px',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container>
            <Grid item sx={{ height: '24px', paddingRight: (theme) => theme.spacing(2) }}>
              <Icon
                sx={{
                  '& svg': {
                    color: (theme) => theme.palette.common.grays[40],
                    width: '20px',
                  },
                }}
              >
                <LaunchPlansLogo />
              </Icon>
            </Grid>
            <Grid
              item
              alignSelf="center"
              sx={{
                width: (theme) => `calc(100% - 24px - ${theme.spacing(2)})`,
                // text wrap
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              <span>{result ? createHighlightedEntitySearchResult(result) : content}</span>
            </Grid>
          </Grid>
        </ListItemButton>
      </Grid>
    </Grid>
  );
};

interface SearchableLaunchPlanNameListProps {
  projectId: string;
  domainId: string;
}

/**
 * Renders a searchable list of LaunchPlan names, with associated descriptions
 * @param props
 * @returns
 */
export const SearchableLaunchPlanNameList: React.FC<SearchableLaunchPlanNameListProps> = (
  props,
) => {
  const launchPlans = useLaunchPlanInfoList(
    { domain: props.domainId, project: props.projectId },
    {
      limit: limits.NONE,
      sort: DEFAULT_SORT,
    },
  );

  const renderItem: ItemRenderer = (item, isScrolling) => {
    return <SearchableLaunchPlanNameItem {...item} isScrolling={isScrolling} />;
  };

  return (
    <WaitForData {...launchPlans}>
      <FilterableNamedEntityList
        {...props}
        placeholder="Search Launch Plan Name"
        archiveCheckboxLabel="Show Only Archived Launch Plans"
        names={launchPlans.value}
        renderItem={renderItem}
        noDivider
        isLoading={false}
      />
    </WaitForData>
  );
};
