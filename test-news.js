// Simple test for the news API
const http = require('http');

const testNewsAPI = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/news?limit=6&source=fallback',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('News API Response:');
      try {
        const parsed = JSON.parse(data);
        console.log(`Found ${parsed.data.length} articles:`);
        parsed.data.forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
          console.log(`   Source: ${article.source}`);
          console.log(`   Tags: ${article.tags.join(', ')}`);
          console.log('');
        });
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

console.log('Testing News API with fallback data...');
testNewsAPI();
