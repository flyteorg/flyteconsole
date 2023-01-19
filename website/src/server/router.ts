import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';

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

  res.status(200).send(html);
});

export default router;
