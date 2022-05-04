import { storiesOf } from '@storybook/react';
import { ProtobufListValue, ProtobufStruct } from 'models/Common/types';
import * as React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { CardDecorator } from './CardDecorator';
import { protobufValues } from './protobufValues';
import { LiteralMapViewer } from '../LiteralMapViewer';

import { DeprecatedLiteralMapViewer } from '../DeprecatedLiteralMapViewer';

const stories = storiesOf('Literals/ProtobufStruct', module);
stories.addDecorator(CardDecorator);

function renderStruct(label: string, struct: ProtobufStruct) {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '16px' }}>
          OLD
          <Card>
            <CardContent>
              <DeprecatedLiteralMapViewer
                map={{
                  literals: {
                    [label]: { scalar: { value: 'generic', generic: struct }, value: 'scalar' },
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          NEW
          <Card>
            <CardContent>
              <LiteralMapViewer
                map={{
                  literals: {
                    [label]: { scalar: { value: 'generic', generic: struct }, value: 'scalar' },
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

stories.add('basic', () => renderStruct('basic_struct', { fields: protobufValues }));

stories.add('list', () =>
  renderStruct('struct_with_list', {
    fields: {
      list_value: {
        kind: 'listValue',
        listValue: {
          values: [
            // ...Object.values(protobufValues),
            {
              kind: 'structValue',
              structValue: { fields: protobufValues },
            },
          ],
        } as ProtobufListValue,
      },
    },
  }),
);

stories.add('nested', () =>
  renderStruct('struct_with_nested', {
    fields: {
      struct_value: {
        kind: 'structValue',
        structValue: { fields: protobufValues },
      },
    },
  }),
);
