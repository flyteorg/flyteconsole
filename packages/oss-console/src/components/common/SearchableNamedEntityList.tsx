import React from 'react';
import { NamedEntity } from '../../models/Common/types';
import { SearchResult } from './SearchableList';

export interface SearchableNamedEntity extends NamedEntity {
  key: string;
}

type ItemRenderer = (item: SearchResult<SearchableNamedEntity>) => React.ReactNode;

export interface SearchableNamedEntityListProps {
  names: NamedEntity[];
  renderItem: ItemRenderer;
}
