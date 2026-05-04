import fs from 'fs';
import path from 'path';
import type { Plugin, ResolvedConfig } from 'vite';

function stripTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, '');
}

function normalizeApiBase(raw: string): string {
  return stripTrailingSlashes(raw.trim()).replace(/\/api$/i, '');
}

/**
 * Après le build, réécrit `dist/_redirects` :
 * - si `VITE_API_URL` est défini au build : proxy Netlify `/api/*` puis lignes de `public/_redirects` ;
 * - sinon : copie logique du fichier `public/_redirects` (ex. fallback SPA).
 */
export function netlifyApiProxyRedirects(apiBaseUrl: string | undefined): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'netlify-api-proxy-redirects',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved;
    },
    closeBundle() {
      const publicRedirects = path.resolve(config.root, 'public/_redirects');
      let spaBlock = '/* /index.html 200\n';
      if (fs.existsSync(publicRedirects)) {
        spaBlock = fs.readFileSync(publicRedirects, 'utf8');
        if (!spaBlock.endsWith('\n')) {
          spaBlock += '\n';
        }
      }

      const outRedirects = path.resolve(config.root, config.build.outDir, '_redirects');
      const trimmed = apiBaseUrl?.trim();
      /**
       * Netlify évalue `dist/_redirects` **avant** les `[[redirects]]` de `netlify.toml`.
       * `public/_redirects` doit donc lister `/api/*` **avant** `/* /index.html`, sinon la SPA mange les routes API.
       */
      const isNetlifyBuild = process.env.NETLIFY === 'true' || Boolean(process.env.DEPLOY_PRIME_URL);
      let body: string;
      if (trimmed && !isNetlifyBuild) {
        const base = normalizeApiBase(trimmed);
        const tailLines = spaBlock.split('\n').filter((line) => {
          const t = line.trim();
          if (!t || t.startsWith('#')) return false;
          return !/^\/api\/\*/.test(t);
        });
        const tail = tailLines.length ? `${tailLines.join('\n')}\n` : '/*      /index.html  200\n';
        body = `/api/*  ${base}/api/:splat  200\n${tail}`;
      } else {
        if (config.command === 'build' && config.mode === 'production' && !trimmed && !isNetlifyBuild) {
          config.logger.warn(
            '\n[netlify-api-proxy] VITE_API_URL est absent au build : en production, /api/* doit etre gere soit par netlify.toml (/.netlify/functions/api), soit via dist/_redirects vers une API externe.\n'
          );
        }
        if (trimmed && isNetlifyBuild) {
          config.logger.info(
            '\n[netlify-api-proxy] Build Netlify : VITE_API_URL ignoré pour _redirects ; routage /api via public/_redirects → fonction.\n'
          );
        }
        body = spaBlock;
      }

      fs.mkdirSync(path.dirname(outRedirects), { recursive: true });
      fs.writeFileSync(outRedirects, body, 'utf8');
    },
  };
}
