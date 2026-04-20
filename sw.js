// Change this string every time you update your app! (e.g., v2.7, v2.8)
const CACHE_NAME = 'master-brain-cache-v2.6';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  // Force the waiting service worker to become the active service worker immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// --- NEW: THE CACHE JANITOR ---
self.addEventListener('activate', event => {
  // Tell the active service worker to take control of the page immediately
  event.waitUntil(self.clients.claim());

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If the cache name doesn't match our current version, nuke it
          if (cacheName !== CACHE_NAME) {
            console.log('Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// --- BACKGROUND QUEUE DISPATCHER ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reports') {
    event.waitUntil(emptyTheTank());
  }
});

async function emptyTheTank() {
  const dbRequest = indexedDB.open("SendItIn_Tank", 1);
  dbRequest.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction("outbox", "readwrite");
    const store = tx.objectStore("outbox");
    
    // Open a cursor to iterate through entries one by one so we can delete by key
    store.openCursor().onsuccess = async (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const url = cursor.value;
        const key = cursor.key;
        
        try {
          await fetch(url, { method: 'GET', mode: 'no-cors' });
          
          // If fetch works, remove from Tank using the specific auto-generated key
          const deleteTx = db.transaction("outbox", "readwrite");
          deleteTx.objectStore("outbox").delete(key);
        } catch (err) {
          // Still no signal? Leave it in the tank for next time.
        }
        
        // Move to the next record in the tank
        cursor.continue();
      }
    };
  };
}
