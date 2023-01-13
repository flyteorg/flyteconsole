/**
 * @file
 * This file is NOT compiled and is run directly by Node.js. Make sure you are not using JavaScript features that
 * does not exist in Node.js runtime.
 */
/* eslint-disable no-console */
import chalk from 'chalk';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import appRouter from './router';
import { applyMiddleware } from './plugins';
import env from '../../env';

const expressStaticGzip = require('express-static-gzip');

console.log(env);

const PORT = process.env.PORT || 3000;

const app = express();

// Enable logging for HTTP access
app.use(morgan('combined'));
app.use(express.json());

if (typeof applyMiddleware === 'function') {
  applyMiddleware(app);
}

const staticPath = path.resolve(__dirname);
app.use(
  // This path should be in sync with the `publicPath` from webpack config.
  env.ASSETS_PATH,
  expressStaticGzip(staticPath, {
    maxAge: '1d',
  }),
);

app.use(env.BASE_URL, appRouter);

const showEntryPointUrl = () => {
  console.log(chalk.magenta(`Express server ready!`));
  const url = `${env.ADMIN_API_USE_SSL}://${
    env.LOCAL_DEV_HOST || env.ADMIN_API_URL?.replace('https', '')
  }:${PORT}${env.BASE_URL}`;

  // Open a new browser tab if in development
  if (env.NODE_ENV === 'development') {
    // eslint-disable-next-line global-require
    const { exec } = require('child_process');

    console.log(
      chalk.magenta(`Opening a new browser window for:`),
      chalk.green(url),
    );
    exec(`open -a 'Google Chrome' ${url}`);
  } else {
    console.log(chalk.magenta(`Please open`), chalk.green(url));
  }
};

/* Set ADMIN_API_USE_SSL to https for CORS support */
let server: any;
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
    .listen(PORT, showEntryPointUrl);
  console.log(`Server started with SSL: https://localhost:${PORT}/`);
} else {
  server = app.listen(PORT, showEntryPointUrl);
}

const shutdown = signal => {
  console.info(`${signal} signal received. Shutting down.`);
  server.close(error => {
    if (error) {
      console.error('Failed to close server:', error);
      console.log('Server closed');
      process.exit(0);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
