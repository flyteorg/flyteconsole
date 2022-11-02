import { storiesOf } from '@storybook/react';
import { ContentContainer } from 'components/common/ContentContainer';
import * as React from 'react';
import { SideNavigation } from '@flyteconsole/components';
import { NavBar } from '../NavBar';

const stories = storiesOf('Navigation', module);
stories.addDecorator((story) => (
  <>
    <NavBar />
    {story()}
  </>
));

stories.add('SideNavigation', () => <SideNavigation />);
stories.add('SideNavigation with content', () => (
  <>
    <SideNavigation />
    <ContentContainer sideNav={true}>
      <h2>Content Goes Here</h2>
      <p>Paragraph text goes here.</p>
    </ContentContainer>
  </>
));
