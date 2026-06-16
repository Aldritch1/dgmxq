import { createRequestHandler } from '../src/app.js';

let handler;

export async function onRequest(context) {
  handler ??= createRequestHandler({ env: context.env ?? {} });
  return handler(context.request);
}
