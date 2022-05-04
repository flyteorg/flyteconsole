import { ReactJsonViewWrapper } from 'components/common/ReactJsonView';
import { LiteralMap } from 'models/Common/types';
import * as React from 'react';
import { transformLiteralMap } from './helpers';
import { NoneTypeValue } from './Scalar/NoneTypeValue';

export const NoDataIsAvailable = () => {
  return (
    <p>
      <em>No data is available.</em>
    </p>
  );
};

/** Renders a LiteralMap as a formatted object */
export const LiteralMapViewer: React.FC<{
  className?: string;
  map: LiteralMap | null;
  showBrackets?: boolean;
}> = ({ map }) => {
  if (!map) {
    return <NoDataIsAvailable />;
  }

  const { literals } = map;

  if (!Object.keys(literals).length) {
    return <NoneTypeValue />;
  }

  let transformedLiterals = transformLiteralMap(literals);

  let rootNode: string | null = null;

  const transformedLiteralsKeys = Object.keys(transformedLiterals);
  if (
    transformedLiteralsKeys.length === 1 &&
    typeof transformedLiterals[transformedLiteralsKeys[0]] === 'object'
  ) {
    rootNode = transformedLiteralsKeys[0];
    transformedLiterals = transformedLiterals[rootNode!];
  }

  return (
    <>
      <ReactJsonViewWrapper name={rootNode} src={transformedLiterals} />
    </>
  );
};
