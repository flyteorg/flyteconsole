import React from 'react';
import styled from '@mui/system/styled';
import Typography from '@mui/material/Typography';
import t from './strings';

const NoResultsContainer = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(4),
}));

export interface NoResultsProps {
  displayMessage?: string;
}
export const NoResults: React.FC<NoResultsProps> = ({
  displayMessage = t('noMatchingResults'),
}) => <NoResultsContainer variant="h6">{displayMessage}</NoResultsContainer>;
