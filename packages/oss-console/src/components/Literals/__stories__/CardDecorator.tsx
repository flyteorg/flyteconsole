import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { DecoratorFn } from '@storybook/react';
import * as React from 'react';

import { useCommonStyles } from '../../common/styles';

/** Shared decorator for Literal stories which places each story inside a Card
 * and sets a monospace font for better readability.
 */
export const CardDecorator: DecoratorFn = (story) => (
  <Card>
    <CardContent>
      <div className={useCommonStyles().textMonospace}>{story()}</div>
    </CardContent>
  </Card>
);
