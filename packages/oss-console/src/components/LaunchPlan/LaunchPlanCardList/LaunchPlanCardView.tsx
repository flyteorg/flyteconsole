import React from 'react';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { NoResults } from '@clients/primitives/NoResults';
import { SearchResult } from '../../common/SearchableList';
import { NamedEntity } from '../../../models/Common/types';
import LaunchPlanListCard from './LaunchPlanListCard';

interface LaunchPlanCardViewProps {
  results: SearchResult<NamedEntity>[];
  loading: boolean;
}

const LaunchPlanCardView: React.FC<LaunchPlanCardViewProps> = ({ results, loading }) => {
  return loading ? (
    <LargeLoadingComponent useDelay={false} />
  ) : results.length === 0 ? (
    <NoResults />
  ) : (
    <>
      {results.map((searchResult, index) => {
        const { key, ...rest } = searchResult;
        return <LaunchPlanListCard key={key || String(index)} {...rest} />;
      })}
    </>
  );
};

export default LaunchPlanCardView;
