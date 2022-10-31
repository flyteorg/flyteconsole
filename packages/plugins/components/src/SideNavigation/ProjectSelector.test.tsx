import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { createMockProjects } from './__mocks__/projectData';
import { ProjectSelector, ProjectSelectorProps } from './ProjectSelector';
import { KeyCodes } from './constants';

describe('ProjectSelector', () => {
  let props: ProjectSelectorProps;
  const renderProjectSelector = () => render(<ProjectSelector {...props} />);

  beforeEach(() => {
    const projects = createMockProjects();
    props = {
      projects,
      onProjectSelected: jest.fn(),
      selectedProject: projects[0],
    };
  });
  describe('while collapsed', () => {
    it('should not render list items', () => {
      const { queryByText } = renderProjectSelector();
      expect(queryByText(props.projects[1].name)).toBeNull();
    });
  });

  describe('while expanded', () => {
    let rendered: ReturnType<typeof renderProjectSelector>;
    beforeEach(async () => {
      rendered = renderProjectSelector();
      const expander = rendered.getByText(props.projects[0].name);
      await fireEvent.click(expander);
    });

    it('should render list items', () => {
      expect(rendered.getByText(props.projects[1].name)).toBeTruthy();
    });

    it('should collapse when hitting escape', async () => {
      await fireEvent.keyDown(rendered.getByRole('search'), {
        keyCode: KeyCodes.ESCAPE,
      });
      expect(rendered.queryByText(props.projects[1].name)).toBeNull();
    });

    it('should collapse when an item is selected', async () => {
      await fireEvent.click(rendered.getByText(props.projects[1].name));
      expect(rendered.queryByText(props.projects[1].name)).toBeNull();
    });
  });
});
