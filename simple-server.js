// Ultra-simple server for Railway debugging
const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Simple Server Running');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server listening on 0.0.0.0:${PORT}`);
  
  // Test local health check
  setTimeout(() => {
    http.get(`http://localhost:${PORT}/health`, (res) => {
      console.log(`Local health check: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Local health check error:', err);
    });
  }, 1000);
});