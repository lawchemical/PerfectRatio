// Generate a secure API key for Railway backend
const crypto = require('crypto');

// Generate a 32-byte random key
const apiKey = 'pr_live_' + crypto.randomBytes(32).toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

console.log('\n🔐 Generated Secure API Key:\n');
console.log(apiKey);
console.log('\n📋 Copy this key to:');
console.log('1. Railway environment variables (API_KEY)');
console.log('2. iOS app RailwayBackendService.swift (apiKey)');
console.log('\n⚠️  Keep this key secret and never commit it to Git!\n');