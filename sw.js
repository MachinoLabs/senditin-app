const CACHE_NAME = 'send-it-in-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// 1. Installation & Caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 2. Fetching from Cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// 3. THE DATA TRANSMISSION (The Brain)
const scriptURL = 'https://script.google.com/macros/s/AKfycbyk1qD07ZF5MtXTBa1rHLMJZYMUxJyymA3KiFBHTBZHBqLQ1_MmeS3LP5jdpS9Vqg6WyA/exec';

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SUBMIT_FORM') {
    // This sends the data from your phone to Google Sheets
    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors', 
      body: JSON.stringify(event.data.payload)
    })
    .then(() => console.log('Data routed successfully!'))
    .catch(err => console.error('Data routing failed:', err));
  }
});
