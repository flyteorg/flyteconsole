import React from 'react';
import Protobuf from '@clients/common/flyteidl/protobuf';
import { unknownValueString } from '@clients/common/constants';
import { dateWithFromNow, protobufDurationToHMS } from '../../../common/formatters';
import { timestampToDate } from '../../../common/utils';
import { DetailsGroup } from '../../common/DetailsGroup';

/** Renders the less important details for a `TaskExecution` as a `DetailsGroup`
 */
export const TaskExecutionDetails: React.FC<{
  startedAt?: Protobuf.ITimestamp;
  updatedAt?: Protobuf.ITimestamp | null;
  duration?: Protobuf.Duration;
}> = ({ startedAt, duration, updatedAt }) => {
  // const labelWidthGridUnits = startedAt ? 7 : 10;
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
    }
    return [
      {
        name: 'last updated',
        content: updatedAt ? dateWithFromNow(timestampToDate(updatedAt)) : unknownValueString,
      },
    ];
  }, [startedAt, duration, updatedAt]);

  return (
    <section>
      <DetailsGroup items={detailItems} />
    </section>
  );
};
