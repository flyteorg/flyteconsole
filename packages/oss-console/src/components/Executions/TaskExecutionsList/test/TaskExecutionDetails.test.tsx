import { render } from '@testing-library/react';
import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { unknownValueString } from '@clients/common/constants';
import { long } from '../../../../test/utils';
import { TaskExecutionDetails } from '../TaskExecutionDetails';

const date = { seconds: long(5), nanos: 0 };
const duration = { seconds: long(0), nanos: 0 };

const dateContent = '1/1/1970 12:00:05 AM UTC';

describe('TaskExecutionDetails', () => {
  it('should render details with task started info and duration', () => {
    const { queryByText } = render(
      <ThemeProvider theme={muiTheme}>
        <TaskExecutionDetails startedAt={date} duration={duration} />
      </ThemeProvider>,
    );

    expect(queryByText('started')).toBeInTheDocument();
    expect(queryByText('last updated')).not.toBeInTheDocument();
    expect(queryByText(dateContent, { exact: false })).toBeInTheDocument();
    expect(queryByText('run time')).toBeInTheDocument();
    expect(queryByText('0s')).toBeInTheDocument();
  });

  it('should render details with task started info without duration', () => {
    const { queryByText } = render(
      <ThemeProvider theme={muiTheme}>
        <TaskExecutionDetails startedAt={date} />
      </ThemeProvider>,
    );

    expect(queryByText('started')).toBeInTheDocument();
    expect(queryByText('last updated')).not.toBeInTheDocument();
    expect(queryByText(dateContent, { exact: false })).toBeInTheDocument();
    expect(queryByText('run time')).toBeInTheDocument();
    expect(queryByText(unknownValueString)).toBeInTheDocument();
  });

  it('should render details with task updated info and duration', () => {
    const { queryByText } = render(
      <ThemeProvider theme={muiTheme}>
        <TaskExecutionDetails startedAt={date} duration={duration} />
      </ThemeProvider>,
    );

    expect(queryByText('started')).toBeInTheDocument();
    expect(queryByText('last updated')).not.toBeInTheDocument();
    expect(queryByText(dateContent, { exact: false })).toBeInTheDocument();
    expect(queryByText('run time')).toBeInTheDocument();
    expect(queryByText('0s')).toBeInTheDocument();
  });

  it('should render details with task updated info without duration', async () => {
    const { queryByText } = await render(
      <ThemeProvider theme={muiTheme}>
        <TaskExecutionDetails startedAt={date} />
      </ThemeProvider>,
    );

    expect(queryByText('started')).toBeInTheDocument();
    expect(queryByText('last updated')).not.toBeInTheDocument();
    expect(queryByText(dateContent, { exact: false })).toBeInTheDocument();
    expect(queryByText('run time')).toBeInTheDocument();
    expect(queryByText(unknownValueString)).toBeInTheDocument();
  });
});
