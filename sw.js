const CACHE_NAME = 'send-it-in-v5';
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

// 3. THE MASTER DATA TRANSMISSION (Connected to the Corrected Webhook)
const scriptURL = 'https://script.google.com/macros/s/AKfycbNrUqoGaEKiotvyrhOhJYWTREI48eDkRyg5_-ouA_13lwNkNaHPWufjbTD2DdcAIXPhA/exec';

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SUBMIT_FORM') {
    // This sends the data from your phone to your Master Script
    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors', 
      body: JSON.stringify(event.data.payload)
    })
    .then(() => console.log('Data routed successfully!'))
    .catch(err => console.error('Data routing failed:', err));
  }
});
