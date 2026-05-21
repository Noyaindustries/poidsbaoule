import serverless from 'serverless-http';
import { app, initializeApp } from '../../server/index';

const expressHandler = serverless(app, {
  binary: ['image/jpeg', 'image/png', 'image/webp', 'multipart/form-data'],
});
const netlifyPrefix = '/.netlify/functions/api';

function normalizePath(pathValue: string | undefined): string {
  const path = pathValue || '/';
  if (path === netlifyPrefix) return '/api';
  if (path.startsWith(`${netlifyPrefix}/`)) {
    return `/api/${path.slice(netlifyPrefix.length + 1)}`;
  }
  return path;
}

type NetlifyEvent = {
  path?: string;
  rawUrl?: string;
  [key: string]: unknown;
};

type NetlifyContext = Record<string, unknown>;

type NetlifyResult = {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
};

export const handler = async (
  event: NetlifyEvent,
  context: NetlifyContext
): Promise<NetlifyResult> => {
  try {
    await initializeApp();
    const adaptedEvent = {
      ...event,
      path: normalizePath(event.path),
      rawUrl: event.rawUrl?.replace(netlifyPrefix, '/api'),
    };
    return (await expressHandler(adaptedEvent, context)) as NetlifyResult;
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "Erreur d'initialisation API. Vérifiez les variables Netlify (MONGODB_URI, MONGODB_DB_NAME).",
      }),
      headers: { 'content-type': 'application/json' },
    };
  }
};
