import React, { PropsWithChildren } from 'react';
import { useNodeExecutionDynamicContext } from 'components/Executions/contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { COLOR_SPECTRUM } from 'components/Theme/colorSpectrum';
import { NodeExecutionPhase } from 'models';
import { getNestedContainerStyle } from './utils';

const BREAD_FONT_SIZE = '9px';
const BREAD_COLOR_ACTIVE = COLOR_SPECTRUM.purple60.color;
const BREAD_COLOR_INACTIVE = COLOR_SPECTRUM.black.color;

export const BreadElement = ({
  nestedView,
  index,
  currentNestedDepth,
  scopedId,
  onClick,
}) => {
  const liStyles: React.CSSProperties = {
    cursor: 'pointer',
    fontSize: BREAD_FONT_SIZE,
    color: BREAD_COLOR_ACTIVE,
  };

  const liStyleInactive: React.CSSProperties = { ...liStyles };
  liStyleInactive['color'] = BREAD_COLOR_INACTIVE;

  const beforeStyle: React.CSSProperties = {
    cursor: 'pointer',
    color: BREAD_COLOR_ACTIVE,
    padding: '0 .2rem',
    fontSize: BREAD_FONT_SIZE,
  };
  // const onClick =
  //   currentNestedDepth > index + 1 ? handleNestedViewClick : undefined;
  return (
    <li
      onClick={onClick}
      style={index === currentNestedDepth - 1 ? liStyleInactive : liStyles}
      id={`${scopedId}_${index}`}
      key={`${scopedId}_${index}key`}
    >
      {index === 0 ? <span style={beforeStyle}>{'>'}</span> : null}
      {nestedView}
      {index < currentNestedDepth - 1 ? (
        <span style={beforeStyle}>{'>'}</span>
      ) : null}
    </li>
  );
};

const BorderElement = ({
  nodeExecutionStatus,
  children,
}: PropsWithChildren<{
  nodeExecutionStatus: NodeExecutionPhase;
}>) => {
  const { componentProps } = useNodeExecutionDynamicContext();

  const borderStyle = getNestedContainerStyle(nodeExecutionStatus);

  return (
    <div style={borderStyle} {...componentProps}>
      {children}
    </div>
  );
};

export const BorderContainer = ({
  nodeExecutionStatus,
  currentNestedDepth,
  children,
}: PropsWithChildren<{
  currentNestedDepth: number;
  nodeExecutionStatus: NodeExecutionPhase;
}>) => {
  let borders = (
    <BorderElement nodeExecutionStatus={nodeExecutionStatus}>
      {children}
    </BorderElement>
  );
  for (let i = 0; i < currentNestedDepth; i++) {
    borders = (
      <BorderElement nodeExecutionStatus={nodeExecutionStatus}>
        {borders}
      </BorderElement>
    );
  }

  return borders;
};

const breadContainerStyle: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  width: '100%',
  marginTop: '-1rem',
};
const olStyles: React.CSSProperties = {
  margin: 0,
  padding: 0,
  display: 'flex',
  listStyle: 'none',
  listStyleImage: 'none',
  minWidth: '1rem',
};
const headerStyle: React.CSSProperties = {
  color: BREAD_COLOR_ACTIVE,
  fontSize: BREAD_FONT_SIZE,
  margin: 0,
  padding: 0,
};

export const BreadCrumbContainer = ({
  text,
  currentNestedDepth,
  handleRootClick,
  children,
}: PropsWithChildren<{
  text: string;
  currentNestedDepth: number;
  handleRootClick: () => void;
}>) => {
  const rootClick = currentNestedDepth > 0 ? handleRootClick : undefined;
  return (
    <div style={breadContainerStyle}>
      <header
        style={headerStyle}
        onClick={e => {
          e.stopPropagation();
          rootClick?.();
        }}
      >
        {text}
      </header>
      <ol style={olStyles}>{children}</ol>
    </div>
  );
};
