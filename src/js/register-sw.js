/*
* I like to acknoledge the inspiration and guide from MWS Restaurant Reviews Project
A Walkthrough by Alexandro Perez.
*/

// Register service worker and check if it'ssupported.
if (navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js').then(function(reg) {
    console.log("Service Worker has been registered successfully!");
  }).catch((event) => {
    console.log("Couldn't register service worker... \n", e);
  });
}