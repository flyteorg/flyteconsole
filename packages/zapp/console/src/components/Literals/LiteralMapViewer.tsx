import classnames from 'classnames';
import { sortedObjectEntries } from 'common/utils';
import { ReactJsonViewWrapper } from 'components/common/ReactJsonView';
import { useCommonStyles } from 'components/common/styles';
import { Literal, LiteralMap } from 'models/Common/types';
import * as React from 'react';
import { htmlEntities } from './constants';
import { transformLiteralMap } from './helpers';
import { LiteralValue } from './LiteralValue';
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
  showJson?: boolean;
}> = ({ className, map, showBrackets = false, showJson }) => {
  if (!map) {
    return <NoDataIsAvailable />;
  }

  const commonStyles = useCommonStyles();
  const { literals } = map;

  if (!Object.keys(literals).length) {
    return <NoneTypeValue />;
  }

  let transformedLiterals = transformLiteralMap(literals);

  const mapContent = Object.keys(literals).length ? (
    <ul className={classnames(className, commonStyles.textMonospace, commonStyles.listUnstyled)}>
      {sortedObjectEntries(literals).map(([key, value]) => (
        <li key={key}>
          <LiteralValue label={key} literal={value as Literal} />
        </li>
      ))}
    </ul>
  ) : (
    <div className={commonStyles.flexCenter}>
      <NoneTypeValue />
    </div>
  );

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
      {showBrackets && <span>{htmlEntities.leftCurlyBrace}</span>}
      {mapContent}
      {showBrackets && <span>{htmlEntities.rightCurlyBrace}</span>}

      {showJson !== false && <ReactJsonViewWrapper name={rootNode} src={transformedLiterals} />}
    </>
  );
};
