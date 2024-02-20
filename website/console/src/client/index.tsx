import React from 'react';
import { createRoot, Root } from 'react-dom/client';
// Needed in order for protobufjs to properly convert int64s
import Long from 'long';
import $protobuf from 'protobufjs/minimal';
// Initialize Google Tag Manager to control tags from google console (e.g. add analytics tags.. etc.)

import App from './app';

$protobuf.util.Long = Long;
$protobuf.configure();

const container = document.getElementById('root');
const root: Root = createRoot(container!);

const renderComponent = (Component: React.FC) => {
  root.render(<Component />);
};

const renderApp = () => {
  renderComponent(App);
};

renderApp();
