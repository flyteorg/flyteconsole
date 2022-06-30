import { Button, IconButton, TextField } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import RemoveIcon from '@material-ui/icons/Remove';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { requiredInputSuffix } from './constants';
import { InputProps, InputType, InputTypeDefinition } from './types';
import { formatType, toMappedTypeValue } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  controls: {
    margin: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  keyControl: {
    marginRight: theme.spacing(1),
  },
  valueControl: {
    flexGrow: 1,
  },
  addButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1),
  },
  error: {
    border: '1px solid #f44336',
  },
}));

type MapInputItem = {
  id: number | null;
  key: string;
  value: string;
};

interface MapInputItemProps {
  data: MapInputItem;
  subtype?: InputTypeDefinition;
  setKey: (key: string) => void;
  setValue: (value: string) => void;
  isValid: (value: string) => boolean;
  onDeleteItem: () => void;
}

const MapSingleInputItem = (props: MapInputItemProps) => {
  const classes = useStyles();
  const { data, subtype, setKey, setValue, isValid, onDeleteItem } = props;
  // const [key, setKey] = React.useState(data.key);
  // const [value, setValue] = React.useState(data.value);
  const [error, setError] = React.useState(false);

  const isOneLineType = subtype?.type === InputType.String || subtype?.type === InputType.Integer;

  return (
    <div className={classes.controls}>
      <TextField
        label={`string${requiredInputSuffix}`}
        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
          setKey(value);
          setError(!!value && !isValid(value));
        }}
        value={data.key}
        error={error}
        placeholder="key"
        variant="outlined"
        helperText={error ? 'This key already defined' : ''}
        className={classes.keyControl}
      />
      <TextField
        label={subtype ? `${formatType(subtype)}${requiredInputSuffix}` : ''}
        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
          setValue(value);
        }}
        value={data.value}
        variant="outlined"
        className={classes.valueControl}
        multiline={!isOneLineType}
        type={subtype?.type === InputType.Integer ? 'number' : 'text'}
      />
      <IconButton onClick={onDeleteItem}>
        <RemoveIcon />
      </IconButton>
    </div>
  );
};

export const MapInput = (props: InputProps) => {
  const {
    onChange,
    typeDefinition: { subtype },
  } = props;
  const classes = useStyles();

  const isValid = (id: number | null, value: string) => {
    if (id === null) return true;
    // findIndex returns -1 if value is not found, which means we can use that key
    return (
      data
        .filter((item) => item.id !== null && item.id !== id)
        .findIndex((item) => item.key === value) === -1
    );
  };

  const getNewItem = (id): MapInputItem => {
    return { id, key: '', value: '' };
  };

  const [data, setData] = React.useState<MapInputItem[]>([getNewItem(0)]);

  const onAddItem = () => {
    setData((data) => [...data, getNewItem(data.length)]);
  };

  const updateUpperStream = () => {
    const newPairs = data
      .filter((item) => {
        // we filter out delted values and items with errors or empty keys/values
        return item.id !== null && !!item.key && !!item.value;
      })
      .map((item) => {
        return {
          key: item.key,
          value: item.value,
        };
      });
    const newValue = toMappedTypeValue(newPairs);
    onChange(newValue);
  };

  const onSetKey = (id: number | null, key: string) => {
    if (id === null) return;
    setData((data) => {
      data[id].key = key;
      return [...data];
    });
    updateUpperStream();
  };

  const onSetValue = (id: number | null, value: string) => {
    if (id === null) return;
    setData((data) => {
      data[id].value = value;
      return [...data];
    });
    updateUpperStream();
  };

  const onDeleteItem = (id: number | null) => {
    if (id === null) return;
    setData((data) => {
      const dataIndex = data.findIndex((item) => item.id === id);
      if (dataIndex >= 0 && dataIndex < data.length) {
        data[dataIndex].id = null;
      }
      return [...data];
    });
    updateUpperStream();
  };

  return (
    <Card variant="outlined">
      <CardContent>
        {data
          .filter((item) => item.id !== null)
          .map((item) => {
            return (
              <MapSingleInputItem
                key={item.id}
                data={item}
                subtype={subtype}
                setKey={(key) => onSetKey(item.id, key)}
                setValue={(value) => onSetValue(item.id, value)}
                isValid={(value) => isValid(item.id, value)}
                onDeleteItem={() => onDeleteItem(item.id)}
              />
            );
          })}
        <div className={classes.addButton}>
          <Button onClick={onAddItem}>+ ADD ITEM</Button>
        </div>
      </CardContent>
    </Card>
  );
};
