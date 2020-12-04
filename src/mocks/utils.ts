import { Protobuf } from 'flyteidl';
import { apiPrefix } from 'models/AdminEntity/constants';

export function apiPath(path: string) {
    return `${apiPrefix}${path}`;
}

export function timeStampOffset(
    timeStamp: Protobuf.ITimestamp,
    offsetSeconds: number
): Protobuf.Timestamp {
    const output = new Protobuf.Timestamp(timeStamp);
    output.seconds =
        offsetSeconds < 0
            ? output.seconds.subtract(offsetSeconds)
            : output.seconds.add(offsetSeconds);
    return output;
}
