'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "61ebf14a13d0499cbf80ef7d9be8d98f",
"index.html": "4a0476adfc0cc26e6b03bbcaef598e49",
"/": "4a0476adfc0cc26e6b03bbcaef598e49",
"main.dart.js": "692e14812ce27a08d0cc4b7f4601899a",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "d2f7b0ce4c6dfd423310ffd94af1d2b6",
"assets/AssetManifest.json": "d66ebf8bfe2ca300baccbf978dcd00eb",
"assets/NOTICES": "46c0d1a7cd12c85c1f0797037d52511e",
"assets/FontManifest.json": "fb8a98f90e0714a5d2d323fc80421c96",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/fonts/DancingScript-VariableFont_wght.ttf": "a49cf406017aaf0eef1d4800794b4b15",
"assets/assets/rk_piano.png": "8f24b7f3034fea01dab119e13e9bb59d",
"assets/assets/rk_guitar_icon.png": "b0745840525106f83eeae23d97ccdd3f",
"assets/assets/IMG_20190322_171219.jpg": "78b66b4906e63fb31a6222acf51cdb90",
"assets/assets/rk_violin_icon.png": "3f68726a0b07acd8b0b770e5b9d6aa13",
"assets/assets/rk_drums_icon.png": "7ff2fdf759bb8698dff74ff50a7f7f2a",
"assets/assets/rk_dance_icon.png": "b3c18659dbf712a8805af66209bf33b7",
"assets/assets/profile-photo.png": "0caf39b6f948636c87dcff5b2aa22b6d",
"assets/assets/rk_keyboard_icon.png": "bf5c55bbb31d5e6368dc7153995a0033",
"assets/assets/rk_slider/rk_slider_01.jpg": "2a79abb0d4629b693532181668339b9c",
"assets/assets/rk_slider/rk_slider_02.jpg": "7d013386c8654e4eb728cf3411c0d9be",
"assets/assets/logo-2.png": "e651694a0bb7442420033a8bfb1a3303",
"assets/assets/rk_veena_icon.png": "8034ded2c1f67f9b081f880aafdbb76e",
"assets/assets/logo-1.png": "7e33f41093cda67715541edbcfe32da3",
"assets/assets/icons8-whatsapp.gif": "6a65ea06eb1a1c9a7738ca615a6cd1f3",
"assets/assets/rk_vocal_icon.png": "5b284d1a5f23ce4e6ed91ab6ae927af1",
"assets/assets/IMG_20180318_182820.jpg": "097d65bd6b4294cd8ee1c0dbe9a8b459",
"assets/assets/logo-1-no-bg.png": "1492ede5350b94f2a3cd4f0c2dbc7922",
"assets/assets/IMG_20190709_122318.jpg": "91ac815761ff0859098833ce3ff76528"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
