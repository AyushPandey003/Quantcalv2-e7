#!/usr/bin/env node

/**
 * Test script for reCAPTCHA v3 configuration
 * Run with: node scripts/test-recaptcha-v3.js
 */

const https = require('https');

// Configuration
const config = {
  siteKey: process.env.RECAPTCHA_SITE_KEY,
  secretKey: process.env.RECAPTCHA_SECRET_KEY,
  version: process.env.RECAPTCHA_VERSION || 'v3',
  minScore: process.env.RECAPTCHA_MIN_SCORE || '0.5',
};

console.log('🔍 Testing reCAPTCHA v3 Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`   Site Key: ${config.siteKey ? '✅ Set' : '❌ Missing'}`);
console.log(`   Secret Key: ${config.secretKey ? '✅ Set' : '❌ Missing'}`);
console.log(`   Version: ${config.version}`);
console.log(`   Min Score: ${config.minScore}\n`);

if (!config.siteKey || !config.secretKey) {
  console.log('❌ Missing required environment variables!');
  console.log('   Please set RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY');
  process.exit(1);
}

// Test reCAPTCHA verification endpoint
function testRecaptchaVerification() {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      secret: config.secretKey,
      response: 'test_token', // This will fail, but we're testing the endpoint
    }).toString();

    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Testing reCAPTCHA API connectivity...');
  
  try {
    const result = await testRecaptchaVerification();
    console.log('✅ reCAPTCHA API is accessible');
    console.log(`   Response: ${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    console.log('❌ Failed to connect to reCAPTCHA API');
    console.log(`   Error: ${error.message}\n`);
  }

  console.log('📝 Configuration Summary:');
  console.log(`   ✅ Using reCAPTCHA ${config.version}`);
  console.log(`   ✅ Score threshold: ${config.minScore}`);
  console.log(`   ✅ Site key configured`);
  console.log(`   ✅ Secret key configured\n`);

  console.log('🚀 Next Steps:');
  console.log('   1. Add your domain to reCAPTCHA v3 settings');
  console.log('   2. Test the login/register forms');
  console.log('   3. Check browser console for any errors');
  console.log('   4. Monitor security logs for verification events\n');

  console.log('💡 Tips for reCAPTCHA v3:');
  console.log('   - Score 0.9+ = Very likely human');
  console.log('   - Score 0.5+ = Likely human (recommended threshold)');
  console.log('   - Score 0.3+ = Possibly human');
  console.log('   - Score 0.1+ = Possibly bot');
  console.log('   - Score 0.0+ = Very likely bot');
}

runTests().catch(console.error);
