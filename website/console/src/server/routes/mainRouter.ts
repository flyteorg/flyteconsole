import fs from 'fs';
import path from 'path';
import express, { Request, Response } from 'express';
import { register } from 'prom-client';
import * as cheerio from 'cheerio';

import { processEnv } from '../../../env';

const router = express.Router();

const html = fs.readFileSync(path.resolve(__dirname, 'index.html')).toString();

router.get('/*', (_req, res) => {
  if (html === '') {
    throw new ReferenceError('Could not find index.html to render');
  }

  // populate the app content...
  const $ = cheerio.load(html);

  // Populate process.env into window.env
  $('head').append(
    $(`<script>window.env = ${JSON.stringify({ ...processEnv, __FromServer: 'true' })}</script>`),
  );
  res.status(200).send($.html());
});

router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

export default router;
