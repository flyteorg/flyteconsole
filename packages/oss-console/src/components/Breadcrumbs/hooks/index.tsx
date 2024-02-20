import { useEffect, useState } from 'react';

/**
 * Turns the breadcrumb into the title bar variant.
 * @param customStyles
 */
export const useBreadCrumbsGreyStyle = () => {
  const breadcrumbBackground = `.breadcrumbs {
    transition: background-color 0.2s ease-in-out;
    background-color: #F2F3F3;
    border-bottom: 1px solid lightgrey;
  }`;

  const [id] = useState<string>(`data-breadcrumb-temp-${Date.now().toString()}`);

  useEffect(() => {
    // make a new style tag in the head with js
    const style = document.createElement('style');
    style.innerHTML = breadcrumbBackground;
    style.setAttribute('type', 'text/css');
    style.setAttribute(id, 'true');
    document.head.appendChild(style);

    return () => {
      // remove global css sheet with matching comment text
      [...document.querySelectorAll('style')]
        .filter((s) => s.outerHTML.includes(id))
        .forEach((s) => {
          s.remove();
        });
    };
  }, [window.location.pathname, id]);
};
