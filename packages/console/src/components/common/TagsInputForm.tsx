import {
  Chip,
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
  makeStyles,
  OutlinedInput,
  Theme,
  Link,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { getColorFromString } from 'components/utils';
import * as React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  input: {
    margin: `${theme.spacing(1)}px 0`,
  },
  listHeader: {
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    textTransform: 'uppercase',
  },
  resetLink: {
    marginLeft: theme.spacing(4),
    width: theme.spacing(5),
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 0,
    textTransform: 'uppercase',
    color: theme.palette.text.secondary,
  },
  tagStack: {
    display: 'flex',
    gap: theme.spacing(0.5),
    flexWrap: 'wrap',
    width: '240px',
    margin: `${theme.spacing(1)}px 0`,
  },
}));

export interface TagsInputFormProps {
  label: string;
  placeholder?: string;
  onChange: (tags: string[]) => void;
  defaultValue: string[];
}

/** Form content for rendering a header and search input. The value is applied
 * on submission of the form.
 */
export const TagsInputForm: React.FC<TagsInputFormProps> = ({
  label,
  placeholder,
  onChange,
  defaultValue,
}) => {
  const [tags, setTags] = React.useState<string[]>(defaultValue);
  const [value, setValue] = React.useState('');
  const composition = React.useRef(false);

  const styles = useStyles();
  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => setValue(value);

  const addTag = () => {
    const newTag = value.trim();
    setValue('');
    if (!tags.includes(newTag) && newTag !== '') {
      const newTags = [...tags, newTag];
      setTags(newTags);
      onChange(newTags);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    onChange(newTags);
  };

  const handleClickReset = () => {
    setTags([]);
    onChange([]);
  };

  const resetControl = tags.length ? (
    <Link
      className={styles.resetLink}
      component="button"
      variant="body1"
      onClick={handleClickReset}
    >
      Reset
    </Link>
  ) : (
    <div className={styles.resetLink} />
  );

  return (
    <div>
      <div className={styles.title}>
        <FormLabel className={styles.listHeader}>{label}</FormLabel>
        {resetControl}
      </div>
      <FormControl margin="dense" variant="outlined" fullWidth={true}>
        <OutlinedInput
          autoFocus={true}
          className={styles.input}
          labelWidth={0}
          onChange={onInputChange}
          onCompositionStart={() => (composition.current = true)}
          onCompositionEnd={() => (composition.current = false)}
          placeholder={placeholder}
          type="text"
          value={value}
          onKeyDown={e => {
            if (e.key === 'Enter' && !composition.current) {
              addTag();
            }
          }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton component="span" size="small" onClick={addTag}>
                <Add />
              </IconButton>
            </InputAdornment>
          }
        />
        <div className={styles.tagStack}>
          {tags.map(tag => {
            return (
              <Chip
                key={tag}
                label={tag}
                color="default"
                size="small"
                onDelete={() => removeTag(tag)}
                style={{
                  backgroundColor: getColorFromString(tag),
                }}
              />
            );
          })}
        </div>
      </FormControl>
    </div>
  );
};
