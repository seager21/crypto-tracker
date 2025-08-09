// Simple test for the news API
const http = require('http');

const testNewsAPI = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/news?limit=3',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('News API Response:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

console.log('Testing News API...');
testNewsAPI();
