import * as React from 'react';
import { Core } from '@flyteorg/flyteidl-types';
import { Button } from '@material-ui/core';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

/** Fetches and renders the deck data for a given `nodeExecutionId` */
export const ExecutionNodeURL: React.FC<{
  nodeExecutionId: Core.NodeExecutionIdentifier;
  suffix: string;
}> = ({ nodeExecutionId, suffix }) => {
  const project = nodeExecutionId.executionId?.project;
  const domain = nodeExecutionId.executionId?.domain;
  const executionName = nodeExecutionId.executionId?.name;
  const nodeId = nodeExecutionId.nodeId;
  const url = `flyte://v1/${project}/${domain}/${executionName}/${nodeId}/${suffix}`;
  const code = `from flytekit.remote.remote import FlyteRemote
from flytekit.configuration import Config
remote = FlyteRemote(
    Config.for_endpoint(endpoint="localhost:30080"),
    default_project="${project}",
    default_domain="${domain}"
)
remote.get("${url}")`;
  const handleClick = event => {
    if (event.shiftKey) {
      navigator.clipboard.writeText(code);
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const logoStyle = {
    width: '20px',
    height: '20px',
  };

  const codeStyle = {
    fontSize: '10px', // Adjust the font size as desired
  };

  return (
    <>
      <Button>
        <img
          src="https://docs.flyte.org/en/latest/_static/flyte_circle_gradient_1_4x4.png"
          alt="Logo"
          style={logoStyle}
          onClick={handleClick}
        />
      </Button>
      <div>
        <SyntaxHighlighter
          language="python"
          style={darcula}
          customStyle={codeStyle}
          onClick={() => navigator.clipboard.writeText(code)}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </>
  );
};
