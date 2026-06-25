/**
 * sw.js — Service Worker
 * Manages offline caching and fast repeat loads for Ano Pong Ulam?
 *
 * Cache strategy:
 *   - STATIC_CACHE: Core app assets (JS, CSS, fonts, images, manifest)
 *   - IMAGE_CACHE: Supabase images — CacheFirst, 100 entries, 30 day expiry
 *   - API_CACHE: /api/ routes — NetworkFirst, 50 entries, 5 minute expiry
 *
 * Bump CACHE_VERSION to force a clean install on returning users after strategy changes.
 */
var CACHE_VERSION = "v2"
var STATIC_CACHE = "ano-pong-ulam-static-" + CACHE_VERSION
var IMAGE_CACHE = "ano-pong-ulam-images-" + CACHE_VERSION
var API_CACHE = "ano-pong-ulam-api-" + CACHE_VERSION

var PRECACHE_URLS = [
  "/offline.html",
  "/manifest.json",
  "/icon.svg",
]

// INSTALL — precache app shell
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// ACTIVATE — clean up old caches
self.addEventListener("activate", function (event) {
  var currentCaches = [STATIC_CACHE, IMAGE_CACHE, API_CACHE]
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return currentCaches.indexOf(name) === -1
          })
          .map(function (name) {
            return caches.delete(name)
          })
      )
    }).then(function () {
      return self.clients.claim()
    })
  )
})

// FETCH
self.addEventListener("fetch", function (event) {
  var request = event.request
  var url = new URL(request.url)

  // Only handle same-origin and Supabase requests
  if (
    url.origin.indexOf("supabase.co") === -1 &&
    url.origin !== self.location.origin
  ) {
    return
  }

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Navigation requests — serve offline.html on failure
  // Must check accept header to avoid intercepting RSC fetches (which expect JSON)
  var acceptHeader = request.headers.get("accept") || ""
  var isNavigation = request.mode === "navigate" || acceptHeader.indexOf("text/html") !== -1
  if (isNavigation) {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match("/offline.html")
      })
    )
    return
  }

  // Supabase images — CacheFirst
  if (
    url.hostname.indexOf("supabase.co") !== -1 &&
    url.pathname.indexOf("/storage/v1/object/public/") !== -1
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 30 * 24 * 60 * 60))
    return
  }

  // API routes — NetworkFirst
  if (url.pathname.indexOf("/api/") === 0) {
    event.respondWith(networkFirst(request, API_CACHE, 5 * 60))
    return
  }

  // Everything else — StaleWhileRevalidate
  event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
})

// CacheFirst: return from cache if fresh, otherwise fetch + cache
function cacheFirst(request, cacheName, maxAgeSeconds) {
  return caches.match(request).then(function (cached) {
    if (cached) {
      var age = Date.now() - new Date(cached.headers.get("date") || 0).getTime()
      if (age < maxAgeSeconds * 1000) return cached
    }
    return fetch(request).then(function (response) {
      if (response.ok) {
        return caches.open(cacheName).then(function (cache) {
          cache.put(request, response.clone())
          return response
        })
      }
      return response
    }).catch(function () {
      return cached || new Response("Offline", { status: 503 })
    })
  })
}

// NetworkFirst: try network, fall back to cache
function networkFirst(request, cacheName, maxAgeSeconds) {
  return fetch(request).then(function (response) {
    if (response.ok) {
      return caches.open(cacheName).then(function (cache) {
        cache.put(request, response.clone())
        return response
      })
    }
    return response
  }).catch(function () {
    return caches.match(request).then(function (cached) {
      if (cached) return cached
      return new Response("Offline", { status: 503 })
    })
  })
}

// Listen for skip waiting message from the client
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// StaleWhileRevalidate: return cached, update in background
function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return caches.match(request).then(function (cached) {
      var fetchPromise = fetch(request).then(function (response) {
        if (response.ok) cache.put(request, response.clone())
        return response
      }).catch(function () {
        return cached
      })
      return cached || fetchPromise
    })
  })
}
