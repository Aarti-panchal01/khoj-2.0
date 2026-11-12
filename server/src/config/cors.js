const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');

const TRUSTED_PROD_ORIGINS = new Set(['https://khoj-2-0.vercel.app']);
const trustedProdDomainRegex = /^https:\/\/([a-z0-9-]+\.)?khojapp\.in$/i;

const isAllowedOrigin = (origin, allowedOrigins, isProd) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  return (
    allowedOrigins.includes(normalizedOrigin) ||
    (isProd &&
      (TRUSTED_PROD_ORIGINS.has(normalizedOrigin) ||
        trustedProdDomainRegex.test(normalizedOrigin)))
  );
};

const createCorsOptions = (clientOrigin, isProd) => {
  const allowedOrigins = String(clientOrigin || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  return {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin, allowedOrigins, isProd)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${normalizeOrigin(origin)} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  };
};

module.exports = { createCorsOptions, isAllowedOrigin };
