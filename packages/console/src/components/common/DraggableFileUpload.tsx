import { makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import { DropzoneProps, useDropzone } from 'react-dropzone';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: 'auto',
    maxWidth: '536px',
    color: theme.palette.grey[400],
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(2),
    cursor: 'pointer',
  },
  uploadContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4, 3),
    border: `0.5px dashed ${theme.palette.divider}`,
    borderRadius: '4px',
  },
  underline: {
    textDecoration: 'underline',
  },
  highlight: {
    color: theme.palette.text.primary,
  },
}));

interface Props {
  options?: DropzoneProps;
}

export function DraggableFileUpload({ options }: Props) {
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone(options);
  const styles = useStyles();

  const ctaText = acceptedFiles.length ? 'Replace file' : 'Upload a file';

  return (
    <div className={styles.container}>
      <div className={styles.uploadContainer} {...getRootProps}>
        <div>
          <span className={styles.highlight}>{ctaText}</span> or drag and drop
          here
        </div>
        <div>(File types: txt, doc, docx, rtf, pdf)</div>
        <input {...getInputProps()} />
      </div>
      <div className={styles.underline}>Enter Manually</div>
    </div>
  );
}

export default DraggableFileUpload;
