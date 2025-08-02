#!/usr/bin/env node

/**
 * Generate secure JWT secrets for your application
 * Run with: node scripts/generate-jwt-secrets.js
 */

const crypto = require('crypto');

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64url');
}

console.log('🔐 JWT Secrets Generator');
console.log('========================\n');

console.log('Add these to your .env.local file:\n');

console.log(`JWT_SECRET="${generateSecureSecret()}"`);
console.log(`JWT_REFRESH_SECRET="${generateSecureSecret()}"`);

console.log('\n💡 Tips:');
console.log('- Keep these secrets secure and never commit them to version control');
console.log('- Use different secrets for different environments (dev, staging, production)');
console.log('- Store production secrets in your deployment platform\'s environment variables');
console.log('- Rotate secrets periodically for enhanced security');
