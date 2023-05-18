import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { processEnv } from '../../env';

const router: Router = express.Router();

router.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send();
});

router.get('/*', (_req: Request, res: Response) => {
  const html = fs
    .readFileSync(path.resolve(__dirname, 'index.html'))
    .toString();

  if (html === '') {
    throw new ReferenceError('Could not find index.html to render');
  }

  // populate the app content...
  const $ = cheerio.load(html);
  // Populate process.env into window.env
  $('head').append(
    $(`<script>window.env = ${JSON.stringify(processEnv)}</script>`),
  );

  res.status(200).send($.html());
});

export default router;
