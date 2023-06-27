import { FormHelperText, TextField, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { BlobDimensionality } from 'models/Common/types';
import * as React from 'react';
import FileUpload from 'components/common/FileUpload/FileUpload';
import { useUploadLocation } from 'components/hooks/useDataProxy';
import { COLOR_SPECTRUM } from 'components/Theme/colorSpectrum';
import { FileRejection } from 'react-dropzone';
import md5 from 'md5';
import t from './strings';
import { InputProps } from './types';
import { getLaunchInputId, isBlobValue } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  dimensionalityInput: {
    flex: '1 1 auto',
    marginLeft: theme.spacing(2),
  },
  formatInput: {
    flex: '1 1 auto',
  },
  inputContainer: {
    marginTop: theme.spacing(1),
  },
  metadataContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
    width: '100%',
  },
  enterManually: {
    fontSize: '12px',
    lineHeight: '18px',
    color: COLOR_SPECTRUM.gray25.color,
    textDecoration: 'underline',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: theme.spacing(0.5),
  },
  uriInput: {
    '& > div': {
      padding: 0,
    },
  },
  uriInputTextarea: {
    maxHeight: '77px',
    overflow: 'auto !important',
    padding: '18.5px 14px',
  },
}));

/** A micro form for entering the values related to a File Literal */
export const FileInput: React.FC<InputProps> = props => {
  const styles = useStyles();
  const {
    error,
    label,
    name,
    onChange,
    value: propValue,
    typeDefinition,
    setIsError,
    state,
  } = props;
  const [isManual, setIsManual] = React.useState<boolean>(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const dimensionality = typeDefinition?.literalType?.blob?.dimensionality;
  const blobValue = isBlobValue(propValue)
    ? propValue
    : {
        uri: '',
        dimensionality: dimensionality ?? BlobDimensionality.SINGLE,
      };
  const hasError = !!error || !!uploadError;
  const helperText = hasError ? error || uploadError : props.helperText;

  const { upload } = useUploadLocation();

  const handleUriChange = ({
    target: { value: uri },
  }: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...blobValue,
      uri,
    });
  };

  React.useEffect(() => {
    const { sourceId } = state.context;
    if (files.length && sourceId) {
      const reader = new FileReader();

      reader.onabort = () => setIsError(true);
      reader.onerror = () => setIsError(true);
      reader.onload = () => {
        const binaryStr = reader.result as string;

        if (binaryStr)
          upload(
            sourceId.project,
            sourceId.domain,
            files[0].name,
            md5(binaryStr),
            (uri: string) => {
              onChange({
                ...blobValue,
                uri,
              });
            },
          );
      };
      reader.readAsArrayBuffer(files[0]);
    }
  }, [files]);

  const onSwitch = () => {
    setIsManual(isManual => !isManual);
    setUploadError(null);
  };

  const onDrop = (acceptedFiles, fileRejections: FileRejection[]) => {
    if (fileRejections.length) {
      setIsError(true);
      setUploadError(fileRejections[0].errors[0].message);
    } else {
      setUploadError(null);
    }
  };

  return (
    <div>
      <Typography variant="body1" component="label">
        {label}
      </Typography>
      <FormHelperText error={hasError}>{helperText}</FormHelperText>
      <div className={styles.inputContainer}>
        {isManual ? (
          <TextField
            id={getLaunchInputId(`${name}-uri`)}
            fullWidth={true}
            onChange={handleUriChange}
            value={blobValue.uri}
            variant="outlined"
            multiline
            className={styles.uriInput}
            inputProps={{
              className: styles.uriInputTextarea,
            }}
          />
        ) : (
          <FileUpload
            files={files}
            setFiles={setFiles}
            helpText={t('blobFileTypesHelperText')}
            multiple={false}
            maxSize={1024}
            onDrop={onDrop}
            accept={{
              '': ['.txt', '.doc', '.docx', '.rtf', '.pdf', '.py'],
            }}
          />
        )}
        <Typography
          variant="body1"
          className={styles.enterManually}
          onClick={onSwitch}
        >
          {isManual ? t('blobUriUndo') : t('blobUriEnterManually')}
        </Typography>
      </div>
    </div>
  );
};
