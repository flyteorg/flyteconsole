import React from 'react';
import styled from '@mui/system/styled';
import { renderToStaticMarkup } from 'react-dom/server';
import SmallArrow from '@clients/ui-atoms/SmallArrow';

import ReactFlow from 'react-flow-renderer';

const smallArrowSvgString = encodeURIComponent(renderToStaticMarkup(<SmallArrow />));

// for react flow classname guide: https://reactflow.dev/docs/guides/theming/
export const ReactFlowStyled = styled(ReactFlow)(({ theme }) => ({
  display: 'flex',
  flex: `1 1 100%`,
  flexDirection: 'column',

  '& .react-flow__node': {
    minWidth: '52px',
    minHeight: '26px',

    '& .border': {
      border: `1px dashed`,
      borderRadius: '8px',
      width: '100%',
      height: '100%',
      padding: '.25rem',
    },

    '& .taskPhase': {
      borderRadius: '2px',
      color: 'white',
      margin: '0 1px',
      padding: '0 2px',
      fontSize: '8px',
      lineHeight: '14px',
      minWidth: '14px',
      textAlign: 'center',
      cursor: 'pointer',
    },

    '& .breadcrumb': {
      position: 'absolute',
      display: 'flex',
      width: '100%',
      marginTop: '-20px',

      header: {
        position: 'initial',
        color: theme.palette.common.graph.breadActiveColor,
        fontSize: '9px',
        margin: 0,
        padding: 0,
      },

      ol: {
        fontSize: '9px',
        margin: 0,
        padding: 0,
        display: 'flex',
        listStyle: 'none',
        listStyleImage: 'none',
        minWidth: '1rem',

        li: {
          cursor: 'pointer',

          '&:before': {
            content: '">"',
            color: theme.palette.common.graph.breadActiveColor,
            padding: '0 .2rem',
          },
          '&.inactive': {
            color: theme.palette.common.graph.breadInactiveColor,
            cursor: 'initial',
          },
        },
      },
    },

    '& .label': {
      position: 'absolute',
      bottom: '100%',
      zIndex: 0,
      right: '.15rem',
      minWidth: '36px',
    },

    '& .taskType,.mapTaskName': {
      backgroundColor: theme.palette.common.graph.background,
      color: 'white',
      padding: '2px 3px',
      fontSize: '0.3rem',
      lineHeight: '1.2em',
      maxWidth: '80px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },

    '& .mapTaskBreadcrumb': {
      position: 'absolute',
      top: '-11px',
      zIndex: 0,
      right: '.15rem',
    },

    '& .mapTaskName': {
      borderRadius: '.15rem',
    },

    '& .cacheStatus': {
      width: '8px',
      height: '8px',
      marginLeft: '4px',
      marginTop: '1px',
      color: theme.palette.common.graph.background,
      display: 'inline',
    },

    '& .node': {
      boxShadow: '1px 3px 5px rgba(0,0,0,.2)',
      padding: theme.spacing(0.8, 1.33),
      fontSize: '.6rem',
      border: `.15rem solid`,
      borderRadius: '.25rem',
      background: '#fff',
      width: '100%',
      height: 'auto',
      zIndex: 100000,
      position: 'relative',
      textAlign: 'center',
      display: 'inline-flex',
      alignItems: 'center',
      lineHeight: 'normal',

      '&.mapTask': {
        minHeight: '27px',
        minWidth: '52px',
      },

      '& .mapTaskWrapper': {
        display: 'flex',
      },
      '& .icon': {
        width: '10px',
        height: '10px',
        marginLeft: '4px',
        marginTop: '1px',
        color: theme.palette.common.graph.background,
        cursor: 'pointer',
      },

      '&.startNode,&.endNode': {
        border: '1px solid #ddd',
      },
      '&.nestedStartNode,&.nestedEndNode': {
        width: '1px',
        height: '1px',
        minWidth: '1px',
        minHeight: '1px',
        padding: 0,
        boxShadow: 'none',
        border: 'none',
        background: 'none',
        borderRadius: 'none',
        color: '#fff',
      },
      '&.nestedMaxDepthNode': { background: '#aaa', color: 'white' },
      '&.branchNode': {
        display: 'flex',
        flexAlign: 'center',
        border: 'none',
        borderRadius: '0px',
        padding: '1rem 0',
        boxShadow: 'none',
        fontSize: '.6rem',
      },
      '&.staticNode': {
        backgroundColor: '#fff',
        borderColor: '#bfbfbf',
        borderWidth: '.05rem',
      },
      '&.staticNestedNode': {
        backgroundColor: '#dfdfdf',
        border: 'none',
      },
    },
  },

  '& .react-flow__handle': {
    width: 8,
    height: 8,
    border: 'none',
    zIndex: 99999999,
    backgroundColor: 'rgba(255,255,255,1)',
    background: `url("data:image/svg+xml,${smallArrowSvgString}") center center no-repeat`,

    '&.nestedMaxDepth': {
      background: 'none',
      backgroundImage: 'none',
    },
  },

  '& .react-flow__handle-left': {
    marginLeft: -1,
    marginRight: 0,
  },

  '& .react-flow__handle-right': {
    marginLeft: 0,
    marginRight: -1,
  },
}));
