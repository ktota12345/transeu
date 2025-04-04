const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy dla API TIMOCOM
  app.use(
    '/api/timocom-proxy',
    createProxyMiddleware({
      target: 'https://sandbox.timocom.com', // Rzeczywisty adres API TIMOCOM (sandbox)
      changeOrigin: true,
      pathRewrite: {
        '^/api/timocom-proxy': '', // Usuwa prefix /api/timocom-proxy z żądania
      },
      secure: true, // Dla HTTPS
      onProxyReq: (proxyReq, req, res) => {
        // Możesz tutaj dodać dodatkowe nagłówki, jeśli są potrzebne
        console.log('Proxy request to TIMOCOM API:', req.method, req.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Błąd proxy: Nie można połączyć się z API TIMOCOM');
      },
    })
  );
};
