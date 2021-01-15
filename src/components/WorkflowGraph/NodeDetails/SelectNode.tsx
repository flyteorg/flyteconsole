import { NonIdealState } from 'components/common/NonIdealState';
import * as React from 'react';

export const SelectNode: React.FC = () => (
    <NonIdealState
        size="small"
        title="Select a node in the graph to see more information"
    />
);
