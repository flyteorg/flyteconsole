import * as React from 'react';
import { storiesOf } from '@storybook/react';
import Typography from '@mui/material/Typography';

const stories = storiesOf('Basics/Typography', module);
stories.add('Typography', () => (
  <div>
    <Typography variant="h1" style={{ margin: '8px', overflow: 'hidden' }}>
      h1 - Mulish • Medium / 48 (size) • 59 (height)
      <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <Typography variant="h2" style={{ margin: '8px', overflow: 'hidden' }}>
      h2 - Mulish • Medium / 28 (size) • 34 (height)
      <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <Typography variant="h3" style={{ margin: '8px', overflow: 'hidden' }}>
      h3 - Mulish • Medium / 24 (size) • 32 (height)
      <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <Typography variant="h4" style={{ margin: '8px', overflow: 'hidden' }}>
      h4 - Mulish • Medium / 16 (size) • 22 (height)
      <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <Typography variant="h5" style={{ margin: '8px', overflow: 'hidden' }}>
      h5 - Mulish • Medium / 14 (size) • 17 (height) <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <Typography variant="h6" style={{ margin: '8px', overflow: 'hidden' }}>
      h6 - Mulish • Medium / 12 (size) • 15 (height) <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <br />
    <Typography variant="body1" style={{ margin: '8px', overflow: 'hidden' }}>
      body1 - Mulish • Regular / 14 (size) • 17 (height) <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <Typography variant="body2" style={{ margin: '8px', overflow: 'hidden' }}>
      body2 (Value) - Courier • Regular / 14 (size) • 16 (height) <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <Typography variant="button" style={{ margin: '8px', overflow: 'hidden' }}>
      button <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <br />
    <Typography variant="code" style={{ margin: '8px', overflow: 'hidden' }}>
      code - Space Mono • Regular / 12 (size) • 18 (height) <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <br />
    <Typography variant="label" style={{ margin: '8px', overflow: 'hidden' }}>
      label - Mulish • Medium / 12 (size) • 13 (height) <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <br />
    <Typography variant="stats" style={{ margin: '8px', overflow: 'hidden' }}>
      stats - Mulish • Medium / 10 (size) • 11 (height) <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
    <br />
    <Typography variant="caption" style={{ margin: '8px', overflow: 'hidden' }}>
      caption - Mulish • Light / 10 (size) • 11 (height) <br />
      abcdefghijklmnopqrstuvwxyz
    </Typography>
  </div>
));
