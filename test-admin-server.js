// Minimal test server for Railway debugging
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// Simple health check
app.get('/health', (req, res) => {
    console.log('Health check hit');
    res.send('OK');
});

// Root endpoint
app.get('/', (req, res) => {
    console.log('Root hit');
    res.send('Test Server Running');
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running on 0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});