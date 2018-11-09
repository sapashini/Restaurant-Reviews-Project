/*
* I wil like to acknoledge the inspiration and guide I got from MWS Restaurant Reviews Project.
* A Walkthrough by Alexandro Perez.Also,I adapted some of the walk through codes to make mine fully functionable.
*/

const appName = "restaurant-reviews-app"
// Create a chache variable for recycling of chaches.
const staticCacheName = appName + "-v2.0";

// Create cache for magery.
const contentImgsCache = appName + "-images";

// Array for the chache.
var allCaches = [
  staticCacheName,
  contentImgsCache
];

// Cache all your static assets,at Service Worker Install time.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        '/restaurant.html',
        '/css/styles.css',
        '/css/styles-medium.css',
        '/css/styles-large.css',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/manifest.json',
        'images/icons/icon-72x72.png',
        'images/icons/icon-96x96.png',
        'images/icons/icon-128x128.png',
        'images/icons/icon-144x144.png',
        'images/icons/icon-152x152.png',
        'images/icons/icon-192x192.png',
        'images/icons/icon-384x384.png',
        'images/icons/icon-512x512.png'
      ]);
    })
  );
});

// On activate, delete any old static cache if its name changes.
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith(appName) &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Add a fetch listener to the sw.js file to responds to cache, falling back to network.
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);

  // Only highjack request made to our app.
  if (requestUrl.origin === location.origin) {

    // RespondWith restaurant.html if pathname startsWith '/restaurant.html'
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return; // Done handling request, so exit early.
    }

    // If the request pathname starts with /img, then we need to handle images.
    if (requestUrl.pathname.startsWith('/img')) {
      event.respondWith(serveImage(event.request));
      return; // Done handling request, so exit early.
    }
  }

 // Default behavior: respond with cached elements, if any, falling back to network.
event.respondWith(
	caches.match(event.request).then(function(response) {
		return response || fetch(event.request);
    })
  );
});

function serveImage(request) {
  let imageStorageUrl = request.url;

  // Make a new URL with a stripped suffix and extension from the request url.
  imageStorageUrl = imageStorageUrl.replace(/-small\.\w{3}|-medium\.\w{3}|-large\.\w{3}/i, '');

  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(imageStorageUrl).then(function(response) {
      // if image is in cache, return it, else fetch from network, cache a clone, then return network response.
      return response || fetch(request).then(function(networkResponse) {
        cache.put(imageStorageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}