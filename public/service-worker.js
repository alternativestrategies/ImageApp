const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/css/style.css",
    "/assets/js/loadImages.js",
    "/assets/images/1.jpg",
    "/assets/images/2.jpg",
    "/assets/images/3.jpg",
    "/assets/images/4.jpg",
    "/assets/images/5.jpg",
    "/assets/images/10.jpg",
    "/assets/images/11.jpg",
    "/assets/images/12.jpg",
    "/assets/images/13.jpg",
    "/assets/images/14.jpg",
    "/assets/images/15.jpg"
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// install and register service worker
self.addEventListener("install", function(evt){
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were precached successfully')
            return cache.addAll(FILES_TO_CACHE);
        })
    )

    self.skipWaiting();
})

// activate service worker
self.addEventListener("activate", function(evt){
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log("Removing old cache data", key);
                        return caches.delete(key)
                    }
                })
            )
        })
    )
})

// fetch files
self.addEventListener("fetch", function(evt){
    if(evt.request.url.includes("/api/")){
        console.log("[Service Worker] Fetch (data)", evt.request.url);

        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if(response.status === 200){
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                })
            })
        );
        return;
    }
    
    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evt.request);
            })
        })
    )

})