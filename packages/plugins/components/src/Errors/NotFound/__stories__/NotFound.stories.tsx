import * as React from 'react';

import { storiesOf } from '@storybook/react';
import { NotFound } from '..';

const stories = storiesOf('Views', module);
stories.add('Not Found', () => <NotFound />);
