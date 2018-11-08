(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

/*
* I like to acknoledge the inspiration and guide from MWS Restaurant Reviews Project
A Walkthrough by Alexandro Perez.
*/
var appName = "restaurant-reviews-app"; // Create a chache variable for recycling of chaches.

var staticCacheName = appName + "-v1.0"; // Create cache for magery.

var contentImgsCache = appName + "-images"; // Array for the chache.

var allCaches = [staticCacheName, contentImgsCache]; // Cache all your static assets,at Service Worker Install time.

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(staticCacheName).then(function (cache) {
    return cache.addAll(['/', '/restaurant.html', '/css/styles.css', '/css/styles-medium.css', '/css/styles-large.css', //'/js/dbhelper.js',
    //'/js/secret.js',
    '/js/main.js', '/js/restaurant_info.js', //'/js/register-sw.js',
    '/data/restaurants.json']);
  }));
}); // On activate, delete any old static cache if its name changes.

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.filter(function (cacheName) {
      return cacheName.startsWith(appName) && !allCaches.includes(cacheName);
    }).map(function (cacheName) {
      return caches.delete(cacheName);
    }));
  }));
}); // Add a fetch listener to the sw.js file to responds to cache, falling back to network.

self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url); // only highjack request made to our app (not mapbox maps or leaflet, for example)

  if (requestUrl.origin === location.origin) {
    // Since requests made to restaurant.html have search params (like ?id=1), the url can't be used as the
    // key to access the cache, so just respondWith restaurant.html if pathname startsWith '/restaurant.html'
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return; // Done handling request, so exit early.
    } // If the request pathname starts with /img, then we need to handle images.


    if (requestUrl.pathname.startsWith('/img')) {
      event.respondWith(serveImage(event.request));
      return; // Done handling request, so exit early.
    }
  } // Default behavior: respond with cached elements, if any, falling back to network.


  event.respondWith(caches.match(event.request).then(function (response) {
    return response || fetch(event.request);
  }));
});

function serveImage(request) {
  var imageStorageUrl = request.url; // Make a new URL with a stripped suffix and extension from the request url
  // i.e. /img/1-medium.jpg  will become  /img/1
  // we'll use this as the KEY for storing image into cache

  imageStorageUrl = imageStorageUrl.replace(/-small\.\w{3}|-medium\.\w{3}|-large\.\w{3}/i, '');
  return caches.open(contentImgsCache).then(function (cache) {
    return cache.match(imageStorageUrl).then(function (response) {
      // if image is in cache, return it, else fetch from network, cache a clone, then return network response
      return response || fetch(request).then(function (networkResponse) {
        cache.put(imageStorageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

},{}]},{},[1])

//# sourceMappingURL=sw.js.map
