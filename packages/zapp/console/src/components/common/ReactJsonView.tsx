import * as React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import ReactJsonView, { ReactJsonViewProps } from 'react-json-view';
import * as copyToClipboard from 'copy-to-clipboard';
import { primaryTextColor, smallFontSize } from 'components/Theme/constants';

const useStyles = makeStyles((theme: Theme) => ({
  jsonViewer: {
    marginLeft: '-10px',
    width: '100%',
    fontSize: smallFontSize,
    '& span': {
      fontWeight: 'normal !important',
    },
    '& .object-container': {
      overflowWrap: 'anywhere !important',
    },
    '& .copy-to-clipboard-container': {
      position: 'absolute',
    },
    '& .copy-icon svg': {
      color: `${theme.palette.primary.main} !important`,
    },
    '& .variable-value': {
      paddingLeft: '5px',
    },
    '& .variable-value >*': {
      color: `${primaryTextColor} !important`,
    },
    '& .object-key-val': {
      padding: '0 0 0 5px !important',
    },
    '& .object-key': {
      color: `${theme.palette.grey[500]} !important`,
    },
  },
}));

export const ReactJsonViewWrapper: React.FC<ReactJsonViewProps> = (props) => {
  const styles = useStyles();

  return (
    <div className={styles.jsonViewer}>
      <ReactJsonView
        enableClipboard={(options) => {
          const objToCopy = options.src;
          const text = typeof objToCopy === 'object' ? JSON.stringify(objToCopy) : objToCopy;
          copyToClipboard(text);
        }}
        displayDataTypes={false}
        quotesOnKeys={false}
        iconStyle="triangle"
        displayObjectSize={true}
        name={null}
        indentWidth={4}
        collapseStringsAfterLength={80}
        sortKeys={true}
        {...props}
      />
    </div>
  );
};
