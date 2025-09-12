const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting ngrok tunnel...');

// Chạy ngrok
const ngrok = spawn('ngrok', ['http', '3000'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let ngrokUrl = '';

ngrok.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Tìm URL ngrok trong output
  const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/);
  if (urlMatch) {
    ngrokUrl = urlMatch[0];
    console.log(`\n✅ Ngrok URL: ${ngrokUrl}`);
    console.log(`📝 Update your Bitrix24 app with this URL: ${ngrokUrl}/install`);
    console.log(`📝 Update your .env file with: REDIRECT_URI=${ngrokUrl}/install`);
  }
});

ngrok.stderr.on('data', (data) => {
  console.error('Ngrok error:', data.toString());
});

ngrok.on('close', (code) => {
  console.log(`Ngrok process exited with code ${code}`);
});

// Xử lý tắt chương trình
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down ngrok...');
  ngrok.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down ngrok...');
  ngrok.kill();
  process.exit(0);
});
