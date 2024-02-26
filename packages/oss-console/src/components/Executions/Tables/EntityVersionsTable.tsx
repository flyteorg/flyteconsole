import React from 'react';
import classnames from 'classnames';
import { useParams } from 'react-router';
import { noVersionsFoundString } from '@clients/common/constants';
import { useCommonStyles } from '../../common/styles';
import PaginatedDataList from '../../Tables/PaginatedDataList';
import { Workflow } from '../../../models/Workflow/types';
import { Identifier, ResourceType } from '../../../models/Common/types';
import { history } from '../../../routes/history';
import { Routes } from '../../../routes/routes';
import { useExecutionTableStyles } from './styles';
import { useWorkflowExecutionsTableState } from './useWorkflowExecutionTableState';
import { useWorkflowVersionsTableColumns } from './useWorkflowVersionsTableColumns';
import { WorkflowVersionRow } from './WorkflowVersionRow';
import { ListProps } from '../../common/types';

interface EntityVersionsTableProps extends ListProps<Workflow> {
  versionView?: boolean;
  resourceType: ResourceType;
}

interface EntityVersionRouteParams {
  entityVersion: string;
}

/**
 * Renders a table of WorkflowVersion records.
 * @param props
 * @constructor
 */
export const EntityVersionsTable: React.FC<EntityVersionsTableProps> = (props) => {
  const { value: versions, versionView, resourceType } = props;
  const state = useWorkflowExecutionsTableState();
  const commonStyles = useCommonStyles();
  const tableStyles = useExecutionTableStyles();
  const { entityVersion } = useParams<EntityVersionRouteParams>();

  const columns = useWorkflowVersionsTableColumns();

  const handleClickRow = React.useCallback(
    (id: Identifier) => () => {
      history.push(Routes.EntityVersionDetails.makeUrl(id));
    },
    [],
  );

  const rowRenderer = (row: Workflow) => (
    <WorkflowVersionRow
      columns={columns}
      workflow={row}
      state={state}
      versionView={versionView}
      onClick={handleClickRow({ ...row.id, resourceType })}
      isChecked={decodeURIComponent(entityVersion) === row.id.version}
      key={`workflow-version-row-${row.id.version}`}
    />
  );

  return (
    <div className={classnames(tableStyles.tableContainer, commonStyles.flexFill)}>
      <PaginatedDataList
        columns={columns}
        data={versions}
        rowRenderer={rowRenderer}
        totalRows={versions.length}
        showRadioButton={versionView}
        noDataString={noVersionsFoundString}
        fillEmptyRows={false}
      />
    </div>
  );
};
