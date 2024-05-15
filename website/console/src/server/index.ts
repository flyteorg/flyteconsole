/* eslint-disable import/no-import-module-exports */
/* eslint-disable no-console */
/* eslint-disable global-require */
import chalk from 'chalk';
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import { collectDefaultMetrics } from 'prom-client';
import https from 'https';
import http from 'http';
import mainRouter from './routes/mainRouter';

const expressStaticGzip = require('express-static-gzip');
const fs = require('fs');
// const https = require('https');
const env = require('../../env');

collectDefaultMetrics();

const app = express();
// Disable the X-Powered-By header in responses to avoid
// advertising the app server software
app.disable('x-powered-by');

const staticPath = path.resolve(__dirname);
app.use(morgan('combined'));

// middleware

// using the mounting feature of Connect, for example
// "GET /public/client.js" instead of "GET /client.js".
// The mount-path "/public" is simply removed before
// passing control to the express.static() middleware,
// thus it serves the file correctly by ignoring "/public"
// This is a workaround to only serve files under build/public,
// so that generated files like build/server.js do not get served to the client.
app.use(express.json());

// Allow to use compressed files instead of plain text js, with Brotli compression as priority loading,
// if not supported, will fallback to gzip
app.use(
  env.ASSETS_PATH,
  expressStaticGzip(staticPath, {
    enableBrotli: true,
    orderPreference: ['br'],
    serveStatic: {
      cacheControl: true,
      maxAge: '8h',
    },
  }),
);

app.use(mainRouter);

const showEntryPointUrl = () => {
  console.log(chalk.magenta(`Express server ready!`));
  const url = `https://${env.LOCAL_DEV_HOST}:${env.PORT}${env.BASE_URL}`;

  // Open a new browser tab if in development
  if (env.NODE_ENV === 'development') {
    // eslint-disable-next-line global-require
    const { exec } = require('child_process');

    console.log(chalk.magenta(`Opening a new browser window for:`), chalk.green(url));
    exec(`open -a 'Google Chrome' ${url}`);
  } else {
    console.log(chalk.magenta(`Please open`), chalk.green(url));
  }
};

let server: https.Server | http.Server;

if (env.ADMIN_API_USE_SSL === 'https') {
  const privateKey = fs.readFileSync(`${env.CERTIFICATE_PATH}/server.key`);
  const certificate = fs.readFileSync(`${env.CERTIFICATE_PATH}/server.crt`);

  server = https
    .createServer(
      {
        key: privateKey,
        cert: certificate,
      },
      app,
    )
    .listen(env.PORT, showEntryPointUrl);
} else {
  server = app.listen(env.PORT, showEntryPointUrl);
}

const shutdown: NodeJS.SignalsListener = (signal) => {
  console.info(`${signal} signal received. Shutting down.`);
  server.close((error) => {
    if (error) {
      console.error('Failed to close server:', error);
      console.log('Server closed');
      process.exit(0);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
