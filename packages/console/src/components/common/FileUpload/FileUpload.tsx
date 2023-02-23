import { makeStyles, Theme } from '@material-ui/core';
import React from 'react';
import { DropzoneProps, useDropzone } from 'react-dropzone';
import FileItem from './FileItem';

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
    gap: theme.spacing(0.5),
    padding: theme.spacing(4, 3),
    border: `0.5px dashed ${theme.palette.divider}`,
    borderRadius: '4px',
  },
  filesContainer: {
    width: '100%',
  },
  highlight: {
    color: theme.palette.primary.main,
  },
}));

export interface FileUploadProps extends DropzoneProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  helpText?: React.ReactNode;
}

export function FileUpload({
  files,
  setFiles,
  helpText,
  ...options
}: FileUploadProps) {
  const styles = useStyles();
  const { getRootProps, getInputProps } = useDropzone({
    ...options,
    onDrop: (acceptedFiles, fileRejections, event) => {
      setFiles(acceptedFiles);
      options?.onDrop?.(acceptedFiles, fileRejections, event);
    },
  });

  const removeFile = (fileIdx: number) => {
    setFiles(files => files.filter((_, idx) => idx !== fileIdx));
  };

  const ctaText = files.length ? 'Replace file' : 'Upload a file';

  return (
    <div className={styles.container}>
      <div {...getRootProps({ className: styles.uploadContainer })}>
        <div className={styles.filesContainer}>
          {files.map((file, idx) => (
            <FileItem
              file={file}
              remove={() => removeFile(idx)}
              key={file.name}
            />
          ))}
        </div>
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

export default FileUpload;
