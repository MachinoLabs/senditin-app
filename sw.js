const CACHE_NAME = 'send-it-in-v4';
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

// 3. THE MASTER DATA TRANSMISSION (Connected to your Master Control Sheet)
const scriptURL = 'https://script.google.com/macros/s/AKfycbzxcN_zRrkYF8HnAEOIV9PYa9XBzP8jSGvoNU54iuWnAHGXJqOk8Kkqf_1pA1CAHreP2A/exec';

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
