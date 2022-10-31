import { unknownValueString } from 'common/constants';
import { dateWithFromNow, protobufDurationToHMS } from 'common/formatters';
import { timestampToDate, Protobuf } from '@flyteconsole/components';
import { DetailsGroup } from 'components/common/DetailsGroup';
import * as React from 'react';

/** Renders the less important details for a `TaskExecution` as a `DetailsGroup`
 */
export const TaskExecutionDetails: React.FC<{
  startedAt?: Protobuf.ITimestamp;
  updatedAt?: Protobuf.ITimestamp | null;
  duration?: Protobuf.Duration;
}> = ({ startedAt, duration, updatedAt }) => {
  const labelWidthGridUnits = startedAt ? 7 : 10;
  const detailItems = React.useMemo(() => {
    if (startedAt) {
      return [
        {
          name: 'started',
          content: dateWithFromNow(timestampToDate(startedAt)),
        },
        {
          name: 'run time',
          content: duration ? protobufDurationToHMS(duration) : unknownValueString,
        },
      ];
    } else {
      return [
        {
          name: 'last updated',
          content: updatedAt ? dateWithFromNow(timestampToDate(updatedAt)) : unknownValueString,
        },
      ];
    }
  }, [startedAt, duration, updatedAt]);

  return (
    <section>
      <DetailsGroup labelWidthGridUnits={labelWidthGridUnits} items={detailItems} />
    </section>
  );
};
