const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/suppliers',
  method: 'GET',
  headers: {
    'x-api-key': 'test-api-key-123',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Response structure:');
    console.log('- Type:', Array.isArray(json) ? 'array' : 'object');
    console.log('- Has data field:', json.data !== undefined);
    console.log('- Data field type:', json.data ? (Array.isArray(json.data) ? 'array' : typeof json.data) : 'undefined');
    console.log('- Full response:', JSON.stringify(json, null, 2));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
