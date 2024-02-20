import React from 'react';
import { Helmet } from 'react-helmet';

interface PageMetaProps {
  title?: string;
}

export const PageMeta = ({ title }: PageMetaProps) => {
  return (
    <Helmet title={title} titleTemplate="%s | Flyte Dashboard" defaultTitle="Flyte Dashboard" />
  );
};

export default PageMeta;
