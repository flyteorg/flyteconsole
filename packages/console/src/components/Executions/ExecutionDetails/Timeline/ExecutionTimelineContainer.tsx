import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useState } from 'react';
import { useNodeExecutionsById } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { ExecutionTimeline } from './ExecutionTimeline';
import { ExecutionTimelineFooter } from './ExecutionTimelineFooter';
import { TimeZone } from './helpers';

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 100%',
  },
  container: {
    display: 'flex',
    flex: '1 1 0',
    overflowY: 'auto',
  },
}));

export const ExecutionTimelineContainer: React.FC<{}> = () => {
  const styles = useStyles();
  const [chartTimezone, setChartTimezone] = useState(TimeZone.Local);
  const handleTimezoneChange = tz => setChartTimezone(tz);

  const { initialDNodes: initialNodes } = useNodeExecutionsById();
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <ExecutionTimeline
          chartTimezone={chartTimezone}
          initialNodes={initialNodes}
        />
      </div>
      <ExecutionTimelineFooter onTimezoneChange={handleTimezoneChange} />
    </div>
  );
};
