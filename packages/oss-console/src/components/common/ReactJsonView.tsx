import React from 'react';
import ReactJsonView, { ReactJsonViewProps } from 'react-json-view';
import copyToClipboard from 'copy-to-clipboard';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import cloneDeep from 'lodash/cloneDeep';
import { transformDecodedApiResponse } from './apiResponseUtils';

const JsonViewer = styled('div')(({ theme }) => ({
  marginLeft: '-10px',
  width: '100%',
  '& .variable-row': {
    fontSize: 14,
  },
  '& .object-container': {
    overflowWrap: 'anywhere !important',
  },
  '& .copy-to-clipboard-container': {
    position: 'absolute',
  },
  '& .copy-icon svg': {
    color: `${CommonStylesConstants.primaryHighlightColor} !important`,
  },
  '& .variable-value': {
    paddingLeft: '5px',
  },
  '& .variable-value >*': {
    color: `${CommonStylesConstants.primaryTextColor} !important`,
  },
  '& .object-key-val': {
    padding: '0 0 0 5px !important',
  },
  '& .object-key': {
    color: `${theme.palette.grey[500]} !important`,
  },
  '& .node-ellipsis': {
    color: `${theme.palette.grey[500]} !important`,
  },
}));

/**
 *
 * Replacer functionality to pass to the JSON.stringify function that
 * does proper serialization of arrays that contain non-numeric indexes
 * @param _ parent element key
 * @param value the element being serialized
 * @returns Transformed version of input
 */
const replacer = (_, value) => {
  // Check if associative array
  if (value instanceof Array && Object.keys(value).some((v) => Number.isNaN(+v))) {
    // Serialize associative array
    return Object.keys(value).reduce((acc, arrKey) => {
      // if:
      //     string key is encountered insert {[key]: value} into transformed array
      // else:
      //     insert original value
      acc.push(Number.isNaN(+arrKey) ? { [arrKey]: value[arrKey] } : value[arrKey]);

      return acc;
    }, [] as any[]);
  }

  // Non-associative array. return original value to allow default JSON.stringify behavior
  return value;
};

/**
 * Custom implementation for JSON.stringify to allow
 * proper serialization of arrays that contain non-numeric indexes
 *
 * @param json Object to serialize
 * @returns A string version of the input json
 */
const customStringify = (json: Object) => {
  return JSON.stringify(json, replacer);
};

export const ReactJsonViewWrapper: React.FC<ReactJsonViewProps> = (props) => {
  const src = transformDecodedApiResponse(cloneDeep(props?.src));
  return (
    <JsonViewer>
      <ReactJsonView
        enableClipboard={(options) => {
          const objToCopy = options.src;
          const text = typeof objToCopy === 'object' ? customStringify(objToCopy) : objToCopy;
          copyToClipboard(text);
        }}
        displayDataTypes={false}
        quotesOnKeys={false}
        iconStyle="triangle"
        displayObjectSize
        name={null}
        indentWidth={4}
        collapseStringsAfterLength={80}
        sortKeys
        {...props}
        src={src}
      />
    </JsonViewer>
  );
};
