import React, { useRef } from 'react';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { NoResults } from '@clients/primitives/NoResults';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SearchResult } from '../../common/SearchableList';
import { NamedEntity } from '../../../models/Common/types';
import LaunchPlanListCard from './LaunchPlanListCard';

interface LaunchPlanCardViewProps {
  results: SearchResult<NamedEntity>[];
  loading: boolean;
}

const LaunchPlanCardView: React.FC<LaunchPlanCardViewProps> = ({ results, loading }) => {
  const parentRef = useRef<any>(document.getElementById('scroll-element'));

  const rowVirtualizer = useVirtualizer({
    count: results?.length ? results.length + 1 : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 15,
  });

  const items = rowVirtualizer.getVirtualItems();

  return loading ? (
    <LargeLoadingComponent useDelay={false} />
  ) : results.length === 0 ? (
    <NoResults />
  ) : (
    <>
      {items.map((virtualRow) => (
        <LaunchPlanListCard {...results[virtualRow.index]} />
      ))}
    </>
  );
};

export default LaunchPlanCardView;
