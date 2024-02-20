import React from 'react';
import Link, { LinkProps } from '@mui/material/Link';
import styled from '@mui/system/styled';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useCommonStyles } from './styles';

const ExternalBlockContainer = styled('div')(() => ({
  alignItems: 'center',
  display: 'flex',
}));

interface NewTargetLinkProps extends LinkProps {
  /** If set to true, will show an icon next to the link hinting to the user that they will be leaving the site */
  external?: boolean;
  /** If set to true, will be rendered as a <span> to preserve inline behavior */
  inline?: boolean;
}

/** Renders a link which will be opened in a new tab while also including the required props to avoid
 * linter errors. Can be configured to show a special icon for external links as a hint to the user.
 */
export const NewTargetLink: React.FC<NewTargetLinkProps> = (props) => {
  const { className, children, external = false, inline = false, ...otherProps } = props;
  const commonStyles = useCommonStyles();

  const icon = external ? <OpenInNew className={commonStyles.iconRight} /> : null;

  return (
    <Link {...otherProps} target="_blank" rel="noopener noreferrer">
      {inline ? (
        <span>
          {children}
          {icon}
        </span>
      ) : (
        <ExternalBlockContainer className={className}>
          {children}
          {icon}
        </ExternalBlockContainer>
      )}
    </Link>
  );
};
