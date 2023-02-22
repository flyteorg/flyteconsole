import { makeStyles, Theme } from '@material-ui/core';
import { Clear, Done } from '@material-ui/icons';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    background: theme.palette.grey[100],
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '8px',
    alignItems: 'center',
    width: '100%',
    padding: theme.spacing(1, 0.5),
    fontSize: 12,
  },
  icon: {
    color: theme.palette.success.main,
  },
  fileName: {
    flex: 1,
    textAlign: 'left',
  },
}));

interface Props {
  file: File;
  remove: () => void;
}

function FileItem({ file, remove }: Props) {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Done className={styles.icon} />
      <div className={styles.fileName}>{file.name}</div>
      <Clear
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();

          remove();
        }}
      />
    </div>
  );
}

export default FileItem;
