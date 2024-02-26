import React from 'react';
import styled from '@mui/system/styled';
import { useQueryClient } from 'react-query';
import { makeTaskQuery } from '../../../queries/taskQueries';
import { Identifier } from '../../../models/Common/types';
import { NewTargetLink } from '../../common/NewTargetLink';
import { versionDetailsUrlGenerator } from '../generators';
import t from '../strings';
import { useConditionalQuery } from '../../hooks/useConditionalQuery';
import { WaitForQuery } from '../../common/WaitForQuery';

const StyledNewTargetLink = styled(NewTargetLink)(({ theme }) => ({
  marginBottom: theme.spacing(2),
})) as typeof NewTargetLink;

interface TaskVersionDetailsLinkProps {
  id: Identifier;
}

export const TaskVersionDetailsLink: React.FC<TaskVersionDetailsLinkProps> = ({ id }) => {
  const queryClient = useQueryClient();
  const taskQuery = useConditionalQuery(
    { ...makeTaskQuery(queryClient, id), enabled: !!id },
    (prev) => !prev,
  );
  return (
    <WaitForQuery query={taskQuery}>
      {(data) => {
        return data ? (
          <StyledNewTargetLink href={versionDetailsUrlGenerator(id)} external>
            {t('details_task')}
          </StyledNewTargetLink>
        ) : null;
      }}
    </WaitForQuery>
  );
};
