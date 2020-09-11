const staticWeatherForecast = "the-weather-forecast-site-v1"
const assets = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/script.js",
  "/images/icon.png",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticWeatherForecast).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })
