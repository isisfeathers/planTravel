const http = require('http');

const data = JSON.stringify({
  id_token: "mock-line-id-token-for-test",
  line_user_id: "U1234567890abcdef1234567890abcdef",
  display_name: "林小華",
  picture_url: "https://profile.line-scdn.net/sample"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/line',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Auth Line Status:', res.statusCode);
    const parsed = JSON.parse(body);
    console.log('User created/logged in:', parsed.user);
    console.log('Got Access Token:', !!parsed.access_token);
  });
});

req.on('error', error => {
  console.error('Request failed:', error);
});

req.write(data);
req.end();
