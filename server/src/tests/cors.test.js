const { isAllowedOrigin } = require('../config/cors');

describe('CORS origin policy', () => {
  test('allows the production Vercel app origin', () => {
    expect(isAllowedOrigin('https://khoj-2-0.vercel.app', [], true)).toBe(true);
  });

  test('does not trust arbitrary Vercel deployment origins', () => {
    expect(isAllowedOrigin('https://preview-123.vercel.app', [], true)).toBe(false);
  });

  test('continues to allow configured origins and existing production domain', () => {
    expect(isAllowedOrigin('https://localhost.example/', ['https://localhost.example'], true)).toBe(true);
    expect(isAllowedOrigin('https://www.khojapp.in', [], true)).toBe(true);
  });

  test('allows requests without an Origin header', () => {
    expect(isAllowedOrigin(undefined, [], true)).toBe(true);
  });
});
