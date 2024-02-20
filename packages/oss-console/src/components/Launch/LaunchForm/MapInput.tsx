import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import styled from '@mui/system/styled';
import RemoveIcon from '@mui/icons-material/Remove';
import t from './strings';
import { InputProps, InputType, InputTypeDefinition, InputValue } from './types';
import { formatType, toMappedTypeValue } from './utils';
import { getHelperForInput } from './inputHelpers/getHelperForInput';
import { StyledCard } from './LaunchFormComponents/StyledCard';

const MapInputControls = styled('div')(({ theme }) => ({
  margin: theme.spacing(1),
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'row',

  '.formControl': {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  '.keyControl': {
    marginRight: theme.spacing(1),
  },
  '.valueControl': {
    flexGrow: 1,
  },

  '.error': {
    border: '1px solid #f44336',
  },
}));

const AddMapInputContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(1),
}));

type MapInputItem = {
  id: number | null;
  key: string;
  value: string;
};

const arrayToMappedType = (array: MapInputItem[]): string => {
  const newPairs = array.map((item) => {
    return {
      key: item.key,
      value: item.value,
    };
  });

  return toMappedTypeValue(newPairs);
};

interface MapInputItemProps {
  data: MapInputItem;
  typeDefinition: InputTypeDefinition;
  setKey: (key: string) => void;
  setValue: (value: string) => void;
  validate: (value: MapInputItem) => string | undefined;
  onDeleteItem: () => void;
}

const MapSingleInputItem = (props: MapInputItemProps) => {
  const { data, typeDefinition, setKey, setValue, onDeleteItem, validate } = props;
  // const [tupleError, setTupleError] = React.useState<string>();

  const tupleError = validate(data);
  const { subtype } = typeDefinition;
  const isOneLineType = subtype?.type === InputType.String || subtype?.type === InputType.Integer;

  return (
    <div>
      <MapInputControls>
        <TextField
          label={`string${t('requiredInputSuffix')}`}
          onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
            setKey(value);
          }}
          value={data.key}
          error={!!tupleError}
          placeholder="key"
          variant="outlined"
          className="keyControl"
        />
        <TextField
          label={subtype ? `${formatType(subtype)}${t('requiredInputSuffix')}` : ''}
          onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
            setValue(value);
          }}
          value={data.value}
          variant="outlined"
          className="valueControl"
          multiline={!isOneLineType}
          type={subtype?.type === InputType.Integer ? 'number' : 'text'}
          error={!!tupleError}
        />
        <IconButton onClick={onDeleteItem} size="large">
          <RemoveIcon />
        </IconButton>
      </MapInputControls>
      <FormHelperText error={!!tupleError}>{tupleError}</FormHelperText>
    </div>
  );
};

const getNewMapItem = (id, key = '', value = ''): MapInputItem => {
  return { id, key, value };
};

function parseMappedTypeValue(value?: InputValue): MapInputItem[] {
  const fallback = [getNewMapItem(0)];
  if (!value) {
    return fallback;
  }
  try {
    const mapObj = JSON.parse(value.toString());
    if (typeof mapObj === 'object') {
      return Object.keys(mapObj).map((key, index) => getNewMapItem(index, key, mapObj[key]));
    }
  } catch (e) {
    // do nothing
  }

  return fallback;
}

export const MapInput = (props: InputProps) => {
  const { value, label, onChange, error, typeDefinition, name } = props;
  const [data, setData] = React.useState<MapInputItem[]>(parseMappedTypeValue(value));

  const onAddItem = () => {
    setData((data) => [...data, getNewMapItem(data.length)]);
  };

  useEffect(() => {
    try {
      const newValue = arrayToMappedType(data);
      onChange(newValue);
    } catch (error) {
      // noop
    }
  }, [data]);

  const onSetKey = (index: number, key: string) => {
    const newData = [...data];
    newData[index].key = key;
    setData([...newData]);
  };

  const onSetValue = (index: number, value: string) => {
    const newData = [...data];
    newData[index].value = value;
    setData([...newData]);
  };

  const onDeleteItem = (index) => {
    const newData = [...data];
    if (index >= 0 && index < newData.length) {
      newData.splice(index, 1);
    }
    setData([...newData]);
  };

  return (
    <StyledCard error={error} label={label} name={name}>
      {data
        .filter((item) => item.id !== null)
        .map((item, index) => {
          return (
            <MapSingleInputItem
              key={item.id}
              data={item}
              typeDefinition={typeDefinition}
              setKey={(key) => onSetKey(index, key)}
              setValue={(value) => onSetValue(index, value)}
              validate={(value) => {
                const instances = data.filter((i) => i.key === value.key);
                if (instances.length > 1) {
                  return 'Duplicate key';
                }

                const helper = getHelperForInput(typeDefinition.type);
                try {
                  helper.validate({
                    typeDefinition,
                    value: arrayToMappedType([value]),
                    required: true,
                  } as any);
                } catch (e) {
                  return e.message;
                }
              }}
              onDeleteItem={() => onDeleteItem(index)}
            />
          );
        })}
      <AddMapInputContainer>
        <Button onClick={onAddItem}>+ ADD ITEM</Button>
      </AddMapInputContainer>
    </StyledCard>
  );
};
