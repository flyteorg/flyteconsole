import React from 'react';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { NoResults } from '@clients/primitives/NoResults';
import { SearchResult } from '../../common/SearchableList';
import { NamedEntity } from '../../../models/Common/types';
import { ItemRenderer } from '../../common/FilterableNamedEntityList';

interface LaunchPlanCardViewProps {
  results: SearchResult<NamedEntity>[];
  renderItem: ItemRenderer;
  loading: boolean;
}

const LaunchPlanCardView: React.FC<LaunchPlanCardViewProps> = ({
  results,
  renderItem,
  loading,
}) => {
  return loading ? (
    <LargeLoadingComponent useDelay={false} />
  ) : results.length === 0 ? (
    <NoResults />
  ) : (
    <>{results.map((r) => renderItem(r, false))}</>
  );
};

export default LaunchPlanCardView;
