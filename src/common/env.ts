import { Env } from 'config';
import { cloneDeep } from 'lodash';

const global = process != null ? process : window;

/** equivalent to process.env in server and client */
// tslint:disable-next-line:no-any
export const env: Env = cloneDeep(global.env) as any;
