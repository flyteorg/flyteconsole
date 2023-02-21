import { makeStyles, Theme } from '@material-ui/core';
import { noop } from 'lodash';
import React, { useEffect } from 'react';
import { DropzoneProps, useDropzone } from 'react-dropzone';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: 'auto',
    maxWidth: '536px',
    color: theme.palette.grey[400],
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
  highlight: {
    color: theme.palette.primary.main,
  },
}));

interface Props {
  options?: DropzoneProps;
  helpText?: React.ReactNode;
  onChange?: (files: File[]) => void;
}

export function DraggableFileUpload({
  options,
  helpText,
  onChange = noop,
}: Props) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone(options);
  const styles = useStyles();

  useEffect(() => {
    onChange(acceptedFiles);
  }, [onChange, acceptedFiles]);

  const ctaText = acceptedFiles.length ? 'Replace file' : 'Upload a file';

  return (
    <div className={styles.container}>
      <div className={styles.uploadContainer} {...getRootProps}>
        <div>
          <span className={styles.highlight}>{ctaText}</span> or drag and drop
          here
        </div>
        {helpText}
        <input {...getInputProps()} />
      </div>
    </div>
  );
}

export default DraggableFileUpload;
