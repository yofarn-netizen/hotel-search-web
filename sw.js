// 定義快取名稱 (如果更新了網站內容，可以修改版本號 v2, v3...)
const CACHE_NAME = 'hotel-radar-v1';

// 需要快取的檔案列表 (使用相對路徑 ./ 以適應 GitHub Pages)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // 注意：我們不快取外部的 RSS API 結果，確保每次打開都有機會抓到最新的
];

// 安裝 Service Worker 時，進行快取
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截網路請求
self.addEventListener('fetch', event => {
  // 對於 API 请求，我們優先使用網絡，失敗才回退到快取(如果有的話)
  if (event.request.url.includes('api.rss2json.com')) {
      event.respondWith(
          fetch(event.request).catch(() => caches.match(event.request))
      );
      return;
  }

  // 對於其他靜態資源，優先使用快取，加快載入速度
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取中有，就直接回傳快取
        if (response) {
          return response;
        }
        // 如果沒有，就去網路抓取
        return fetch(event.request);
      })
  );
});