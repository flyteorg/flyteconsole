/**
 * @file
 * This file is NOT compiled and is run directly by Node.js. Make sure you are not using JavaScript features that
 * does not exist in Node.js runtime.
 */
/* eslint-disable no-console */
const morgan = require('morgan');
const express = require('express');
const path = require('path');
const expressStaticGzip = require('express-static-gzip');
const serverRenderer = require('./dist/server.js').default;
const clientStats = require('./dist/client-stats.json');

const env = require('./env');
const { applyMiddleware } = require('./plugins');

const app = express();

// Enable logging for HTTP access
app.use(morgan('combined'));
app.use(express.json());
app.get(`${env.BASE_URL}/healthz`, (_req, res) => res.status(200).send());

if (typeof applyMiddleware === 'function') {
  console.log('Found middleware plugins, applying...');
  applyMiddleware(app);
}

const distPath = path.join(__dirname, 'dist');
app.use(
  // This path should be in sync with the `publicPath` from webpack config.
  env.ASSETS_PATH,
  expressStaticGzip(distPath, {
    maxAge: '1d',
  }),
);
app.use(serverRenderer({ clientStats, currentDirectory: __dirname }));

/* Set ADMIN_API_USE_SSL to https for CORS support */
let server;
const port = process.env.PORT || 3000;
if (env.ADMIN_API_USE_SSL === 'https') {
  const fs = require('fs');
  const https = require('https');
  var privateKey = fs.readFileSync(`${env.CERTIFICATE_PATH}/server.key`);
  var certificate = fs.readFileSync(`${env.CERTIFICATE_PATH}/server.crt`);

  server = https
    .createServer(
      {
        key: privateKey,
        cert: certificate,
      },
      app,
    )
    .listen(port);
  console.log(`Server started with SSL: https://localhost:${port}/`);
} else {
  server = app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Server started: http://localhost:${port}/`);
  });
}

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received. Shutting down.');
  server.close((error) => {
    if (error) {
      console.error('Failed to close server:', error);
      process.exit(1);
    }
    console.log('Server closed');
    process.exit(0);
  });
});
