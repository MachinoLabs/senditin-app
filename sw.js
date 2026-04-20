const CACHE_NAME = 'send-it-in-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
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
