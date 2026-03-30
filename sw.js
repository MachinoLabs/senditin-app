const CACHE_NAME = 'send-it-in-v2'; // Updated version for the new brain
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// 1. INSTALLATION: Save the app for offline use
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 2. FETCH: Make the app load fast from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// 3. THE BRAIN: This handles sending the form data to Google Sheets
const scriptURL = 'https://script.google.com/macros/s/AKfycbyk1qD07ZF5MtXTBa1rHLMJZYMUxJyymA3KiFBHTBZHBqLQ1_MmeS3LP5jdpS9Vqg6WyA/exec';

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SUBMIT_FORM') {
    fetch(scriptURL, {
      method: 'POST',
      mode: 'no-cors', 
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event.data.payload)
    })
    .then(() => {
      console.log('Data sent successfully to Google Sheets');
    })
    .catch(error => {
      console.error('Submission failed:', error);
    });
  }
});
