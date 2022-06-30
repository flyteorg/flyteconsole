import { Button, FormControl, FormHelperText, IconButton, TextField } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import * as React from 'react';
import RemoveIcon from '@material-ui/icons/Remove';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { requiredInputSuffix } from './constants';
import { InputProps, InputType, InputTypeDefinition, InputValue } from './types';
import { formatType, getLaunchInputId, parseMappedTypeValue, toMappedTypeValue } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  controls: {
    margin: theme.spacing(1),
    width: '100%',
    display: 'flex',
    alignItems: 'center',
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
    error,
    name,
    onChange,
    value = '',
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

// /** Handles rendering of the input component for any primitive-type input */
// export const MapInput: React.FC<InputProps> = (props) => {
//   const {
//     error,
//     name,
//     onChange,
//     value = '',
//     typeDefinition: { subtype },
//   } = props;
//   const hasError = !!error;
//   const classes = useStyles();
//   const [keyRefs, setKeyRefs] = React.useState<any>([]);

//   const [pairs, setPairs] = React.useState<
//     {
//       key: string;
//       value: string;
//     }[]
//   >([]);
//   const parsed = parseMappedTypeValue(value);
//   React.useEffect(() => {
//     setPairs(parsed);
//   }, [value]);

//   const valueError = error?.startsWith("Value's value");

//   const onAddItem = React.useCallback(() => {
//     setKeyRefs((refs) => [...refs, null]);
//     setPairs((pairs) => [...pairs, { key: '', value: '' }]);
//   }, []);

//   const onDeleteItem = React.useCallback((index) => {
//     setKeyRefs((refs) => [...refs.slice(0, index), ...refs.slice(index + 1)]);
//     setPairs((pairs) => [...pairs.slice(0, index), ...pairs.slice(index + 1)]);
//   }, []);

//   const onUpdate = (newPairs) => {
//     const newValue = toMappedTypeValue(newPairs);
//     setPairs(parseMappedTypeValue(newValue as InputValue));
//     onChange(newValue);
//   };

//   return (
//     <Card variant="outlined" className={hasError ? classes.error : ''}>
//       <CardContent>
//         <FormHelperText id={`${getLaunchInputId(name)}-helper`}>{props.helperText}</FormHelperText>
//         {pairs.map(({ key: itemKey, value: itemValue }, index) => {
//           const keyControl = (
//             <TextField
//               id={`${getLaunchInputId(name)}-key-${index}`}
//               label={`string${requiredInputSuffix}`}
//               inputRef={(ref) => (keyRefs[index] = ref)}
//               onBlur={() => {
//                 onUpdate([
//                   ...pairs.slice(0, index),
//                   { key: keyRefs[index].value, value: itemValue },
//                   ...pairs.slice(index + 1),
//                 ]);
//               }}
//               defaultValue={itemKey}
//               variant="outlined"
//               className={classes.keyControl}
//             />
//           );

//           const isOneLineType =
//             subtype?.type === InputType.String || subtype?.type === InputType.Integer;
//           const valueControl = (
//             <TextField
//               id={`${getLaunchInputId(name)}-value-${index}`}
//               label={subtype ? `${formatType(subtype)}${requiredInputSuffix}` : ''}
//               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                 onUpdate([
//                   ...pairs.slice(0, index),
//                   { key: itemKey, value: e.target.value ?? '' },
//                   ...pairs.slice(index + 1),
//                 ]);
//               }}
//               value={itemValue}
//               variant="outlined"
//               className={classes.valueControl}
//               multiline={!isOneLineType}
//               type={subtype?.type === InputType.Integer ? 'number' : 'text'}
//             />
//           );

//           return (
//             <FormControl className={classes.formControl} key={`${itemKey}-${index}`}>
//               <div className={classes.controls}>
//                 {keyControl}
//                 {valueControl}
//                 <IconButton onClick={() => onDeleteItem(index)}>
//                   <RemoveIcon />
//                 </IconButton>
//               </div>
//             </FormControl>
//           );
//         })}
//         <div className={classes.addButton}>
//           <Button onClick={onAddItem}>+ ADD ITEM</Button>
//         </div>
//         {hasError && (
//           <FormHelperText id={`${getLaunchInputId(name)}-error`}>{error}</FormHelperText>
//         )}
//       </CardContent>
//     </Card>
//   );
// };
